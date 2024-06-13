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
import { AIGenerationPricingService } from './services/pricing.service'
import { AIGenerationPricingController } from './controllers/pricing.controller'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AIGeneration.name, schema: AIGenerationSchema }]),
    HttpModule,
    CustomerModule
  ],
  controllers: [AIGenerationTextToModelController, AIGenerationTextToImageController, AIGenerationPricingController],
  providers: [
    AIGenerationTextToModelService,
    AIGenerationTextToImageService,
    AIGenerationPricingService,
    AIGenerationRepository
  ],
  exports: [
    AIGenerationTextToModelService,
    AIGenerationTextToImageService,
    AIGenerationPricingService,
    AIGenerationRepository
  ]
})
export class AIGenerationModule {}
