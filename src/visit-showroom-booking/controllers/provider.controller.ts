import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, PaginationQuery } from '@common/contracts/dto'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'
import { VisitShowroomBookingService } from '@visit-showroom-booking/services/booking.service'
import { VisitShowroomBookingPaginateResponseDto, VisitShowroomBookingResponseDto } from '@visit-showroom-booking/dto/booking.dto'

@ApiTags('VisitShowroomBooking - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN)
@Controller('provider')
export class VisitShowroomBookingProviderController {
  constructor(private readonly visitShowroomBookingService: VisitShowroomBookingService) {}

  @Get()
  @ApiOperation({
    summary: 'Get visit showroom bookings list'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiQuery({ type: PaginationQuery })
  @ApiOkResponse({ type: VisitShowroomBookingPaginateResponseDto })
  async paginate(@Pagination() paginationParams: PaginationParams) {
    return await this.visitShowroomBookingService.paginate({}, paginationParams)
  }

  @Get(':bookingId')
  @ApiOperation({
    summary: 'Get visit showroom booking details'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: VisitShowroomBookingResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getOne(@Req() req, @Param('bookingId', ParseObjectIdPipe) bookingId: string) {
    return await this.visitShowroomBookingService.getOne({ _id: bookingId })
  }
}
