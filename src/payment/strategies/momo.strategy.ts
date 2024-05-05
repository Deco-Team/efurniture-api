import { HelperService } from '@common/services/helper.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateMomoPaymentDto, QueryMomoPaymentDto, RefundMomoPaymentDto } from '@payment/dto/momo-payment.dto'
import { IPaymentStrategy } from '@payment/strategies/payment-strategy.interface'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

@Injectable()
export class MomoPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(MomoPaymentStrategy.name)
  private config
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly helperService: HelperService
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
