import { Injectable } from '@nestjs/common'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'

@Injectable()
export class ZaloPayPaymentStrategy implements IPaymentStrategy {
  createTransaction(data: any): void {}
  getTransaction(queryDto: any): any {}
  refundTransaction(refundDto: any): any {}
  getRefundTransaction(queryRefundDto: any): any {}
  processWebhook(webhookData: any) {}
  verifyPaymentWebhookData(webhookData: any): any {}
}
