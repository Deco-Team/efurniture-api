import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, IDDataResponse, PaginationQuery } from '@common/contracts/dto'
import { ConsultantBookingService } from '@consultant-booking/services/booking.service'
import { ConsultantBookingPaginateResponseDto, CreateConsultantBookingDto } from '@consultant-booking/dto/booking.dto'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'

@ApiTags('ConsultantBooking - Customer')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('customer')
export class ConsultantBookingCustomerController {
  constructor(private readonly consultantBookingService: ConsultantBookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new consultant booking'
  })
  @ApiOkResponse({ type: IDDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createBooking(@Req() req, @Body() createConsultantBookingDto: CreateConsultantBookingDto) {
    createConsultantBookingDto.customer._id = _.get(req, 'user._id')
    const result = await this.consultantBookingService.createBooking(createConsultantBookingDto)
    return result
  }

  @Get()
  @ApiOperation({
    summary: "Get customer's consultant bookings list"
  })
  @ApiQuery({ type: PaginationQuery })
  @ApiOkResponse({ type: ConsultantBookingPaginateResponseDto})
  async paginate(@Req() req, @Pagination() paginationParams: PaginationParams) {
    const customerId = _.get(req, 'user._id')
    return await this.consultantBookingService.paginate({ 'customer._id': customerId }, paginationParams)
  }
}
