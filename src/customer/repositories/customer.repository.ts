import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Customer, CustomerDocument } from '@customer/schemas/customer.schema'
import { AbstractRepository } from '@common/repositories'

@Injectable()
export class CustomerRepository extends AbstractRepository<CustomerDocument> {
  constructor(@InjectModel(Customer.name) model: PaginateModel<CustomerDocument>) {
    super(model)
  }
}
