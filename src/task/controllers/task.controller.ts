import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, IDDataResponse, PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Roles } from '@auth/decorators/roles.decorator'
import { StaffService } from '@staff/services/staff.service'
import { UserRole } from '@common/contracts/constant'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { TaskService } from '@task/services/task.service'
import { CreateShippingTaskDto, FilterTaskDto, TaskPaginateResponseDto } from '@task/dto/task.dto'
import { Types } from 'mongoose'

@ApiTags('Task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService, private readonly staffService: StaffService) {}

  @Post('shipping')
  @ApiOperation({
    summary: 'Create new shipping task'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: IDDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  create(@Req() req, @Body() createShippingTaskDto: CreateShippingTaskDto) {
    const { _id } = _.get(req, 'user')
    createShippingTaskDto.reporterId = _id
    return this.taskService.createShippingTask(createShippingTaskDto)
  }

  @Patch('shipping/:orderId/progress')
  @ApiOperation({
    summary: '(Delivery Staff) Change task status to IN_PROGRESS and order status to DELIVERING'
  })
  @Roles(UserRole.DELIVERY_STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  progressShippingTask(@Req() req, @Param('orderId') orderId: string) {
    const { _id: userId } = _.get(req, 'user')
    return this.taskService.progressShippingTask(orderId, userId)
  }

  @Patch('shipping/:orderId/complete')
  @ApiOperation({
    summary: '(Delivery Staff) Change task status to COMPLETED and order status to COMPLETED'
  })
  @Roles(UserRole.DELIVERY_STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  completeShippingTask(@Req() req, @Param('orderId') orderId: string) {
    const { _id: userId } = _.get(req, 'user')
    return this.taskService.completeShippingTask(orderId, userId)
  }

  @Get()
  @ApiOperation({
    summary: 'Paginate list task (CONSULTANT_STAFF, DELIVERY_STAFF just can see own tasks)'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: TaskPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  async getListStaff(
    @Req() req,
    @Pagination() paginationParams: PaginationParams,
    @Query() filterTaskDto: FilterTaskDto
  ) {
    const { _id, role } = _.get(req, 'user')

    const providerId = await this.staffService.getProviderId(_id)
    filterTaskDto['reporter.providerId'] = providerId

    if ([UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF].includes(role)) {
      filterTaskDto['assignee._id'] = new Types.ObjectId(_id)
    }

    return this.taskService.paginate(filterTaskDto, paginationParams)
  }
}
