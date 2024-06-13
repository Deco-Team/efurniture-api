export interface IPaymentStrategy {
  createTransaction(paymentDto: any): any
  getTransaction(queryDto: any): any
  refundTransaction(refundDto: any): any
  getRefundTransaction(queryRefundDto: any): any
  processWebhook(webhookData: any): any
  verifyPaymentWebhookData(webhookData: any): any
}
