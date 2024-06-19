import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, IDDataResponse, PaginationQuery, SuccessDataResponse } from '@common/contracts/dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { Roles } from '@auth/decorators/roles.decorator'
import { StaffService } from '@staff/services/staff.service'
import {
  CreateStaffDto,
  FilterStaffDto,
  StaffPaginateResponseDto,
  StaffResponseDto,
  UpdateStaffDto
} from '@staff/dto/staff.dto'
import { UserRole } from '@common/contracts/constant'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { ParseObjectIdPipe } from '@common/pipes/parse-object-id.pipe'

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard.ACCESS_TOKEN)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new staff'
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: IDDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  createStaff(@Req() req, @Body() createStaffDto: CreateStaffDto) {
    const { _id: adminId } = _.get(req, 'user')
    createStaffDto.createdBy = adminId
    return this.staffService.create(createStaffDto, adminId)
  }

  @Patch(':staffId')
  @ApiOperation({
    summary: 'Update staff'
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  updateStaff(
    @Req() req,
    @Param('staffId', ParseObjectIdPipe) staffId: string,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    const { _id: adminId } = _.get(req, 'user')
    return this.staffService.update(staffId, updateStaffDto, adminId)
  }

  @Get()
  @ApiOperation({
    summary: 'Paginate list staff'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: StaffPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  getListStaff(@Req() req, @Pagination() paginationParams: PaginationParams, @Query() filterStaffDto: FilterStaffDto) {
    const { _id } = _.get(req, 'user')
    return this.staffService.paginate(filterStaffDto, paginationParams, _id)
  }

  @Get('consultant')
  @ApiOperation({
    summary: '(Customer) View list consultant staff (paginate)'
  })
  @Roles(UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: StaffPaginateResponseDto })
  @ApiQuery({ type: PaginationQuery })
  getListConsultant(@Pagination() paginationParams: PaginationParams) {
    return this.staffService.getConsultantList({}, paginationParams)
  }

  @Get(':staffId')
  @ApiOperation({
    summary: 'View staff detail'
  })
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: StaffResponseDto })
  getStaffDetail(@Req() req, @Param('staffId', ParseObjectIdPipe) staffId: string) {
    const { _id } = _.get(req, 'user')
    return this.staffService.getOne({ _id: staffId }, _id)
  }

  @Delete(':staffId/deactivate')
  @ApiOperation({
    summary: 'Deactivate Staff'
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: SuccessDataResponse })
  deactivateStaff(@Req() req, @Param('staffId', ParseObjectIdPipe) staffId: string) {
    const { _id: adminId } = _.get(req, 'user')
    return this.staffService.deactivateStaff({ _id: staffId }, adminId)
  }
}
