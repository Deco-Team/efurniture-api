import { ApiProperty } from '@nestjs/swagger'
import { TransactionStatus } from '@common/contracts/constant'
import { PaymentMethod } from '@payment/contracts/constant'
import { DataResponse, PaginateResponse } from '@common/contracts/openapi-builder'
import { PayOSPaymentResponseDto } from './payos-payment.dto'

export class PaymentDto {
  @ApiProperty()
  _id: string

  @ApiProperty({ enum: TransactionStatus })
  transactionStatus: TransactionStatus

  @ApiProperty()
  transaction: PayOSPaymentResponseDto

  @ApiProperty({ isArray: true, type: PayOSPaymentResponseDto })
  transactionHistory: PayOSPaymentResponseDto[]

  @ApiProperty({
    enum: PaymentMethod
  })
  paymentMethod: PaymentMethod

  @ApiProperty()
  amount: number
}

export class PaymentPaginateResponseDto extends DataResponse(
  class PaymentPaginateResponse extends PaginateResponse(PaymentDto) {}
) {}
