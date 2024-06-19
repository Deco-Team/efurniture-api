import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '@src/common/repositories'
import { Category, CategoryDocument } from '@category/schemas/category.schema'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'

@Injectable()
export class CategoryRepository extends AbstractRepository<CategoryDocument> {
  constructor(@InjectModel(Category.name) model: PaginateModel<CategoryDocument>) {
    super(model)
  }
}
