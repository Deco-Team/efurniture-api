import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { IsEmail, IsNotEmpty, IsPhoneNumber, MaxLength, ValidateNested } from 'class-validator'
import { Product } from '@product/schemas/product.schema'
import { CreateOrderItemDto } from '@order/dto/order.dto'
import { Payment } from '@payment/schemas/payment.schema'
import { Review } from '@review/schemas/review.schema'

export class CustomerOrderDto {
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

  @ApiProperty()
  @IsNotEmpty()
  shippingAddress: string
}

export class OrderHistoryDto {
  constructor(orderStatus: OrderStatus, transactionStatus: TransactionStatus, userId: string, userRole: UserRole) {
    this.orderStatus = orderStatus
    this.transactionStatus = transactionStatus
    this.timestamp = new Date()
    this.userId = userId
    this.userRole = userRole
  }

  @ApiProperty()
  orderStatus: OrderStatus

  @ApiProperty()
  transactionStatus: TransactionStatus

  @ApiProperty()
  timestamp: Date

  @ApiProperty()
  userId: string

  @ApiProperty()
  userRole: UserRole
}

export class OrderItemDto extends CreateOrderItemDto {
  @ApiProperty()
  product: Product

  @ApiProperty()
  quantity: number

  @ApiProperty()
  review?: Review | string
}

export type OrderDocument = HydratedDocument<Order>

@Schema({
  collection: 'orders',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Order {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String })
  orderId: string

  @ApiProperty({ type: CustomerOrderDto })
  @Prop({ type: CustomerOrderDto, required: true })
  customer: CustomerOrderDto

  @ApiProperty({ isArray: true, type: OrderItemDto })
  @ValidateNested()
  @Prop({ type: Array<OrderItemDto>, required: true, select: false })
  items: OrderItemDto[]

  @ApiProperty()
  @Prop({ type: Number, required: true })
  totalAmount: number

  @ApiProperty()
  @Prop({ type: Date, required: true, default: new Date() })
  orderDate: Date

  @ApiProperty()
  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  orderStatus: OrderStatus

  @ApiProperty()
  @Prop({
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT
  })
  transactionStatus: TransactionStatus

  @ApiProperty()
  @Prop({ type: Payment })
  payment: Payment

  @Prop({ type: [OrderHistoryDto], select: false })
  orderHistory: OrderHistoryDto[]

  @ApiProperty()
  @Prop({ type: Date })
  deliveryDate: Date

  @ApiProperty()
  @Prop({ type: Date })
  completeDate: Date

  @ApiPropertyOptional()
  @Prop({ type: String })
  notes?: string

  @ApiPropertyOptional()
  @Prop({ type: Boolean })
  isDeliveryAssigned?: boolean

  @Prop({ type: String })
  reason?: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)

OrderSchema.plugin(paginate)
