import { Injectable } from '@nestjs/common'
import { OrderRepository } from '@order/repositories/order.repository'
import { ProductRepository } from '@product/repositories/product.repository'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { PaymentRepository } from '@payment/repositories/payment.repository'
import { OrderStatus, ProductStatus, Status, TransactionStatus } from '@common/contracts/constant'
import type { Moment } from 'moment'
import * as moment from 'moment'
import { QueryStatisticAnalyticDto } from '@analytic/dto/analytic.dto'

@Injectable()
export class AnalyticService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  public async getOrderCount(current: Moment, startOfCurrentPeriod: Moment, startOfPreviousPeriod: Moment) {
    const filter = {
      orderStatus: {
        $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.DELIVERING, OrderStatus.COMPLETED]
      },
      transactionStatus: {
        $in: [
          TransactionStatus.CAPTURED,
          TransactionStatus.ERROR,
          TransactionStatus.CANCELED,
          TransactionStatus.REFUNDED
        ]
      }
    }
    const [total, previousTotal] = await Promise.all([
      this.orderRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: current, $gte: startOfCurrentPeriod }
      }),
      this.orderRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: startOfCurrentPeriod, $gte: startOfPreviousPeriod }
      })
    ])
    const percent = previousTotal !== 0 ? Math.round(((total - previousTotal) / previousTotal) * 100 * 100) / 100 : 0
    return { total, previousTotal, percent }
  }

  public async getSalesSum(current: Date, startOfCurrentPeriod: Date, startOfPreviousPeriod: Date) {
    const filter = {
      transactionStatus: TransactionStatus.CAPTURED
    }
    const [sumTotal, previousSumTotal] = await Promise.all([
      this.paymentRepository.model.aggregate([
        { $match: { ...filter, createdAt: { $lte: current, $gte: startOfCurrentPeriod } } },
        {
          $group: { _id: null, amount: { $sum: '$amount' } }
        }
      ]),
      this.paymentRepository.model.aggregate([
        { $match: { ...filter, createdAt: { $lte: startOfCurrentPeriod, $gte: startOfPreviousPeriod } } },
        {
          $group: { _id: null, amount: { $sum: '$amount' } }
        }
      ])
    ])
    const total = sumTotal[0]?.amount || 0
    const previousTotal = previousSumTotal[0]?.amount || 0
    const percent = previousTotal !== 0 ? Math.round(((total - previousTotal) / previousTotal) * 100 * 100) / 100 : 0
    return { total, previousTotal, percent }
  }

  public async getProductCount(current: Moment, startOfCurrentPeriod: Moment, startOfPreviousPeriod: Moment) {
    const filter = {
      status: { $ne: ProductStatus.DELETED }
    }
    const [total, previousTotal] = await Promise.all([
      this.productRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: current, $gte: startOfCurrentPeriod }
      }),
      this.productRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: startOfCurrentPeriod, $gte: startOfPreviousPeriod }
      })
    ])
    const percent = previousTotal !== 0 ? Math.round(((total - previousTotal) / previousTotal) * 100 * 100) / 100 : 0
    return { total, previousTotal, percent }
  }

  public async getCustomerCount(current: Moment, startOfCurrentPeriod: Moment, startOfPreviousPeriod: Moment) {
    const filter = {
      status: { $ne: Status.DELETED }
    }
    const [total, previousTotal] = await Promise.all([
      this.customerRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: current, $gte: startOfCurrentPeriod }
      }),
      this.customerRepository.model.countDocuments({
        ...filter,
        createdAt: { $lte: startOfCurrentPeriod, $gte: startOfPreviousPeriod }
      })
    ])
    const percent = previousTotal !== 0 ? Math.round(((total - previousTotal) / previousTotal) * 100 * 100) / 100 : 0
    return { total, previousTotal, percent }
  }

  public async getSalesStatistic(queryStatisticAnalyticDto: QueryStatisticAnalyticDto) {
    const year = queryStatisticAnalyticDto.year
    const filter = {
      transactionStatus: TransactionStatus.CAPTURED
    }
    const operations = []
    for (let i = 0; i < 12; i++) {
      const startOfMonth = moment([year, i]).startOf('month')
      const endOfMonth = startOfMonth.clone().endOf('month')
      operations.push(
        this.paymentRepository.model.aggregate([
          { $match: { ...filter, createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() } } },
          {
            $group: { _id: null, amount: { $sum: '$amount' } }
          }
        ])
      )
    }
    const result = await Promise.all(operations)
    const statistic = result.map((sumTotal) => sumTotal[0]?.amount || 0)
    return { statistic }
  }
}
