import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HttpModule } from '@nestjs/axios'
import { AIGeneration, AIGenerationSchema } from './schemas/ai-generation.schema'
import { CustomerModule } from '@customer/customer.module'
import { AIGenerationTextToModelController } from './controllers/text-to-model.controller'
import { AIGenerationTextToModelService } from './services/text-to-model.service'
import { AIGenerationRepository } from './repositories/ai-generation.repository'
import { AIGenerationTextToImageController } from './controllers/text-to-image.controller'
import { AIGenerationTextToImageService } from './services/text-to-image.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AIGeneration.name, schema: AIGenerationSchema }]),
    HttpModule,
    CustomerModule
  ],
  controllers: [AIGenerationTextToModelController, AIGenerationTextToImageController],
  providers: [AIGenerationTextToModelService, AIGenerationTextToImageService, AIGenerationRepository],
  exports: [AIGenerationTextToModelService, AIGenerationTextToImageService, AIGenerationRepository]
})
export class AIGenerationModule {}
