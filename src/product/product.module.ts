import { Module } from '@nestjs/common'
import { ProviderProductController } from '@src/product/controllers/provider.controller'
import { ProductService } from '@product/services/product.service'
import { ProductRepository } from '@product/repositories/product.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from '@product/schemas/product.schema'
import { CategoryModule } from '@category/category.module'
import { PublicProductController } from '@product/controllers/customer.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), CategoryModule],
  controllers: [ProviderProductController, PublicProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService, ProductRepository]
})
export class ProductModule {}
