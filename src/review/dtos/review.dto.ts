import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, Max, MaxLength, Min } from 'class-validator'
import { Customer } from '@customer/schemas/customer.schema'
import { Type } from 'class-transformer'

export class CreateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  productId: string

  @ApiProperty()
  @IsNotEmpty()
  @Max(5)
  @Min(1)
  @IsInt()
  rate: number

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  comment: string

  customerId?: string
}

export class FilterReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  productId: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Max(5)
  @Min(1)
  @IsInt()
  rate: number
}

export class ReviewDto {
  @ApiProperty()
  _id: string

  @ApiProperty({ type: Customer })
  customer: Customer;

  @ApiProperty()
  product: string;

  @ApiProperty()
  rate: number

  @ApiProperty()
  comment: string
}

export class ReviewResponseDto extends DataResponse(ReviewDto) {}