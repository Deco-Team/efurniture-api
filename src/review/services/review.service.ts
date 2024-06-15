import { Injectable, Logger } from '@nestjs/common'
import { ReviewRepository } from '@review/repositories/review.repository'
import { FilterQuery } from 'mongoose'
import { Review } from '@review/schemas/review.schema'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CreateReviewDto } from '@review/dtos/review.dto'
import { ProductRepository } from '@product/repositories/product.repository'
import { ProductStatus } from '@common/contracts/constant'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { SuccessResponse } from '@common/contracts/dto'

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository
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
    const review = await this.reviewRepository.findOne({
      conditions: {
        customer: createReviewDto.customerId,
        product: createReviewDto.productId
      }
    })
    if (review) throw new AppException(Errors.REVIEW_ALREADY_EXIST)

    await this.reviewRepository.create({
      ...createReviewDto,
      customer: createReviewDto.customerId,
      product: createReviewDto.productId
    })

    // 3. Update rating product
    const avgRate = await this.reviewRepository.model.aggregate([
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rate' }
        }
      },
      { $project: { roundedAvgRating: { $round: ['$avgRating', 1] } } }
    ])

    this.logger.debug('ReviewService.createReview: ', avgRate[0]?.roundedAvgRating)
    if (!!avgRate[0]?.roundedAvgRating) {
      await this.productRepository.findOneAndUpdate(
        { _id: createReviewDto.productId },
        {
          rate: avgRate[0]?.roundedAvgRating
        }
      )
    }

    return new SuccessResponse(true)
  }
}
