import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { Roles } from '@auth/decorators/roles.decorator'
import { ReviewStatus, UserRole } from '@common/contracts/constant'
import { RolesGuard } from '@auth/guards/roles.guard'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { ReviewService } from '@review/services/review.service'
import { PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { CreateReviewDto, FilterReviewDto, ReviewResponseDto } from '@review/dtos/review.dto'

@ApiTags('Review - Customer')
@Controller('customer')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({
    summary: 'Customer can review product after order completed'
  })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER)
  @UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
  @Post()
  createReview(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    createReviewDto.customerId = _.get(req, 'user._id')
    return this.reviewService.createReview(createReviewDto)
  }

  @ApiOperation({
    summary: 'Paginate product review list'
  })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiQuery({ type: PaginationQuery })
  @Get()
  async paginate(@Pagination() paginationParams: PaginationParams, @Query() filterReviewDto: FilterReviewDto) {
    const condition = {
      product: filterReviewDto.productId,
      status: {
        $ne: ReviewStatus.DELETED
      }
    }

    if (filterReviewDto.rate) {
      condition['rate'] = filterReviewDto.rate
    }
    return await this.reviewService.getReviewList(condition, paginationParams)
  }
}
