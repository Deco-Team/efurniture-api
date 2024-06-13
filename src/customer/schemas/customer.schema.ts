import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Gender, Status } from '@common/contracts/constant'
import { DEFAULT_CREDITS } from '@ai-generation/contracts/constant'

export type CustomerDocument = HydratedDocument<Customer>

@Schema({
  collection: 'customers',
  timestamps: {
    createdAt: true,
    updatedAt: true
  },
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Customer {
  constructor(id?: string) {
    this._id = id
  }
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String, maxlength: 30, required: true })
  firstName: string

  @ApiProperty()
  @Prop({ type: String, maxlength: 30, default: '' })
  lastName: string

  @ApiProperty()
  @Prop({
    type: String,
    required: true
  })
  email: string

  @ApiProperty()
  @Prop({
    type: String
  })
  phone: string

  @ApiProperty()
  @Prop({ type: Array<String> })
  address: string[]

  @ApiProperty()
  @Prop({ type: Date })
  dateOfBirth: Date

  @ApiProperty()
  @Prop({ enum: Gender, default: Gender.OTHER })
  gender: Gender

  @ApiProperty()
  @Prop({
    type: String
  })
  avatar: string

  @Prop({ type: String })
  password: string

  @ApiProperty()
  @Prop({ type: Date, default: Date.now() })
  lastLoginDate: Date

  @ApiProperty()
  @Prop({ type: String })
  googleUserId: string

  @ApiProperty()
  @Prop({ type: Number, min: 0, default: DEFAULT_CREDITS })
  credits: number

  @Prop({
    enum: Status,
    default: Status.ACTIVE
  })
  status: Status
}

export const CustomerSchema = SchemaFactory.createForClass(Customer)

CustomerSchema.plugin(paginate)
