import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { AnalyticPeriod, UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { CurrentAnalyticResponseDto, QueryCurrentAnalyticDto } from '@analytic/dto/analytic.dto'
import * as moment from 'moment'
import { AnalyticService } from '@analytic/services/analytic.service'

@ApiTags('Analytic - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('analytics/current')
export class CurrentAnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get('orders')
  @ApiOperation({
    summary: 'View current order analytics in currentPeriod with previousPeriod'
  })
  @ApiOkResponse({ type: CurrentAnalyticResponseDto })
  getOrderCount(@Query() queryCurrentAnalyticDto: QueryCurrentAnalyticDto) {
    const current = moment()
    let unitOfTime
    switch (queryCurrentAnalyticDto.periodType) {
      case AnalyticPeriod.DAY:
        unitOfTime = 'day'
        break
      case AnalyticPeriod.MONTH:
        unitOfTime = 'month'
        break
      case AnalyticPeriod.YEAR:
        unitOfTime = 'year'
        break
    }
    const startOfCurrentPeriod = moment().startOf(unitOfTime)
    const startOfPreviousPeriod = moment().subtract(1, unitOfTime).startOf(unitOfTime)
    return this.analyticService.getOrderCount(current, startOfCurrentPeriod, startOfPreviousPeriod)
  }

  @Get('sales')
  @ApiOperation({
    summary: 'View sales analytics in currentPeriod with previousPeriod'
  })
  @ApiOkResponse({ type: CurrentAnalyticResponseDto })
  async getSalesSum(@Query() queryCurrentAnalyticDto: QueryCurrentAnalyticDto) {
    const current = moment().toDate()
    let unitOfTime
    switch (queryCurrentAnalyticDto.periodType) {
      case AnalyticPeriod.DAY:
        unitOfTime = 'day'
        break
      case AnalyticPeriod.MONTH:
        unitOfTime = 'month'
        break
      case AnalyticPeriod.YEAR:
        unitOfTime = 'year'
        break
    }
    const startOfCurrentPeriod = moment().startOf(unitOfTime).toDate()
    const startOfPreviousPeriod = moment().subtract(1, unitOfTime).startOf(unitOfTime).toDate()
    return this.analyticService.getSalesSum(current, startOfCurrentPeriod, startOfPreviousPeriod)
  }

  @Get('products')
  @ApiOperation({
    summary: 'View product analytics in currentPeriod with previousPeriod'
  })
  @ApiOkResponse({ type: CurrentAnalyticResponseDto })
  async getProductCount(@Query() queryCurrentAnalyticDto: QueryCurrentAnalyticDto) {
    const current = moment()
    let unitOfTime
    switch (queryCurrentAnalyticDto.periodType) {
      case AnalyticPeriod.DAY:
        unitOfTime = 'day'
        break
      case AnalyticPeriod.MONTH:
        unitOfTime = 'month'
        break
      case AnalyticPeriod.YEAR:
        unitOfTime = 'year'
        break
    }
    const startOfCurrentPeriod = moment().startOf(unitOfTime)
    const startOfPreviousPeriod = moment().subtract(1, unitOfTime).startOf(unitOfTime)
    return this.analyticService.getProductCount(current, startOfCurrentPeriod, startOfPreviousPeriod)
  }

  @Get('customers')
  @ApiOperation({
    summary: 'View customer analytics in currentPeriod with previousPeriod'
  })
  @ApiOkResponse({ type: CurrentAnalyticResponseDto })
  async getCustomerCount(@Query() queryCurrentAnalyticDto: QueryCurrentAnalyticDto) {
    const current = moment()
    let unitOfTime
    switch (queryCurrentAnalyticDto.periodType) {
      case AnalyticPeriod.DAY:
        unitOfTime = 'day'
        break
      case AnalyticPeriod.MONTH:
        unitOfTime = 'month'
        break
      case AnalyticPeriod.YEAR:
        unitOfTime = 'year'
        break
    }
    const startOfCurrentPeriod = moment().startOf(unitOfTime)
    const startOfPreviousPeriod = moment().subtract(1, unitOfTime).startOf(unitOfTime)
    return this.analyticService.getCustomerCount(current, startOfCurrentPeriod, startOfPreviousPeriod)
  }
}
