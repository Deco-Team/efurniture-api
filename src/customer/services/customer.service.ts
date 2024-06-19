import { BadRequestException, Injectable } from '@nestjs/common'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { Customer } from '@customer/schemas/customer.schema'
import { Errors } from '@src/common/contracts/error'
import { Status } from '@common/contracts/constant'

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async getCustomerDetail(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      conditions: {
        _id: customerId,
        status: {
          $ne: Status.DELETED
        }
      },
      projection: '-password'
    })
    if (!customer) throw new BadRequestException(Errors.CUSTOMER_NOT_FOUND.message)
    return customer
  }
}
