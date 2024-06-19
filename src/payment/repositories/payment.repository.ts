import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Payment, PaymentDocument } from '@payment/schemas/payment.schema'

@Injectable()
export class PaymentRepository extends AbstractRepository<PaymentDocument> {
  constructor(@InjectModel(Payment.name) model: PaginateModel<PaymentDocument>) {
    super(model)
  }
}
