import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Review, ReviewDocument } from '@review/schemas/review.schema'

@Injectable()
export class ReviewRepository extends AbstractRepository<ReviewDocument> {
  constructor(@InjectModel(Review.name) model: PaginateModel<ReviewDocument>) {
    super(model)
  }
}
