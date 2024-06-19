import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ProductService } from '@product/services/product.service'
import { PaginationQuery } from '@src/common/contracts/dto'
import { DataResponse } from '@src/common/contracts/openapi-builder'
import { Pagination, PaginationParams } from '@src/common/decorators/pagination.decorator'
import { FilterProductDto, ProductDetailDto, PublicProductPaginateDto } from '@product/dto/product.dto'

@ApiTags('Product - Public')
@Controller('public')
export class PublicProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: PublicProductPaginateDto })
  @ApiQuery({ type: PaginationQuery })
  getAllProducts(@Pagination() paginationParams: PaginationParams, @Query() filterProductDto: FilterProductDto) {
    const condition = {}
    if (filterProductDto.categories) {
      condition['categories'] = {
        $in: filterProductDto.categories
      }
    }
    if (filterProductDto.name) {
      condition['$text'] = {
        $search: filterProductDto.name
      }
    }
    if (filterProductDto.fromPrice !== undefined && filterProductDto.toPrice !== undefined) {
      condition['variants'] = {
        $elemMatch: { price: { $gte: filterProductDto.fromPrice, $lte: filterProductDto.toPrice } }
      }
    }
    return this.productService.getAllPublicProducts(condition, paginationParams)
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: DataResponse(ProductDetailDto) })
  getProductsDetail(@Param() params: any) {
    return this.productService.getProductsDetail({ _id: params.id })
  }

  @Get('slug/:slug')
  @ApiParam({ name: 'slug' })
  @ApiOkResponse({ type: DataResponse(ProductDetailDto) })
  getProductsDetailBySlug(@Param('slug') slug: string) {
    return this.productService.getProductsDetail({ slug })
  }
}
