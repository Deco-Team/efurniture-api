import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator'
import { AIPricingPlan } from '@ai-generation/contracts/constant'
import { PayOSStatus, PaymentMethod } from '@payment/contracts/constant'

export class CreateCreditPurchaseDto {
  @ApiProperty({
    enum: AIPricingPlan,
    example: 'PERSONAL | PREMIUM'
  })
  @IsNotEmpty()
  @IsEnum(AIPricingPlan)
  plan: string

  @ApiProperty({ enum: PaymentMethod, example: 'PAY_OS | MOMO' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod

  customerId?: string
}

export class CreditPurchaseDto {
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

export class CreditPurchaseResponseDto extends DataResponse(CreditPurchaseDto) {}