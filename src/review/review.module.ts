import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HttpModule } from '@nestjs/axios'
import { Review, ReviewSchema } from './schemas/review.schema'
import { CustomerModule } from '@customer/customer.module'
import { ReviewController } from './controllers/customer.review.controller'
import { ReviewService } from './services/review.service'
import { ReviewRepository } from './repositories/review.repository'
import { ProductModule } from '@product/product.module'
import { OrderModule } from '@order/order.module'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    HttpModule,
    CustomerModule,
    ProductModule,
    OrderModule
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository]
})
export class ReviewModule {}
