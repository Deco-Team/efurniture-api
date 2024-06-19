import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PaginationQuery } from '@src/common/contracts/dto'
import { CategoryService } from '@category/services/category.service'
import { Pagination, PaginationParams } from '@src/common/decorators/pagination.decorator'
import { CategoryPaginateDto } from '@category/dto/category.dto'

@ApiTags('Category - Customer')
@Controller('customer')
export class CategoryCustomerController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: CategoryPaginateDto })
  @ApiQuery({ type: PaginationQuery })
  async getAllCategories(@Pagination() paginationParams: PaginationParams) {
    return await this.categoryService.getAllPublicCategories(paginationParams)
  }
}
