import { Injectable } from '@nestjs/common'
import { AbstractRepository } from '@src/common/repositories'
import { Product, ProductDocument } from '@product/schemas/product.schema'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'

@Injectable()
export class ProductRepository extends AbstractRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) model: PaginateModel<ProductDocument>) {
    super(model)
  }
}
