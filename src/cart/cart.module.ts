import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Cart, CartSchema } from '@cart/schemas/cart.schema'
import { CartController } from '@cart/controllers/cart.controller'
import { CartService } from '@cart/services/cart.service'
import { CartRepository } from '@cart/repositories/cart.repository'
import { ProductModule } from '@src/product/product.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]), ProductModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService]
})
export class CartModule {}
