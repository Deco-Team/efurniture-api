import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsPositive } from 'class-validator'
import { DataResponse } from '@common/contracts/openapi-builder'

export class PaginationQuery {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsPositive()
  page = 1

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
    example: 10,
    default: 10
  })
  @IsOptional()
  @IsPositive()
  limit = 10

  @ApiPropertyOptional({
    type: String,
    example: 'createdAt.asc or createdAt.desc_email.asc',
    description: 'sort any fields. format: <strong>field1.asc|desc or field1.asc|desc_field2.asc|desc</strong>'
  })
  @IsOptional()
  sort: Record<string, 1 | -1>
}

export class SuccessResponse {
  @ApiProperty({
    type: Boolean,
    required: true,
    example: true,
    description: 'The response status.'
  })
  success: boolean

  constructor(success: boolean) {
    this.success = success
  }
}
export class SuccessDataResponse extends DataResponse(SuccessResponse) {}

export class IDResponse {
  @ApiProperty({
    type: String,
    required: true,
    example: true,
    description: 'The _id of resource.'
  })
  _id: string

  constructor(_id: string) {
    this._id = _id
  }
}
export class IDDataResponse extends DataResponse(IDResponse) {}

export class ErrorResponse {
  @ApiProperty()
  error: string

  @ApiProperty()
  message: string

  @ApiProperty()
  data: any
}
