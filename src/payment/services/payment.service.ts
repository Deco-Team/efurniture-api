import { Injectable, Logger } from '@nestjs/common'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import { MomoPaymentResponseDto, QueryMomoPaymentDto, RefundMomoPaymentDto } from '@payment/dto/momo-payment.dto'
import { MomoPaymentStrategy } from '@payment/strategies/momo.strategy'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery } from 'mongoose'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { TransactionStatus } from '@common/contracts/constant'
import { PaymentMethod } from '@payment/contracts/constant'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Payment } from '@payment/schemas/payment.schema'
import { PayOSPaymentStrategy } from '@payment/strategies/payos.strategy'
import { WebhookType as PayOSWebhookData } from '@payos/node/lib/type'
import { ZaloPayPaymentStrategy } from '@payment/strategies/zalopay.strategy'

@Injectable()
export class PaymentService {
  private strategy: IPaymentStrategy
  private readonly logger = new Logger(PaymentService.name)
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly paymentRepository: PaymentRepository,
    private readonly momoPaymentStrategy: MomoPaymentStrategy,
    private readonly zaloPayPaymentStrategy: ZaloPayPaymentStrategy,
    readonly payOSPaymentStrategy: PayOSPaymentStrategy
  ) {}

  public setStrategy(paymentMethod: PaymentMethod) {
    switch (paymentMethod) {
      case PaymentMethod.MOMO:
        this.strategy = this.momoPaymentStrategy
        break
      case PaymentMethod.ZALO_PAY:
        this.strategy = this.zaloPayPaymentStrategy
        break
      case PaymentMethod.PAY_OS:
      default:
        this.strategy = this.payOSPaymentStrategy
        break
    }
  }

  public verifyPaymentWebhookData(webhookData: any) {
    return this.strategy.verifyPaymentWebhookData(webhookData)
  }

  public createTransaction(createPaymentDto: any) {
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

  public async processWebhook(webhookData: MomoPaymentResponseDto | PayOSWebhookData) {
    this.logger.log('processWebhook::', JSON.stringify(webhookData))
    return this.strategy.processWebhook(webhookData)
  }
}
