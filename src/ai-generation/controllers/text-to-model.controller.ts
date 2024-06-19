import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { Roles } from '@auth/decorators/roles.decorator'
import { UserRole } from '@common/contracts/constant'
import { RolesGuard } from '@auth/guards/roles.guard'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { AIGenerationTextToModelService } from '@ai-generation/services/text-to-model.service'
import { GenerateTextToDraftModelDto, TextToDraftModelResponseDto, TextToModelTaskResponseDto } from '@ai-generation/dtos/text-to-model.dto'

@ApiTags('AIGeneration - TextToModel')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('text-to-model')
export class AIGenerationTextToModelController {
  constructor(private readonly aiGenerationTextToModelService: AIGenerationTextToModelService) {}

  @ApiOperation({
    summary: 'Generate draft model from text'
  })
  @ApiOkResponse({ type: TextToDraftModelResponseDto })
  @Post()
  generate(@Req() req, @Body() generateTextToDraftModelDto: GenerateTextToDraftModelDto) {
    generateTextToDraftModelDto.type = 'text_to_model'
    generateTextToDraftModelDto.customerId = _.get(req, 'user._id')
    return this.aiGenerationTextToModelService.generateTextToDraftModel(generateTextToDraftModelDto)
  }

  @ApiOperation({
    summary: 'Get task of model'
  })
  @Get(':taskId')
  @ApiOkResponse({ type: TextToModelTaskResponseDto })
  getTask(@Param('taskId') taskId: string) {
    return this.aiGenerationTextToModelService.getTask(taskId)
  }
}
