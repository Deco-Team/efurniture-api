import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Provider, ProviderSchema } from '@provider/schemas/provider.schema'
import { ProviderRepository } from '@provider/repositories/provider.repository'

@Module({
  imports: [MongooseModule.forFeature([{ name: Provider.name, schema: ProviderSchema }])],
  controllers: [],
  providers: [ProviderRepository],
  exports: [ProviderRepository]
})
export class ProviderModule {}
