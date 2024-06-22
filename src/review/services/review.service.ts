import { Injectable, Logger } from '@nestjs/common'
import { ReviewRepository } from '@review/repositories/review.repository'
import { FilterQuery } from 'mongoose'
import { Review } from '@review/schemas/review.schema'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CreateReviewDto } from '@review/dtos/review.dto'
import { ProductRepository } from '@product/repositories/product.repository'
import { OrderStatus, ProductStatus, TransactionStatus } from '@common/contracts/constant'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { SuccessResponse } from '@common/contracts/dto'
import { pick } from 'lodash'
import { OrderRepository } from '@order/repositories/order.repository'
import { Connection } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  public async getReviewList(filter: FilterQuery<Review>, paginationParams: PaginationParams) {
    const result = await this.reviewRepository.paginate(
      {
        ...filter
      },
      {
        ...paginationParams,
        populate: [
          {
            path: 'customer',
            select: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              avatar: 1
            }
          }
        ],
        projection: {
          _id: 1,
          customer: 1,
          rate: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )
    return result
  }

  public async createReview(createReviewDto: CreateReviewDto) {
    // 1. Check if customer has completed order product
    const order = await this.orderRepository.findOne({
      conditions: {
        _id: createReviewDto.orderId,
        'customer._id': createReviewDto.customerId
      },
      projection: '+items'
    })
    if (!order) throw new AppException(Errors.ORDER_NOT_FOUND)
    // if (order.orderStatus !== OrderStatus.COMPLETED || order.transactionStatus !== TransactionStatus.CAPTURED)
    //   throw new AppException(Errors.ORDER_STATUS_INVALID)
    const orderItemIndex = order.items.findIndex((item) => item.productId.toString() === createReviewDto.productId)
    if (orderItemIndex === -1) throw new AppException(Errors.ORDER_ITEM_NOT_FOUND)

    // 2. Save review
    // 2.1 Check valid product
    const product = await this.productRepository.findOne({
      conditions: {
        _id: createReviewDto.productId,
        status: {
          $ne: ProductStatus.DELETED
        }
      }
    })
    if (!product) throw new AppException(Errors.PRODUCT_NOT_FOUND)

    // 2.2 Check already review
    const existedReview = await this.reviewRepository.findOne({
      conditions: {
        customer: createReviewDto.customerId,
        product: createReviewDto.productId,
        order: createReviewDto.orderId
      }
    })
    if (existedReview) throw new AppException(Errors.REVIEW_ALREADY_EXIST)

    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 2.3 Save review
      const review = await this.reviewRepository.create(
        {
          ...createReviewDto,
          customer: createReviewDto.customerId,
          product: createReviewDto.productId,
          order: createReviewDto.orderId
        },
        {
          session
        }
      )

      // 3. Update rating product
      const rateSummary = await this.reviewRepository.model.aggregate([
        {
          $group: {
            _id: '$product',
            avgRating: { $avg: '$rate' },
            1: { $sum: { $cond: [{ $eq: ['$rate', 1] }, 1, 0] } },
            2: { $sum: { $cond: [{ $eq: ['$rate', 2] }, 1, 0] } },
            3: { $sum: { $cond: [{ $eq: ['$rate', 3] }, 1, 0] } },
            4: { $sum: { $cond: [{ $eq: ['$rate', 4] }, 1, 0] } },
            5: { $sum: { $cond: [{ $eq: ['$rate', 5] }, 1, 0] } }
          }
        },
        { $project: { roundedAvgRating: { $round: ['$avgRating', 1] }, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 } }
      ])
      if (!!rateSummary[0]?.roundedAvgRating) {
        await this.productRepository.findOneAndUpdate(
          { _id: createReviewDto.productId },
          {
            rate: rateSummary[0]?.roundedAvgRating,
            ratingCount: pick(rateSummary[0], ['1', '2', '3', '4', '5'])
          },
          {
            session
          }
        )
      }

      // 4. Save reviewId to orderItem
      order.items[orderItemIndex].review = review._id.toString()
      await this.orderRepository.findOneAndUpdate(
        {
          _id: createReviewDto.orderId
        },
        {
          $set: {
            items: order.items
          }
        },
        {
          session
        }
      )

      await session.commitTransaction()
      return new SuccessResponse(true)
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }
}
