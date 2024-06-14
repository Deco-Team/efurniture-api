import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { Roles } from '@auth/decorators/roles.decorator'
import { UserRole } from '@common/contracts/constant'
import { RolesGuard } from '@auth/guards/roles.guard'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { GenerateTextToImageDto, TextToImageResponseDto } from '@ai-generation/dtos/text-to-image.dto'
import { AIGenerationPricingService } from '@ai-generation/services/pricing.service'
import { CreateCreditPurchaseDto, CreditPurchaseResponseDto } from '@ai-generation/dtos/pricing.dto'

@ApiTags('AIGeneration - Pricing')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('pricing')
export class AIGenerationPricingController {
  constructor(private readonly aiGenerationPricingService: AIGenerationPricingService) {}

  @ApiOperation({
    summary: 'Create payment for credits purchase'
  })
  @ApiOkResponse({ type: CreditPurchaseResponseDto })
  @Post()
  createPaymentForCreditsPurchase(@Req() req, @Body() createCreditPurchaseDto: CreateCreditPurchaseDto) {
    createCreditPurchaseDto.customerId = _.get(req, 'user._id')
    return this.aiGenerationPricingService.createPayment(createCreditPurchaseDto)
  }
}
