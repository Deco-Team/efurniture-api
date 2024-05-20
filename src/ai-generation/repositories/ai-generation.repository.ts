import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { AIGeneration, AIGenerationDocument } from '@ai-generation/schemas/ai-generation.schema'

@Injectable()
export class AIGenerationRepository extends AbstractRepository<AIGenerationDocument> {
  constructor(@InjectModel(AIGeneration.name) model: PaginateModel<AIGenerationDocument>) {
    super(model)
  }
}
