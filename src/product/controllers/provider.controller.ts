import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { ProductService } from '@product/services/product.service'
import { Product } from '@product/schemas/product.schema'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ErrorResponse, PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { CreateProductDto, FilterProductDto, ProductDetailDto, ProductPaginateDto, UpdateProductDto } from '@product/dto/product.dto'
import { Roles } from '@auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { UserRole } from '@common/contracts/constant'
import { DataResponse } from '@common/contracts/openapi-builder'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'

@ApiTags('Product - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('provider')
export class ProviderProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: ProductPaginateDto })
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
    if (filterProductDto.fromPrice && filterProductDto.toPrice) {
      condition['variants'] = {
        $elemMatch: { price: { $gte: filterProductDto.fromPrice, $lte: filterProductDto.toPrice } }
      }
    }
    return this.productService.getAllProducts(condition, paginationParams)
  }

  @Post()
  @ApiCreatedResponse({ type: DataResponse(Product) })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto)
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: DataResponse(ProductDetailDto) })
  getProductsDetail(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.getProductsDetail({ _id: id })
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: DataResponse(ProductDetailDto) })
  @ApiNotFoundResponse({ type: ErrorResponse })
  updateProduct(@Param('id', ParseObjectIdPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct({ _id: id }, updateProductDto)
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  deleteProducts(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.deleteProduct({ _id: id })
  }
}
