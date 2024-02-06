import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { ArrayMinSize, IsMongoId, IsNotEmpty, MaxLength, MinLength, ValidateNested } from 'class-validator'
import { CustomerOrderDto, OrderHistoryDto, OrderItemDto } from '@order/schemas/order.schema'
import { Prop } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Type } from 'class-transformer'
import { OrderStatus, TransactionStatus } from '@src/common/contracts/constant'

export class CreateOrderItemDto {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  @ApiProperty({ example: 'productId' })
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId

  @Prop()
  @ApiProperty({ example: 'EF20241212' })
  sku: string
}

export class CreateOrderDto {
  @ApiProperty({ type: () => CustomerOrderDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerOrderDto)
  customer: CustomerOrderDto

  @ApiProperty({ isArray: true, type: CreateOrderItemDto })
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  @ApiPropertyOptional()
  @MaxLength(256)
  notes?: string

  orderHistory?: OrderHistoryDto[]
}

export class OrderDto {
  @ApiProperty()
  _id: string

  @ApiProperty({ type: () => CustomerOrderDto })
  customer: CustomerOrderDto

  @ApiProperty({ isArray: true, type: () => OrderItemDto })
  items: OrderItemDto[]

  @ApiProperty()
  totalAmount: number

  @ApiProperty()
  orderDate: Date

  @ApiProperty({ enum: OrderStatus })
  orderStatus: OrderStatus

  @ApiProperty({ enum: TransactionStatus })
  transactionStatus: TransactionStatus

  @ApiProperty()
  deliveryDate: Date

  @ApiProperty()
  completeDate: Date

  @ApiPropertyOptional()
  notes?: string
}

export class OrderPaginateResponseDto extends DataResponse(
  class OrderPaginateResponse extends PaginateResponse(OrderDto) {}
) {}

export class OrderResponseDto extends DataResponse(OrderDto) {}

export class CancelOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(256)
  @MinLength(10)
  reason: string

  orderId?: string
  orderHistoryItem?: OrderHistoryDto
}
