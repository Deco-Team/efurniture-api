import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { ErrorResponse, IDDataResponse } from '@common/contracts/dto'
import { VisitShowroomBookingService } from '@visit-showroom-booking/services/booking.service'
import { CreateVisitShowroomBookingDto } from '@visit-showroom-booking/dto/booking.dto'

@ApiTags('VisitShowroomBooking - Customer')
@Controller('customer')
export class VisitShowroomBookingCustomerController {
  constructor(private readonly visitShowroomBookingService: VisitShowroomBookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new visit showroom booking'
  })
  @ApiOkResponse({ type: IDDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createBooking(@Req() req, @Body() createVisitShowroomBookingDto: CreateVisitShowroomBookingDto) {
    const result = await this.visitShowroomBookingService.createBooking(createVisitShowroomBookingDto)
    return result
  }
}
