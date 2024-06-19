import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Order, OrderSchema } from '@order/schemas/order.schema'
import { OrderCustomerController } from '@src/order/controllers/customer.controller'
import { OrderService } from '@order/services/order.service'
import { OrderRepository } from '@order/repositories/order.repository'
import { CartModule } from '@cart/cart.module'
import { ProductModule } from '@product/product.module'
import { OrderProviderController } from '@order/controllers/provider.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), CartModule, ProductModule],
  controllers: [OrderCustomerController, OrderProviderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository]
})
export class OrderModule {}
