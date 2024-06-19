import { ApiProperty } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator'
import { Category } from '@category/schemas/category.schema'

export class PublicCategory {
  @ApiProperty()
  _id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  image: string
}

export class PublicCategoryPaginateDto extends DataResponse(
  class PublicCategoryPaginate extends PaginateResponse(PublicCategory) {}
) {}

export class CategoryPaginateDto extends DataResponse(class CategoryPaginate extends PaginateResponse(Category) {}) {}

export class CategoryResponseDto extends DataResponse(Category) {}

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  @ApiProperty()
  @MaxLength(100)
  description: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  image: string
}

export class UpdateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  @ApiProperty()
  @MaxLength(100)
  description: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  image: string
}
