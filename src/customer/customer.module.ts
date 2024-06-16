import { Logger, Module, OnModuleInit } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Customer, CustomerSchema } from '@customer/schemas/customer.schema'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { CustomerService } from '@customer/services/customer.service'
import { CustomerController } from '@src/customer/controllers/customer.controller'
import { DEFAULT_CREDITS } from '@ai-generation/contracts/constant'

@Module({
  imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }])],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository],
  exports: [CustomerService, CustomerRepository]
})
export class CustomerModule implements OnModuleInit {
  private readonly logger = new Logger(CustomerModule.name) 
  constructor(private readonly customerRepository: CustomerRepository) {}

  async onModuleInit() {
    this.logger.log(`CustomerModule.OnModuleInit: Set default credits for customers`)
    await this.customerRepository.updateMany(
      { credits: { $exists: false } },
      {
        $set: {
          credits: DEFAULT_CREDITS
        }
      }
    )
  }
}
