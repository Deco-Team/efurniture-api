import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, PaginationQuery } from '@common/contracts/dto'
import { ConsultantBookingService } from '@consultant-booking/services/booking.service'
import { ConsultantBookingPaginateResponseDto, ConsultantBookingResponseDto } from '@consultant-booking/dto/booking.dto'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { Types } from 'mongoose'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'

@ApiTags('ConsultantBooking - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN)
@Controller('provider')
export class ConsultantBookingProviderController {
  constructor(private readonly consultantBookingService: ConsultantBookingService) {}

  @Get()
  @ApiOperation({
    summary: "Get consultant's bookings list"
  })
  @Roles(UserRole.CONSULTANT_STAFF, UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiQuery({ type: PaginationQuery })
  @ApiOkResponse({ type: ConsultantBookingPaginateResponseDto })
  async paginate(@Req() req, @Pagination() paginationParams: PaginationParams) {
    const { _id, role } = _.get(req, 'user')
    if ([UserRole.ADMIN, UserRole.STAFF].includes(role)) {
      return await this.consultantBookingService.paginate({}, paginationParams)
    }

    const staffId = _id
    return await this.consultantBookingService.paginate(
      { 'consultant._id': new Types.ObjectId(staffId) },
      paginationParams
    )
  }

  @Get(':bookingId')
  @ApiOperation({
    summary: 'Get consultant booking details'
  })
  @Roles(UserRole.CONSULTANT_STAFF, UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: ConsultantBookingResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getOne(@Req() req, @Param('bookingId', ParseObjectIdPipe) bookingId: string) {
    const { _id, role } = _.get(req, 'user')
    if ([UserRole.ADMIN, UserRole.STAFF].includes(role)) {
      return await this.consultantBookingService.getOne({ _id: bookingId })
    }

    const staffId = _id
    return await this.consultantBookingService.getOne({ 'consultant._id': new Types.ObjectId(staffId), _id: bookingId })
  }
}
