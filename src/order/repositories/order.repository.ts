import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AbstractRepository } from '@common/repositories'
import { Order, OrderDocument } from '@order/schemas/order.schema'

@Injectable()
export class OrderRepository extends AbstractRepository<OrderDocument> {
  constructor(@InjectModel(Order.name) model: PaginateModel<OrderDocument>) {
    super(model)
  }
}
