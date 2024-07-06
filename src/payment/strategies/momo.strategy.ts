import { CartService } from '@cart/services/cart.service'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { Errors } from '@common/contracts/error'
import { AppException } from '@common/exceptions/app.exception'
import { HelperService } from '@common/services/helper.service'
import { MailerService } from '@nestjs-modules/mailer'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectConnection } from '@nestjs/mongoose'
import { OrderRepository } from '@order/repositories/order.repository'
import { OrderHistoryDto } from '@order/schemas/order.schema'
import { MomoResultCode } from '@payment/contracts/constant'
import {
  CreateMomoPaymentDto,
  MomoPaymentResponseDto,
  QueryMomoPaymentDto,
  RefundMomoPaymentDto
} from '@payment/dto/momo-payment.dto'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import { ProductRepository } from '@product/repositories/product.repository'
import { AxiosError } from 'axios'
import { get } from 'lodash'
import { Connection } from 'mongoose'
import { catchError, firstValueFrom } from 'rxjs'

@Injectable()
export class MomoPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(MomoPaymentStrategy.name)
  private config
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly helperService: HelperService,
    private readonly mailerService: MailerService
  ) {
    this.config = this.configService.get('payment.momo')
  }

  async createTransaction(createMomoPaymentDto: CreateMomoPaymentDto) {
    const { amount, extraData, ipnUrl, orderId, orderInfo, redirectUrl, requestId, requestType } = createMomoPaymentDto
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
    const signature = this.helperService.createSignature(rawSignature, this.config.secretKey)
    createMomoPaymentDto.partnerCode = this.config.partnerCode
    createMomoPaymentDto.signature = signature

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.config.endpoint}/v2/gateway/api/create`, createMomoPaymentDto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data)
          throw 'An error happened!'
        })
      )
    )
    console.log(data)
    data.deeplink = encodeURIComponent(data?.deeplink)
    return data
  }

  async getTransaction(queryDto: QueryMomoPaymentDto) {
    const { orderId, requestId } = queryDto
    const rawSignature = `accessKey=${this.config.accessKey}&orderId=${orderId}&partnerCode=${this.config.partnerCode}&requestId=${requestId}`
    const signature = this.helperService.createSignature(rawSignature, this.config.secretKey)
    const body = {
      partnerCode: this.config.partnerCode,
      requestId,
      orderId,
      lang: 'vi',
      signature
    }
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.config.endpoint}/v2/gateway/api/query`, body).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data)
          throw 'An error happened!'
        })
      )
    )
    console.log(data)
    return data
  }

  async refundTransaction(refundDto: RefundMomoPaymentDto) {
    const { amount, description, orderId, requestId, transId } = refundDto
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${this.config.partnerCode}&requestId=${requestId}&transId=${transId}`
    const signature = this.helperService.createSignature(rawSignature, this.config.secretKey)
    refundDto.partnerCode = this.config.partnerCode
    refundDto.signature = signature

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.config.endpoint}/v2/gateway/api/refund`, refundDto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data)
          throw 'An error happened!'
        })
      )
    )
    console.log(data)
    return data
  }

  async getRefundTransaction(queryDto: QueryMomoPaymentDto) {
    const { orderId, requestId } = queryDto
    const rawSignature = `accessKey=${this.config.accessKey}&orderId=${orderId}&partnerCode=${this.config.partnerCode}&requestId=${requestId}`
    const signature = this.helperService.createSignature(rawSignature, this.config.secretKey)
    const body = {
      partnerCode: this.config.partnerCode,
      requestId,
      orderId,
      lang: 'vi',
      signature
    }
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.config.endpoint}/v2/gateway/api/refund/query`, body).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data)
          throw 'An error happened!'
        })
      )
    )
    console.log(data)
    return data
  }

  async processWebhook(webhookData: MomoPaymentResponseDto) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Get order from orderId
      const orderId = get(webhookData, 'orderId')
      console.log('orderId', orderId, typeof orderId)

      const order = await this.orderRepository.findOne({
        conditions: {
          orderId: String(orderId)
        },
        projection: '+items'
      })
      if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
      this.logger.log('processWebhook: order', JSON.stringify(order))

      const isPaymentSuccess = get(webhookData, 'resultCode') === MomoResultCode.SUCCESS
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

      await session.commitTransaction()
      this.logger.log('processWebhook: SUCCESS!!!')
      return true
    } catch (error) {
      await session.abortTransaction()
      this.logger.error('processWebhook: catch', JSON.stringify(error))
      throw error
    }
  }

  verifyPaymentWebhookData(momoPaymentResponseDto: any): boolean {
    const {
      partnerCode,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      requestId,
      payType,
      responseTime,
      resultCode,
      transId
    } = momoPaymentResponseDto
    const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
    const signature = this.helperService.createSignature(rawSignature, this.config.secretKey)

    console.log(`1. ${momoPaymentResponseDto.signature}`)
    console.log(`2. ${signature}`)
    return momoPaymentResponseDto.signature !== signature
  }
}
