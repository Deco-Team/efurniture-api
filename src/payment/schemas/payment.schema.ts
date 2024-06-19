import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { Transform } from 'class-transformer'
import { TransactionStatus } from '@common/contracts/constant'
import { PaymentMethod, PaymentType } from '@payment/contracts/constant'

export type PaymentDocument = HydratedDocument<Payment>

@Schema({
  collection: 'payments',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Payment {
  constructor(id?: string) {
    this._id = id
  }
  @Transform(({ value }) => value?.toString())
  _id: string

  @Prop({ type: String })
  customerId: string

  @Prop({ enum: TransactionStatus, default: TransactionStatus.DRAFT })
  transactionStatus: TransactionStatus

  @Prop({ type: Object })
  transaction: Object

  @Prop({ type: [Object] })
  transactionHistory: Object[]

  @Prop({
    enum: PaymentMethod,
    default: PaymentMethod.MOMO
  })
  paymentMethod: PaymentMethod

  @Prop({
    enum: PaymentType,
    default: PaymentType.ORDER
  })
  paymentType: PaymentType

  @Prop({ type: Number, required: true })
  amount: number
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)

PaymentSchema.plugin(paginate)
