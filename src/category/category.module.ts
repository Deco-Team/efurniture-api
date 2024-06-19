import { Module } from '@nestjs/common'
import { CategoryProviderController } from '@category/controllers/provider.controller'
import { CategoryService } from '@category/services/category.service'
import { CategoryRepository } from '@category/repositories/category.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Category, CategorySchema } from '@category/schemas/category.schema'
import { CategoryCustomerController } from '@category/controllers/customer.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoryProviderController, CategoryCustomerController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryRepository]
})
export class CategoryModule {}
