import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'

export class CreateMomoPaymentDto {
  @ApiProperty()
  partnerCode?: string

  @ApiProperty()
  partnerName: string

  @ApiProperty()
  orderInfo: string

  @ApiProperty()
  redirectUrl: string

  @ApiProperty()
  ipnUrl: string

  @ApiProperty()
  requestType: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  orderId: string

  @ApiProperty()
  requestId: string

  @ApiProperty()
  extraData: string

  @ApiProperty()
  autoCapture: boolean

  @ApiProperty()
  lang: 'vi' | 'en'

  @ApiProperty()
  orderExpireTime?: number

  @ApiProperty()
  signature?: string
}
export class CreateMomoPaymentResponse {
  @ApiProperty()
  partnerCode: string
  @ApiProperty()
  requestId: string
  @ApiProperty()
  orderId: string
  @ApiProperty()
  amount: number
  @ApiProperty()
  responseTime: number
  @ApiProperty()
  message: string
  @ApiProperty()
  resultCode: number
  @ApiProperty()
  payUrl: string
  @ApiProperty()
  shortLink: string
}
export class CreateMomoPaymentResponseDto extends DataResponse(CreateMomoPaymentResponse) {}

export class QueryMomoPaymentDto {
  @ApiProperty()
  partnerCode?: string

  @ApiProperty()
  orderId: string

  @ApiProperty()
  requestId: string

  @ApiProperty()
  lang: 'vi' | 'en'

  @ApiProperty()
  signature?: string
}
export class MomoPaymentResponseDto {
  @ApiProperty()
  partnerCode: string

  @ApiProperty()
  orderId: string

  @ApiProperty()
  requestId: string

  @ApiProperty()
  extraData: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  transId: number

  @ApiProperty()
  payType: string // web | qr | credit

  @ApiProperty()
  resultCode: number // https://developers.momo.vn/v3/docs/payment/api/result-handling/resultcode/

  @ApiProperty()
  refundTrans: MomoRefundTransactionDto[]

  @ApiProperty()
  message: string
  
  @ApiProperty()
  responseTime: number

  @ApiProperty()
  orderInfo?: string

  @ApiProperty()
  orderType?: string
  
  @ApiProperty()
  signature?: string
}

export class MomoRefundTransactionDto {
  @ApiProperty()
  orderId: string
  @ApiProperty()
  amount: number
  @ApiProperty()
  resultCode: number
  @ApiProperty()
  transId: number
  @ApiProperty()
  createdTime: number
}
export class RefundMomoPaymentDto {
  @ApiProperty()
  partnerCode?: string

  @ApiProperty()
  orderId: string

  @ApiProperty()
  requestId: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  transId: number

  @ApiProperty()
  lang: 'vi' | 'en'

  @ApiProperty()
  description?: string

  @ApiProperty()
  signature?: string
}
export class RefundMomoPaymentResponseDto {
  @ApiProperty()
  partnerCode: string
  @ApiProperty()
  orderId: string
  @ApiProperty()
  requestId: string
  @ApiProperty()
  amount: number
  @ApiProperty()
  transId: number
  @ApiProperty()
  resultCode: number
  @ApiProperty()
  message: string
  @ApiProperty()
  responseTime: number
}
