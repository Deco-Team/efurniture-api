import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { Roles } from '@auth/decorators/roles.decorator'
import { UserRole } from '@common/contracts/constant'
import { RolesGuard } from '@auth/guards/roles.guard'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { AIGenerationTextToImageService } from '@ai-generation/services/text-to-image.service'
import { GenerateTextToImageDto, TextToImageResponseDto } from '@ai-generation/dtos/text-to-image.dto'

@ApiTags('AIGeneration - TextToImage')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('text-to-image')
export class AIGenerationTextToImageController {
  constructor(private readonly aiGenerationTextToImageService: AIGenerationTextToImageService) {}

  @ApiOperation({
    summary: 'Generate image from text'
  })
  @ApiOkResponse({ type: TextToImageResponseDto })
  @Post()
  generate(@Req() req, @Body() generateTextToImageDto: GenerateTextToImageDto) {
    generateTextToImageDto.providers = ["amazon", 'amazon/titan-image-generator-v1_premium', 'amazon/titan-image-generator-v1_standard', 'openai/dall-e-2']
    generateTextToImageDto.resolution = "512x512"
    generateTextToImageDto.customerId = _.get(req, 'user._id')
    return this.aiGenerationTextToImageService.generateTextToImage(generateTextToImageDto)
  }
}
