import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { QueryStatisticAnalyticDto, StatisticAnalyticResponseDto } from '@analytic/dto/analytic.dto'
import { AnalyticService } from '@analytic/services/analytic.service'

@ApiTags('Analytic - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('analytics/statistic')
export class StatisticAnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get('sales')
  @ApiOperation({
    summary: 'View sales statistics'
  })
  @ApiOkResponse({ type: StatisticAnalyticResponseDto })
  async getSalesStatistics(@Query() queryStatisticAnalyticDto: QueryStatisticAnalyticDto) {
    return this.analyticService.getSalesStatistic(queryStatisticAnalyticDto)
  }
}
