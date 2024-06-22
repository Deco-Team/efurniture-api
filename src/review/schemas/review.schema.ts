import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { Customer } from '@customer/schemas/customer.schema'
import { Product } from '@product/schemas/product.schema'
import { ReviewStatus } from '@common/contracts/constant'
import { Order } from '@order/schemas/order.schema'

export type ReviewDocument = HydratedDocument<Review>

@Schema({
  collection: 'reviews',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Review {
  constructor(id?: string) {
    this._id = id
  }
  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty({ type: Customer })
  @Prop({ type: Types.ObjectId, ref: Customer.name })
  customer: Customer;

  @ApiProperty({ type: Product })
  @Prop({ type: Types.ObjectId, ref: Product.name })
  product: Product;

  @Prop({ type: Types.ObjectId, ref: Order.name, select: false })
  order: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number })
  rate: number

  @ApiProperty()
  @Prop({ type: String })
  comment: string

  @Prop({
    enum: ReviewStatus,
    default: ReviewStatus.ACTIVE
  })
  status: ReviewStatus
}

export const ReviewSchema = SchemaFactory.createForClass(Review)

ReviewSchema.plugin(paginate)