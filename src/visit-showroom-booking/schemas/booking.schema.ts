import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { BookingStatus, UserRole } from '@common/contracts/constant'
import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength } from 'class-validator'
import { Category } from '@category/schemas/category.schema'

export class CustomerDto {
  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  _id?: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string
}

export class BookingHistoryDto {
  constructor(bookingStatus: BookingStatus, userId: string, userRole: UserRole) {
    this.bookingStatus = bookingStatus
    this.timestamp = new Date()
    this.userId = userId
    this.userRole = userRole
  }

  @ApiProperty()
  bookingStatus: BookingStatus

  @ApiProperty()
  timestamp: Date

  @ApiProperty()
  userId: string

  @ApiProperty()
  userRole: UserRole
}

export type VisitShowroomBookingDocument = HydratedDocument<VisitShowroomBooking>

@Schema({
  collection: 'visit-showroom-bookings',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class VisitShowroomBooking {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty({ type: CustomerDto })
  @Prop({ type: CustomerDto, required: true })
  customer: CustomerDto

  @ApiProperty()
  @Prop({ type: Date, required: true })
  bookingDate: Date

  @ApiProperty()
  @Prop({
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  bookingStatus: BookingStatus

  @ApiPropertyOptional({ isArray: true, type: Category })
  @Prop({ type: [Category] })
  interestedCategories?: Category[]

  @Prop({ type: [BookingHistoryDto], select: false })
  bookingHistory: BookingHistoryDto[]

  @ApiPropertyOptional()
  @Prop({ type: String })
  notes?: string

  @Prop({ type: String })
  reason?: string
}

export const VisitShowroomBookingSchema = SchemaFactory.createForClass(VisitShowroomBooking)

VisitShowroomBookingSchema.plugin(paginate)
