import { Module } from '@nestjs/common'
import { ProductModule } from '@product/product.module'
import { CustomerModule } from '@customer/customer.module'
import { AnalyticService } from '@analytic/services/analytic.service'
import { CurrentAnalyticController } from '@analytic/controllers/current.controller'
import { OrderModule } from '@order/order.module'
import { PaymentModule } from '@payment/payment.module'
import { StatisticAnalyticController } from './controllers/statistic.controller'

@Module({
  imports: [OrderModule, ProductModule, CustomerModule, PaymentModule],
  controllers: [StatisticAnalyticController, CurrentAnalyticController],
  providers: [AnalyticService],
  exports: [AnalyticService]
})
export class AnalyticModule {}
