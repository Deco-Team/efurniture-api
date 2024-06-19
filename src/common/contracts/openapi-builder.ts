import { mixin } from "@nestjs/common"
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger"
import { ClassConstructor } from "class-transformer"

export function PaginateResponse<TDoc extends ClassConstructor<any>>(
  Doc: TDoc,
  options?: ApiPropertyOptions | undefined
) {
  class PaginateResponse {
    @ApiProperty({
      required: true,
      isArray: true,
      type: Doc,
      description: 'The list of doc.',
      ...options
    })
    docs: (typeof Doc)[]

    @ApiProperty({
      required: true,
      type: Number,
      example: 10,
      description: 'Total number of documents in collection that match a query.'
    })
    totalDocs: number

    @ApiProperty({
      required: true,
      type: Number,
      example: 0,
      description: ' Only if specified or default page/offset values were used.'
    })
    offset: number

    @ApiProperty({
      required: true,
      type: Number,
      example: 10,
      description: 'Limit that was used.'
    })
    limit: number

    @ApiProperty({
      required: true,
      type: Number,
      example: 10,
      description: 'Total number of pages.'
    })
    totalPages: number

    @ApiProperty({
      required: false,
      type: Number,
      example: 1,
      description: 'Current page number.'
    })
    page?: number | undefined

    @ApiProperty({
      required: false,
      type: Number,
      example: 1,
      description:
        'The starting index/serial/chronological number of first document in current page. (Eg: if page=2 and limit=10, then pagingCounter will be 11)'
    })
    pagingCounter: number

    @ApiProperty({
      required: true,
      type: Boolean,
      example: false,
      description: 'Availability of prev page.'
    })
    hasPrevPage: boolean

    @ApiProperty({
      required: true,
      type: Boolean,
      example: true,
      description: 'Availability of next page.'
    })
    hasNextPage: boolean

    @ApiProperty({
      required: true,
      type: Boolean,
      example: null,
      description: 'Previous page number if available or NULL.'
    })
    prevPage?: number | null | undefined

    @ApiProperty({
      required: true,
      type: Boolean,
      example: 2,
      description: 'Next page number if available or NULL.'
    })
    nextPage?: number | null | undefined
  }
  return mixin(PaginateResponse)
}

export function DataResponse<TDoc extends ClassConstructor<any>>(
  Doc: TDoc,
  options?: ApiPropertyOptions | undefined
) {
  class DataResponse {
    @ApiProperty({
      required: true,
      type: Doc,
      ...options
    })
    data: typeof Doc
  }
  return mixin(DataResponse)
}