import { Module } from '@nestjs/common'
import { ProductController } from '@product/controllers/product.controller'
import { ProductService } from '@product/services/product.service'
import { ProductRepository } from '@product/repositories/product.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from '@product/schemas/product.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService]
})
export class ProductModule {}
