import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { PaymentService } from '@payment/services/payment.service'
import { Roles } from '@auth/decorators/roles.decorator'
import { UserRole } from '@common/contracts/constant'
import { PaginationQuery } from '@common/contracts/dto'
import { RolesGuard } from '@auth/guards/roles.guard'
import { PaymentPaginateResponseDto } from '@payment/dto/payment.dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { WebhookType } from '@payos/node/lib/type'
import { PaymentMethod } from '@payment/contracts/constant'

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({
    summary: 'Get transaction list of payment'
  })
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
  @ApiOkResponse({ type: PaymentPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  paginate(@Pagination() paginationParams: PaginationParams) {
    return this.paymentService.getPaymentList({}, paginationParams)
  }

  @ApiOperation({
    summary: 'Webhook Handler for Instant Payment Notification (MOMO)'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('webhook/momo')
  webhookMomo(@Body() momoPaymentResponseDto) {
    console.log('Handling MOMO webhook', JSON.stringify(momoPaymentResponseDto))
    this.paymentService.setStrategy(PaymentMethod.MOMO)

    //1. Validate signature with other data
    const result = this.paymentService.verifyPaymentWebhookData(momoPaymentResponseDto)
    if (!result) return false

    //2. Process webhook
    this.paymentService.setStrategy(PaymentMethod.MOMO)
    return this.paymentService.processWebhook(momoPaymentResponseDto)
  }

  @ApiOperation({
    summary: 'Webhook Handler for PAYOS'
  })
  @Post('webhook/payos')
  webhook(@Body() webhookData: WebhookType) {
    console.log('Handling PAYOS webhook', JSON.stringify(webhookData))
    this.paymentService.setStrategy(PaymentMethod.PAY_OS)

    // // just skip for confirmWebhook
    // if (webhookData.data.orderCode == 123) return true

    //1. Validate signature with other data
    const result = this.paymentService.verifyPaymentWebhookData(webhookData)
    if (!result) return false

    //2. Process webhook
    this.paymentService.setStrategy(PaymentMethod.PAY_OS)
    return this.paymentService.processWebhook(webhookData)
  }

  // @ApiOperation({
  //   summary: 'Confirm  Webhook URL for PAYOS'
  // })
  // @Post('webhook/payos-confirm')
  // async verifyWebhook() {
  //   console.log('Handling Confirm  Webhook URL for PAYOS')

  //   await this.paymentService.payOSPaymentStrategy.verifyWebhookUrl()
  // }
}
