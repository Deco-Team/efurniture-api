import { ApiProperty } from '@nestjs/swagger'
import { Product, Variant } from '@product/schemas/product.schema'
import { Category } from '@src/category/schemas/category.schema'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  ValidateNested
} from 'class-validator'
import { Types } from 'mongoose'

export class PublicProductDto {
  @ApiProperty({
    example: 'Sofa Luxury'
  })
  name: string

  @ApiProperty({
    example: 'sofa-luxury'
  })
  slug: string

  @ApiProperty()
  rate: number

  @ApiProperty({ type: Variant, isArray: true })
  variants: Variant[]

  @ApiProperty({
    example: ['https://m.media-amazon.com/images/I/61KtSpR0SfL._AC_UL480_FMwebp_QL65_.jpg']
  })
  images: string[]

  @ApiProperty({ type: Category, isArray: true })
  categories: Category[]
}

export class PublicProductPaginateDto extends DataResponse(
  class PublicProductPaginate extends PaginateResponse(PublicProductDto) {}
) {}

export class ProductPaginateDto extends DataResponse(
  class ProductPaginate extends PaginateResponse(Product) {}
) {}

export class CreateProductDto {
  @ApiProperty({
    example: 'Sofa Luxury'
  })
  @IsNotEmpty()
  @MaxLength(50)
  name: string

  @ApiProperty({
    example: 'Sofa Luxury Description'
  })
  @IsNotEmpty()
  @MaxLength(256)
  description: string

  @ApiProperty({
    example: ['https://m.media-amazon.com/images/I/61KtSpR0SfL._AC_UL480_FMwebp_QL65_.jpg']
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty()
  images: string[]

  @ApiProperty({
    example: 'ERYE'
  })
  @IsNotEmpty()
  brand: string

  @ApiProperty({ type: Variant, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => Variant)
  variants: Variant[]

  @ApiProperty({ type: Types.ObjectId, isArray: true, example: ['65b7805c041a5a29734ce110'] })
  @IsNotEmpty()
  categories: Types.ObjectId[]
}

export class UpdateProductDto {
  @ApiProperty({
    example: 'Sofa Luxury'
  })
  @IsNotEmpty()
  @MaxLength(50)
  name: string

  @ApiProperty({
    example: 'Sofa Luxury Description'
  })
  @IsNotEmpty()
  @MaxLength(256)
  description: string

  @ApiProperty({
    example: ['https://m.media-amazon.com/images/I/61KtSpR0SfL._AC_UL480_FMwebp_QL65_.jpg']
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty()
  images: string[]

  @ApiProperty({
    example: 'ERYE'
  })
  @IsNotEmpty()
  brand: string

  @ApiProperty({ type: Variant, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => Variant)
  variants: Variant[]

  @ApiProperty({ type: Types.ObjectId, isArray: true, example: ['65b7805c041a5a29734ce110'] })
  @IsNotEmpty()
  categories: Types.ObjectId[]
}

export class ProductDetailDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  slug: string

  @ApiProperty()
  description: string

  @ApiProperty()
  images: string[]

  @ApiProperty()
  rate: number

  @ApiProperty()
  brand: string

  @ApiProperty({ type: Variant, isArray: true })
  variants: Variant[]

  @ApiProperty({ type: Category, isArray: true })
  categories: Category[]
}
