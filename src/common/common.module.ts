import { Global, Module } from '@nestjs/common'
import { AppLogger } from '@common/services/app-logger.service'
import { HelperService } from '@common/services/helper.service'
import { DiscordService } from './services/discord.service'

@Global()
@Module({
  providers: [AppLogger, HelperService, DiscordService],
  exports: [AppLogger, HelperService, DiscordService]
})
export class CommonModule {}
