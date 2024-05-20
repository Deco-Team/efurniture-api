import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HttpModule } from '@nestjs/axios'
import { AIGeneration, AIGenerationSchema } from './schemas/ai-generation.schema'
import { CustomerModule } from '@customer/customer.module'
import { AIGenerationTextToModelController } from './controllers/text-to-model.controller'
import { AIGenerationTextToModelService } from './services/text-to-model.service'
import { AIGenerationRepository } from './repositories/ai-generation.repository'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AIGeneration.name, schema: AIGenerationSchema }]),
    HttpModule,
    CustomerModule
  ],
  controllers: [AIGenerationTextToModelController],
  providers: [AIGenerationTextToModelService, AIGenerationRepository],
  exports: [AIGenerationTextToModelService, AIGenerationRepository]
})
export class AIGenerationModule {}
