import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CategoryRepository } from '@category/repositories/category.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Status } from '@common/contracts/constant'
import { CreateCategoryDto, UpdateCategoryDto } from '@category/dto/category.dto'
import { Errors } from '@common/contracts/error'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories(paginationParams: PaginationParams) {
    return await this.categoryRepository.paginate(
      {
        status: {
          $ne: Status.DELETED
        }
      },
      paginationParams
    )
  }

  async getCategoryDetail(id: string) {
    return await this.categoryRepository.findOne({
      conditions: {
        _id: id,
        status: {
          $ne: Status.DELETED
        }
      }
    })
  }

  async getAllPublicCategories(paginationParams: PaginationParams) {
    return await this.categoryRepository.paginate(
      {
        status: Status.ACTIVE
      },
      { ...paginationParams, projection: { status: 0 } }
    )
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    let category = await this.categoryRepository.findOne({
      conditions: {
        name: createCategoryDto.name,
        status: { $ne: Status.DELETED }
      }
    })

    if (category) {
      throw new BadRequestException(Errors.CATEGORY_ALREADY_EXIST)
    }

    return await this.categoryRepository.create(createCategoryDto)
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    let category = await this.categoryRepository.findOne({
      conditions: {
        _id: { $ne: id },
        name: updateCategoryDto.name,
        status: { $ne: Status.DELETED }
      }
    })

    if (category) {
      throw new BadRequestException(Errors.CATEGORY_NAME_DUPLICATED)
    }

    category = await this.categoryRepository.findOneAndUpdate({ _id: id }, updateCategoryDto)

    if (!category) {
      throw new NotFoundException(Errors.CATEGORY_NOT_FOUND)
    }

    return category
  }

  /*   async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOneAndUpdate({ _id: id }, { status: Status.DELETED })

    if (!category) {
      throw new NotFoundException(Errors.CATEGORY_NOT_FOUND)
    }

    return category
  } */
}
