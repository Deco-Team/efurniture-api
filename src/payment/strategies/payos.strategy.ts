import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PayOSRefundTransactionDto } from '@payment/dto/payos-payment.dto'
const PayOS = require('@payos/node')
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import {
  CheckoutRequestType,
  CheckoutResponseDataType,
  PaymentLinkDataType,
  WebhookDataType,
  WebhookType
} from '@payos/node/lib/type'

@Injectable()
export class PayOSPaymentStrategy implements IPaymentStrategy, OnModuleInit {
  private readonly logger = new Logger(PayOSPaymentStrategy.name)
  private config
  private payOS
  constructor(private readonly configService: ConfigService) {
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
      console.log(err)
    }
  }

  async verifyWebhookUrl() {
    const result = await this.payOS.confirmWebhook(`${this.configService.get('SERVER_URL')}/payment/webhook/payos`)
    console.log(result)
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

  verifyPaymentWebhookData(webhookBody: WebhookType): WebhookDataType | null {
    return this.payOS.verifyPaymentWebhookData(webhookBody)
  }
}
