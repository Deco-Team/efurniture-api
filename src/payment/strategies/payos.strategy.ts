import { AIPricingPlan, AIPricingPlanCost, AIPricingPlanCredits } from '@ai-generation/contracts/constant'
import { CartService } from '@cart/services/cart.service'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { Errors } from '@common/contracts/error'
import { AppException } from '@common/exceptions/app.exception'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectConnection } from '@nestjs/mongoose'
import { OrderRepository } from '@order/repositories/order.repository'
import { OrderHistoryDto } from '@order/schemas/order.schema'
import { PayOSResultCode, PaymentType } from '@payment/contracts/constant'
import { PayOSRefundTransactionDto } from '@payment/dto/payos-payment.dto'
import { PaymentRepository } from '@payment/repositories/payment.repository'
const PayOS = require('@payos/node')
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import {
  CheckoutRequestType,
  CheckoutResponseDataType,
  PaymentLinkDataType,
  WebhookDataType,
  WebhookType
} from '@payos/node/lib/type'
import { ProductRepository } from '@product/repositories/product.repository'
import { get } from 'lodash'
import { Connection } from 'mongoose'

@Injectable()
export class PayOSPaymentStrategy implements IPaymentStrategy, OnModuleInit {
  private readonly logger = new Logger(PayOSPaymentStrategy.name)
  private config
  private payOS
  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly mailerService: MailerService
  ) {
    this.config = this.configService.get('payment.payos')
    this.payOS = new PayOS(this.config.clientId, this.config.apiKey, this.config.checksumKey)
  }

  async onModuleInit() {
    try {
      this.logger.log(`The ${PayOSPaymentStrategy.name} has been initialized.`)

      // success => redirect https://f06e-116-98-183-38.ngrok-free.app/return?code=00&id=887fb96024fc4c4eb1dd28ca11e59d9c&cancel=false&status=PAID&orderCode=1234567
      // Query params: https://payos.vn/docs/du-lieu-tra-ve/return-url/

      // const paymentLinkRes = await this.payOS.createPaymentLink(body)
      // console.log('paymentLinkRes', paymentLinkRes)
      // const paymentLink = await this.payOS.getPaymentLinkInformation('1234567')
      // console.log('paymentLink', paymentLink)
    } catch (err) {
      this.logger.log(err)
    }
  }

  async verifyWebhookUrl() {
    const result = await this.payOS.confirmWebhook(`${this.configService.get('SERVER_URL')}/payment/webhook/payos`)
    this.logger.log(result)
  }

  async createTransaction(checkoutRequestType: CheckoutRequestType): Promise<CheckoutResponseDataType> {
    const paymentLinkRes = await this.payOS.createPaymentLink(checkoutRequestType)
    return paymentLinkRes
  }

  async getTransaction(orderCode: string): Promise<PaymentLinkDataType> {
    const paymentLink = await this.payOS.getPaymentLinkInformation(orderCode)
    return paymentLink
  }

  async refundTransaction(refundDto: PayOSRefundTransactionDto) {}

  async getRefundTransaction(queryDto: any) {}

  async processWebhook(webhookData: WebhookType) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Get order from orderId
      const orderId = get(webhookData, 'data.orderCode')
      this.logger.log('processWebhook: orderId ', orderId)

      const payment = await this.paymentRepository.findOne({
        conditions: {
          'transaction.orderCode': orderId
        }
      })
      switch (payment?.paymentType) {
        case PaymentType.ORDER:
          await this.processWebhookOrder({ orderId, webhookData, session })
          break
        case PaymentType.AI:
          await this.processWebhookAI({ orderId, webhookData, customerId: payment?.customerId, session })
          break
      }
      await session.commitTransaction()
      this.logger.log('processWebhook: SUCCESS!!!')
      return true
    } catch (error) {
      await session.abortTransaction()
      this.logger.error('processWebhook: catch', JSON.stringify(error))
      throw error
    }
  }

  verifyPaymentWebhookData(webhookBody: WebhookType): WebhookDataType | null {
    return this.payOS.verifyPaymentWebhookData(webhookBody)
  }

  private async processWebhookOrder({ orderId, webhookData, session }) {
    const order = await this.orderRepository.findOne({
      conditions: {
        orderId: String(orderId)
      },
      projection: '+items'
    })
    if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
    this.logger.log('processWebhook: order', JSON.stringify(order))

    const isPaymentSuccess = get(webhookData, 'code') === PayOSResultCode.SUCCESS
    if (isPaymentSuccess) {
      this.logger.log('processWebhook: payment SUCCESS')
      // Payment success
      // 1. Fetch product in cart items
      const { _id: cartId, items, totalAmount: cartTotalAmount } = await this.cartService.getCart(order.customer._id)
      if (items.length === 0) throw new AppException(Errors.CART_EMPTY)
      let cartItems = items
      let totalAmount = 0
      let orderItems = order.items
      // array to process bulk update
      const operations = []

      orderItems = orderItems.map((orderItem) => {
        // 2. Check valid dto with cartItems
        const index = cartItems.findIndex((cartItem) => {
          return cartItem.productId == orderItem.productId && cartItem.sku === orderItem.sku
        })
        if (index === -1) throw new AppException(Errors.ORDER_ITEMS_INVALID)

        const { product, quantity } = cartItems[index]
        const variant = product?.variants?.find((variant) => variant.sku === orderItem.sku)
        if (!variant) throw new AppException(Errors.ORDER_ITEMS_INVALID)

        // 3. Check remain quantity in inventory
        const { sku, quantity: remainQuantity, price } = variant
        if (quantity > remainQuantity) throw new AppException(Errors.ORDER_ITEMS_INVALID)
        totalAmount += price * quantity

        // 4. Subtract items in cart
        cartItems.splice(index, 1)

        // 5. Push update quantity in product.variants to operation to execute later
        operations.push({
          updateOne: {
            filter: { 'variants.sku': sku },
            update: { $set: { 'variants.$.quantity': remainQuantity - quantity } },
            session
          }
        })

        return {
          ...orderItem,
          quantity,
          product: product.toJSON()
        }
      })

      // 5. Update new cart
      cartItems = cartItems.map((item) => {
        delete item.product // remove product populate before update
        return item
      })
      await this.cartService.cartRepository.findOneAndUpdate(
        {
          _id: cartId
        },
        {
          items: cartItems,
          totalAmount: cartTotalAmount - totalAmount
        },
        {
          session
        }
      )

      // 6. Bulk write Update quantity in product.variants
      await this.productRepository.model.bulkWrite(operations)

      // 7.  Update payment transactionStatus, transaction
      const transaction = webhookData

      const payment = await this.paymentRepository.findOneAndUpdate(
        {
          _id: order.payment._id
        },
        {
          $set: {
            transactionStatus: TransactionStatus.CAPTURED,
            transaction: transaction
          },
          $push: { transactionHistory: transaction }
        },
        {
          session,
          new: true
        }
      )

      // 8. Update order transactionStatus
      const orderHistory = new OrderHistoryDto(
        OrderStatus.PENDING,
        TransactionStatus.CAPTURED,
        order.customer._id,
        UserRole.CUSTOMER
      )
      await this.orderRepository.findOneAndUpdate(
        {
          _id: order._id
        },
        {
          $set: {
            transactionStatus: TransactionStatus.CAPTURED,
            payment
          },
          $push: { orderHistory }
        },
        {
          session
        }
      )
      // 9. Send email/notification to customer
      await this.mailerService.sendMail({
        to: order.customer.email,
        subject: `[Furnique] Đã nhận đơn hàng #${order.orderId}`,
        template: 'order-created',
        context: {
          ...order.toJSON(),
          _id: order._id,
          orderId: order.orderId,
          customer: order.customer,
          items: order.items.map((item) => {
            const variant = item.product.variants.find((variant) => variant.sku === item.sku)
            return {
              ...item,
              product: {
                ...item.product,
                variant: {
                  ...variant,
                  price: Intl.NumberFormat('en-DE').format(variant.price)
                }
              }
            }
          }),
          totalAmount: Intl.NumberFormat('en-DE').format(order.totalAmount)
        }
      })
      // 10. Send notification to staff
    } else {
      // Payment failed
      this.logger.log('processWebhook: payment FAILED')
      // 1.  Update payment transactionStatus, transaction
      const payment = await this.paymentRepository.findOneAndUpdate(
        {
          _id: order.payment._id
        },
        {
          $set: {
            transactionStatus: TransactionStatus.ERROR,
            transaction: webhookData,
            transactionHistory: [webhookData]
          }
        },
        {
          session,
          new: true
        }
      )

      // 1. Update order transactionStatus
      const orderHistory = new OrderHistoryDto(
        OrderStatus.PENDING,
        TransactionStatus.ERROR,
        order.customer._id,
        UserRole.CUSTOMER
      )
      await this.orderRepository.findOneAndUpdate(
        {
          _id: order._id
        },
        {
          $set: {
            transactionStatus: TransactionStatus.ERROR,
            payment: payment
          },
          $push: { orderHistory }
        },
        {
          session
        }
      )
    }
  }

  private async processWebhookAI({ orderId, webhookData, customerId, session }) {
    const isPaymentSuccess = get(webhookData, 'code') === PayOSResultCode.SUCCESS
    if (isPaymentSuccess) {
      this.logger.log('processWebhook: payment SUCCESS')
      // Payment success
      // 1.  Update payment transactionStatus, transaction
      const transaction = await this.getTransaction(get(webhookData, 'data.orderCode'))
      await this.paymentRepository.findOneAndUpdate(
        {
          'transaction.orderCode': orderId
        },
        {
          $set: {
            transactionStatus: TransactionStatus.CAPTURED,
            transaction: transaction
          },
          $push: { transactionHistory: transaction }
        },
        {
          session,
          new: true
        }
      )

      // 2. Update credits for customer
      let credits = 0
      switch (get(webhookData, 'data.amount')) {
        case AIPricingPlanCost[AIPricingPlan.PERSONAL]:
          credits = AIPricingPlanCredits[AIPricingPlan.PERSONAL]
          break
        case AIPricingPlanCost[AIPricingPlan.PREMIUM]:
          credits = AIPricingPlanCredits[AIPricingPlan.PREMIUM]
          break
      }
      this.logger.log('processWebhook: credits ', credits)
      await this.customerRepository.findOneAndUpdate(
        { _id: customerId },
        {
          $inc: {
            credits
          }
        }
      )

      // 3. Send email/notification to customer
      // 4. Send notification to staff
    } else {
      // Payment failed
      this.logger.log('processWebhook: payment FAILED')
      // 1.  Update payment transactionStatus, transaction
      await this.paymentRepository.findOneAndUpdate(
        {
          'transaction.orderCode': orderId
        },
        {
          $set: {
            transactionStatus: TransactionStatus.ERROR,
            transaction: webhookData,
            transactionHistory: [webhookData]
          }
        },
        {
          session,
          new: true
        }
      )

      // 2. No update credits for customer
    }
  }
}
