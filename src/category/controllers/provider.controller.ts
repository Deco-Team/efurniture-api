import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@src/auth/decorators/roles.decorator'
import { Category } from '@category/schemas/category.schema'
import { DataResponse } from '@common/contracts/openapi-builder'
import { PaginationQuery } from '@src/common/contracts/dto'
import { CategoryService } from '@category/services/category.service'
import { Pagination, PaginationParams } from '@src/common/decorators/pagination.decorator'
import { CategoryPaginateDto, CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from '@category/dto/category.dto'

@ApiTags('Category - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('provider')
export class CategoryProviderController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: CategoryPaginateDto })
  @ApiQuery({ type: PaginationQuery })
  async getAllCategories(@Pagination() paginationParams: PaginationParams) {
    return await this.categoryService.getAllCategories(paginationParams)
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  async getCategoryDetail(@Param('id') id: string ) {
    return await this.categoryService.getCategoryDetail(id)
  }

  @Post()
  @ApiCreatedResponse({ type: DataResponse(Category) })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto)
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: DataResponse(Category) })
  async updateCategory(@Param() params: { id: string }, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryService.updateCategory(params.id, updateCategoryDto)
  }

/*   @Delete(':id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: DataResponse(Category) })
  async deleteCategory(@Param() params: { id: string }) {
    return await this.categoryService.deleteCategory(params.id)
  } */
}
