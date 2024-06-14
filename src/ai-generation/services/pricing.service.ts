import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AIPricingPlanCost } from '@ai-generation/contracts/constant'
import { TransactionStatus } from '@common/contracts/constant'
import { CreateCreditPurchaseDto } from '@ai-generation/dtos/pricing.dto'
import { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'
import { CheckoutRequestType, CheckoutResponseDataType, PaymentLinkDataType } from '@payos/node/lib/type'
import { CreateMomoPaymentResponse } from '@payment/dto/momo-payment.dto'
import { PaymentMethod, PaymentType } from '@payment/contracts/constant'
import { PaymentService } from '@payment/services/payment.service'
import { PaymentRepository } from '@payment/repositories/payment.repository'

@Injectable()
export class AIGenerationPricingService {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async createPayment(createCreditPurchaseDto: CreateCreditPurchaseDto) {
    const { customerId, plan } = createCreditPurchaseDto
    try {
      // 1. Calculate plan cost
      const totalAmount = AIPricingPlanCost[plan]

      // 2. Process transaction
      let paymentResponseData: CreateMomoPaymentResponse | PaymentLinkDataType
      let checkoutData: CreateMomoPaymentResponse | CheckoutResponseDataType
      const MAX_VALUE = 9_007_199_254_740_991
      const MIM_VALUE = 1_000_000_000_000_000
      const orderCode = Math.floor(MIM_VALUE + Math.random() * (MAX_VALUE - MIM_VALUE))
      createCreditPurchaseDto['paymentMethod'] = PaymentMethod.PAY_OS
      switch (createCreditPurchaseDto.paymentMethod) {
        case PaymentMethod.PAY_OS:
        default:
          this.paymentService.setStrategy(PaymentMethod.PAY_OS)
          const checkoutRequestType: CheckoutRequestType = {
            orderCode: orderCode,
            amount: totalAmount,
            description: `FUR - Purchase credits`,
            items: [
              {
                name: plan,
                quantity: 1,
                price: totalAmount
              }
            ],
            cancelUrl: `${this.configService.get('WEB_URL')}/pricing`,
            returnUrl: `${this.configService.get('WEB_URL')}/ai`
          }
          checkoutData = await this.paymentService.createTransaction(checkoutRequestType)
          paymentResponseData = await this.paymentService.getTransaction(checkoutData['orderCode'])
          break
      }

      // 3. Create payment
      await this.paymentRepository.create({
        customerId,
        transactionStatus: TransactionStatus.DRAFT,
        transaction: paymentResponseData,
        transactionHistory: [paymentResponseData],
        paymentMethod: createCreditPurchaseDto.paymentMethod,
        amount: totalAmount,
        paymentType: PaymentType.AI
      })
      return checkoutData
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
