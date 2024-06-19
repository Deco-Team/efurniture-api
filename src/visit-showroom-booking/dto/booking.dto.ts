import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsMongoId, IsNotEmpty, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { BookingHistoryDto, CustomerDto } from '@visit-showroom-booking/schemas/booking.schema'
import { BookingStatus } from '@common/contracts/constant'
import { Category } from '@category/schemas/category.schema'
import { DataResponse, PaginateResponse } from '@common/contracts/openapi-builder'

export class CreateVisitShowroomBookingDto {
  @ApiProperty({ type: () => CustomerDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto

  @ApiProperty()
  @IsDateString()
  bookingDate: Date

  @ApiProperty({ type: String, isArray: true, example: ['65b7805c041a5a29734ce110'] })
  @IsNotEmpty()
  @IsMongoId({ each: true })
  interestedCategories: string[]

  @ApiPropertyOptional()
  @MaxLength(256)
  notes?: string

  bookingHistory?: BookingHistoryDto[]
}

export class VisitShowroomBookingDto {
  @ApiProperty()
  _id: string

  @ApiProperty({ type: CustomerDto })
  customer: CustomerDto

  @ApiProperty()
  bookingDate: Date

  @ApiProperty()
  bookingStatus: BookingStatus

  @ApiPropertyOptional({ isArray: true, type: Category })
  interestedCategories?: Category[]

  @ApiPropertyOptional()
  notes?: string
}

export class VisitShowroomBookingPaginateResponseDto extends DataResponse(
  class VisitShowroomBookingPaginateResponse extends PaginateResponse(VisitShowroomBookingDto) {}
) {}

export class VisitShowroomBookingResponseDto extends DataResponse(VisitShowroomBookingDto) {}