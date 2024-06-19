import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Product, RatingCounting, Variant } from '@product/schemas/product.schema'
import { Category } from '@src/category/schemas/category.schema'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
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

  @ApiProperty({
    example: 'https://res.cloudinary.com/drta9lo35/image/upload/v1715929846/knmgqbnkllurf88xxd3b.glb'
  })
  modelUrl: string

  @ApiProperty({
    example: 'floor | wall'
  })
  arPlacement: string

  @ApiProperty({ type: Category, isArray: true })
  categories: Category[]
}

export class PublicProductPaginateDto extends DataResponse(
  class PublicProductPaginate extends PaginateResponse(PublicProductDto) {}
) {}

export class ProductPaginateDto extends DataResponse(class ProductPaginate extends PaginateResponse(Product) {}) {}

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
  @MaxLength(1000)
  description: string

  @ApiProperty({
    example: ['https://m.media-amazon.com/images/I/61KtSpR0SfL._AC_UL480_FMwebp_QL65_.jpg']
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty()
  images: string[]

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/drta9lo35/image/upload/v1715929846/knmgqbnkllurf88xxd3b.glb'
  })
  @IsOptional()
  @IsString()
  modelUrl?: string

  @ApiPropertyOptional({
    example: 'floor | wall'
  })
  @IsOptional()
  @IsString()
  @IsIn(['floor', 'wall'])
  arPlacement?: string

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
  @MaxLength(1000)
  description: string

  @ApiProperty({
    example: ['https://m.media-amazon.com/images/I/61KtSpR0SfL._AC_UL480_FMwebp_QL65_.jpg']
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty()
  images: string[]

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/drta9lo35/image/upload/v1715929846/knmgqbnkllurf88xxd3b.glb'
  })
  @IsOptional()
  @IsString()
  modelUrl?: string

  @ApiPropertyOptional({
    example: 'floor | wall'
  })
  @IsOptional()
  @IsString()
  @IsIn(['floor', 'wall'])
  arPlacement?: string

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

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/drta9lo35/image/upload/v1715929846/knmgqbnkllurf88xxd3b.glb'
  })
  modelUrl?: string

  @ApiPropertyOptional({
    example: 'floor | wall'
  })
  @IsOptional()
  @IsString()
  @IsIn(['floor', 'wall'])
  arPlacement?: string

  @ApiProperty()
  rate: number

  @ApiProperty()
  brand: string

  @ApiProperty({ type: Variant, isArray: true })
  variants: Variant[]

  @ApiProperty({ type: Category, isArray: true })
  categories: Category[]
  
  @ApiProperty({ type: RatingCounting })
  ratingCount: RatingCounting
}

export class FilterProductDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  categories: string[]

  @ApiPropertyOptional()
  @IsOptional()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999_999_999)
  fromPrice: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999_999_999)
  toPrice: number
}
