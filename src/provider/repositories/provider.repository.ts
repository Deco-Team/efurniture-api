import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Provider, ProviderDocument } from '@provider/schemas/provider.schema'

@Injectable()
export class ProviderRepository extends AbstractRepository<ProviderDocument> {
  constructor(@InjectModel(Provider.name) model: PaginateModel<ProviderDocument>) {
    super(model)
  }
}
