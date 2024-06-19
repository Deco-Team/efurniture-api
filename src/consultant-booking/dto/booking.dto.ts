import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { BookingHistoryDto, CustomerConsultantBookingDto } from '@consultant-booking/schemas/booking.schema'
import { DataResponse, PaginateResponse } from '@common/contracts/openapi-builder'
import { BookingStatus } from '@common/contracts/constant'
import { Category } from '@category/schemas/category.schema'
import { StaffDto } from '@staff/dto/staff.dto'

export class CreateConsultantBookingDto {
  @ApiProperty({ type: () => CustomerConsultantBookingDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerConsultantBookingDto)
  customer: CustomerConsultantBookingDto

  @ApiProperty()
  @IsDateString()
  bookingDate: Date

  @ApiProperty({ type: String, isArray: true, example: ['65b7805c041a5a29734ce110'] })
  @IsNotEmpty()
  @IsMongoId({ each: true })
  interestedCategories: string[]

  @ApiPropertyOptional({ type: String, example: '65b7805c041a5a29734ce110' })
  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  consultantId: string

  @ApiPropertyOptional()
  @MaxLength(256)
  notes?: string

  bookingHistory?: BookingHistoryDto[]
}

export class ConsultantBookingDto {
  @ApiProperty()
  _id: string

  @ApiProperty({ type: CustomerConsultantBookingDto })
  customer: CustomerConsultantBookingDto

  @ApiProperty()
  bookingDate: Date

  @ApiProperty()
  bookingStatus: BookingStatus

  @ApiPropertyOptional({ isArray: true, type: Category })
  interestedCategories?: Category[]

  @ApiPropertyOptional()
  consultant?: StaffDto

  @ApiPropertyOptional()
  notes?: string
}

export class ConsultantBookingPaginateResponseDto extends DataResponse(
  class ConsultantBookingPaginateResponse extends PaginateResponse(ConsultantBookingDto) {}
) {}

export class ConsultantBookingResponseDto extends DataResponse(ConsultantBookingDto) {}