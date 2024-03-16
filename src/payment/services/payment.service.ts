import { Injectable, Logger } from '@nestjs/common'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import {
  CreateMomoPaymentDto,
  MomoPaymentResponseDto,
  QueryMomoPaymentDto,
  RefundMomoPaymentDto
} from '@payment/dto/momo-payment.dto'
import { MomoPaymentStrategy } from '@payment/strategies/momo.strategy'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery } from 'mongoose'
import { OrderRepository } from '@order/repositories/order.repository'
import { CartService } from '@cart/services/cart.service'
import { ProductRepository } from '@product/repositories/product.repository'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { OrderHistoryDto } from '@order/schemas/order.schema'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { MomoResultCode } from '@payment/contracts/constant'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Payment } from '@payment/schemas/payment.schema'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class PaymentService {
  private strategy: IPaymentStrategy
  private readonly logger = new Logger(PaymentService.name)
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
    readonly momoPaymentStrategy: MomoPaymentStrategy,
    private readonly mailerService: MailerService
  ) {}

  public setStrategy(strategy: IPaymentStrategy) {
    this.strategy = strategy
  }

  public createTransaction(createPaymentDto: CreateMomoPaymentDto) {
    return this.strategy.createTransaction(createPaymentDto)
  }

  public getTransaction(queryPaymentDto: QueryMomoPaymentDto) {
    return this.strategy.getTransaction(queryPaymentDto)
  }

  public refundTransaction(refundPaymentDto: RefundMomoPaymentDto) {
    return this.strategy.refundTransaction(refundPaymentDto)
  }

  public getRefundTransaction(queryPaymentDto: QueryMomoPaymentDto) {
    return this.strategy.getRefundTransaction(queryPaymentDto)
  }

  public async getPaymentList(filter: FilterQuery<Payment>, paginationParams: PaginationParams) {
    const result = await this.paymentRepository.paginate(
      {
        ...filter,
        transactionStatus: {
          $in: [TransactionStatus.CAPTURED, TransactionStatus.REFUNDED]
        }
      },
      {
        projection: '-transactionHistory',
        ...paginationParams
      }
    )
    return result
  }

  public async processWebhook(momoPaymentResponseDto: MomoPaymentResponseDto) {
    this.logger.log('processWebhook: momoPaymentResponseDto', JSON.stringify(momoPaymentResponseDto))
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Get order from orderId
      const order = await this.orderRepository.findOne({
        conditions: {
          orderId: momoPaymentResponseDto.orderId
        },
        projection: '+items'
      })
      if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
      this.logger.log('processWebhook: order', JSON.stringify(order))

      if (momoPaymentResponseDto.resultCode === MomoResultCode.SUCCESS) {
        this.logger.log('processWebhook: resultCode SUCCESS', momoPaymentResponseDto.resultCode)
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

        // 7. Update order transactionStatus
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
              'payment.transactionStatus': TransactionStatus.CAPTURED,
              'payment.transaction': momoPaymentResponseDto,
              'payment.transactionHistory': [momoPaymentResponseDto]
            },
            $push: { orderHistory }
          },
          {
            session
          }
        )

        // 8.  Update payment transactionStatus, transaction
        await this.paymentRepository.findOneAndUpdate(
          {
            _id: order.payment._id
          },
          {
            $set: {
              transactionStatus: TransactionStatus.CAPTURED,
              transaction: momoPaymentResponseDto,
              transactionHistory: [momoPaymentResponseDto]
            }
          },
          {
            session
          }
        )
        // 9. Send email/notification to customer
        this.mailerService.sendMail({
          to: order.customer.email,
          subject: `[Furnique] Đã nhận đơn hàng #${order.orderId}`,
          template: 'order-created',
          context: {
            ...order,
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
        this.logger.log('processWebhook: resultCode FAILED', momoPaymentResponseDto.resultCode)
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
              'payment.transactionStatus': TransactionStatus.ERROR,
              'payment.transaction': momoPaymentResponseDto,
              'payment.transactionHistory': [momoPaymentResponseDto]
            },
            $push: { orderHistory }
          },
          {
            session
          }
        )

        // 2.  Update payment transactionStatus, transaction
        await this.paymentRepository.findOneAndUpdate(
          {
            _id: order.payment._id
          },
          {
            $set: {
              transactionStatus: TransactionStatus.ERROR,
              transaction: momoPaymentResponseDto,
              transactionHistory: [momoPaymentResponseDto]
            }
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
}
