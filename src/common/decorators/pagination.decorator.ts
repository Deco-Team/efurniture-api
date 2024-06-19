import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import * as _ from 'lodash'

export interface PaginationParams {
  page: number
  limit: number
  sort: Record<string, any>
}

const DEFAULT_LIMIT = 10

export const handlePagination: (request: any) => PaginationParams = (request) => {
  const paginationParams = {
    page: request.query.page,
    limit: request.query.limit,
    sort: request.query.sort
  }
  paginationParams.page = Number(paginationParams.page) > 0 ? Number(paginationParams.page) : 1
  paginationParams.limit =
    Number(paginationParams.limit) > 0 && Number(paginationParams.limit) < 100
      ? Number(paginationParams.limit)
      : DEFAULT_LIMIT
  if (_.isEmpty(paginationParams.sort)) {
    paginationParams.sort = {
      createdAt: -1
    }
  } else {
    const result = {}
    const sortFields = paginationParams.sort.split('_')
    sortFields.forEach((item) => {
      const sortType = item.indexOf('.asc') !== -1 ? '.asc' : '.desc'
      result[item.replace(sortType, '')] = sortType === '.asc' ? 1 : -1
    })
    paginationParams.sort = result
  }
  return paginationParams
}

/**
 * How to use
 - In controller: 
  @ApiQuery({ type: PaginationQuery })
  @Get()
  async list(
    @Pagination() paginationParams: PaginationParams,
    @Query() filterDto: FilterDto,
  ) {
    return await this.service.list(filterDto, paginationParams);
  }

  - In service:
  async list(filterDto, paginationParams) {
    return await this.service.list(filterDto, paginationParams);
  }
 */
export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return handlePagination(request)
})
