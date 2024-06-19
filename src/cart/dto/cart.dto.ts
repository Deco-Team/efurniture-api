import { ItemDto } from '@cart/schemas/cart.schema'
import { DataResponse } from '@common/contracts/openapi-builder'
import { ApiProperty } from '@nestjs/swagger'
import { Product } from '@product/schemas/product.schema'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class AddToCartDto extends ItemDto {
  customerId?: string
}

export class UpdateCartDto extends ItemDto {
  customerId?: string
}

export class DeleteItemInCartDto {
  @ApiProperty({ example: 'productId' })
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId

  @ApiProperty({ example: 'EF20241212' })
  @IsNotEmpty()
  sku: string

  customerId?: string
}

class CartItemDto {
  @ApiProperty({ example: 'productId' })
  productId: Types.ObjectId

  @ApiProperty({ example: 'EF20241212' })
  sku: string

  @ApiProperty({ example: 1 })
  quantity: number

  @ApiProperty()
  product: Product
}

class CartResponse {
  @ApiProperty()
  _id: string

  @ApiProperty({ isArray: true, type: CartItemDto })
  items: CartItemDto[]

  @ApiProperty()
  totalAmount: number
}

export class CartResponseDto extends DataResponse(CartResponse) {}
