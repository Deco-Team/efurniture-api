import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ProductStatus } from '@src/common/contracts/constant'
import { Transform } from 'class-transformer'
import { IsNotEmpty, Min } from 'class-validator'
import { HydratedDocument, Types } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import * as slug from 'mongoose-slug-updater'

export type ProductDocument = HydratedDocument<Product>

export class Dimension {
  @ApiProperty({
    example: 36
  })
  @IsNotEmpty()
  @Min(1)
  height: number

  @ApiProperty({
    example: 72
  })
  @IsNotEmpty()
  @Min(1)
  width: number

  @ApiProperty({
    example: 38
  })
  @IsNotEmpty()
  @Min(1)
  length: number
}

export class Variant {
  @ApiProperty({
    example: 'EF20241010'
  })
  @IsNotEmpty()
  sku: string

  @ApiProperty({
    example: 90
  })
  @IsNotEmpty()
  @Min(1)
  price: number

  @ApiProperty({
    example: 10
  })
  @IsNotEmpty()
  @Min(1)
  quantity: number

  @ApiProperty()
  @IsNotEmpty()
  dimensions: Dimension

  @ApiProperty({
    example: { color: 'yellow', material: 'cotton' }
  })
  @IsNotEmpty()
  keyValue: Map<string, string>
}

@Schema({
  collection: 'products',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Product {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String })
  name: string

  @ApiProperty()
  @Prop({ type: String, slug: 'name', unique: true })
  slug: string

  @ApiProperty()
  @Prop({ type: String })
  description: string

  @ApiProperty()
  @Prop({
    type: Array<String>
  })
  images: string[]

  @ApiProperty()
  @Prop({ type: String, required: false })
  modelUrl?: string

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  rate: number

  @ApiProperty()
  @Prop({ type: String })
  brand: string

  @ApiProperty({ type: Variant, isArray: true })
  @Prop({
    type: [Variant]
  })
  variants: Variant[]

  @ApiProperty({ type: String, isArray: true })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }]
  })
  @IsNotEmpty()
  categories: Types.ObjectId[]

  @Prop({
    enum: ProductStatus,
    default: ProductStatus.ACTIVE
  })
  status: ProductStatus
}

export const ProductSchema = SchemaFactory.createForClass(Product)

ProductSchema.index(
  { 'variants.sku': 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.OUT_OF_STOCK]
      }
    }
  }
)
ProductSchema.index({ name: 'text' })
ProductSchema.plugin(paginate)
ProductSchema.plugin(slug)
