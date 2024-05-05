import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { PayOSStatus } from '@payment/contracts/constant'

export class CreatePayOSPaymentResponse {
  @ApiProperty()
  bin: string
  @ApiProperty()
  accountNumber: string
  @ApiProperty()
  accountName: string
  @ApiProperty()
  amount: number
  @ApiProperty()
  description: string
  @ApiProperty()
  orderCode: number
  @ApiProperty()
  currency: string
  @ApiProperty()
  paymentLinkId: string
  @ApiProperty({
    enum: PayOSStatus
  })
  status: PayOSStatus
  @ApiProperty()
  checkoutUrl: string
  @ApiProperty()
  qrCode: string
}
export class CreatePayOSPaymentResponseDto extends DataResponse(CreatePayOSPaymentResponse) {}

export class PayOSPaymentResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  orderCode: string

  @ApiProperty()
  amount: number

  @ApiProperty()
  amountPaid: number

  @ApiProperty()
  amountRemaining: number

  @ApiProperty({
    enum: PayOSStatus
  })
  status: PayOSStatus

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  transactions: TransactionType[]

  @ApiProperty()
  cancellationReason: string | null

  @ApiProperty()
  canceledAt: string | null
}

export class TransactionType {
  @ApiProperty({
    description: 'Mã tham chiếu của giao dịch'
  })
  reference: string
  @ApiProperty()
  amount: number
  @ApiProperty()
  accountNumber: string
  @ApiProperty()
  description: string
  @ApiProperty()
  transactionDateTime: string
  @ApiProperty()
  virtualAccountName: string | null
  @ApiProperty()
  virtualAccountNumber: string | null
  @ApiProperty()
  counterAccountBankId: string | null
  @ApiProperty()
  counterAccountBankName: string | null
  @ApiProperty()
  counterAccountName: string | null
  @ApiProperty()
  counterAccountNumber: string | null
}

export class PayOSRefundTransactionDto {
  @ApiProperty()
  orderId: string
  @ApiProperty()
  cancellationReason?: string
}
