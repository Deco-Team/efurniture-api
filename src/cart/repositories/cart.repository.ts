import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AbstractRepository } from '@common/repositories'
import { Cart, CartDocument } from '@cart/schemas/cart.schema'

@Injectable()
export class CartRepository extends AbstractRepository<CartDocument> {
  constructor(@InjectModel(Cart.name) model: PaginateModel<CartDocument>) {
    super(model)
  }
}
