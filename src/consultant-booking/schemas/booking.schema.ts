import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { BookingStatus, UserRole } from '@common/contracts/constant'
import { IsEmail, IsNotEmpty, IsPhoneNumber, MaxLength } from 'class-validator'
import { Category } from '@category/schemas/category.schema'
import { StaffDto } from '@staff/dto/staff.dto'

export class CustomerConsultantBookingDto {
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

export type ConsultantBookingDocument = HydratedDocument<ConsultantBooking>

@Schema({
  collection: 'consultant-bookings',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class ConsultantBooking {
  constructor(id?: string) {
    this._id = id
  }

  @Transform(({ value }) => value?.toString())
  _id: string

  @Prop({ type: CustomerConsultantBookingDto, required: true })
  customer: CustomerConsultantBookingDto

  @Prop({ type: Date, required: true })
  bookingDate: Date

  @Prop({
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  bookingStatus: BookingStatus

  @Prop({ type: [Category] })
  interestedCategories?: Category[]

  @Prop({ type: [BookingHistoryDto], select: false })
  bookingHistory: BookingHistoryDto[]

  @Prop({ type: StaffDto })
  consultant?: StaffDto

  @Prop({ type: String })
  notes?: string

  @Prop({ type: String })
  reason?: string
}

export const ConsultantBookingSchema = SchemaFactory.createForClass(ConsultantBooking)

ConsultantBookingSchema.plugin(paginate)
