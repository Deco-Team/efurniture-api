import { BadRequestException, Injectable } from '@nestjs/common'
import { StaffRepository } from '@staff/repositories/staff.repository'
import { CreateStaffDto, UpdateStaffDto } from '@staff/dto/staff.dto'
import { ProviderRepository } from '@provider/repositories/provider.repository'
import { IDResponse, SuccessResponse } from '@common/contracts/dto'
import { AuthService } from '@auth/services/auth.service'
import { MailerService } from '@nestjs-modules/mailer'
import { MongoServerError } from 'mongodb'
import { Staff } from '@staff/schemas/staff.schema'
import * as _ from 'lodash'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Status, UserRole } from '@common/contracts/constant'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'

@Injectable()
export class StaffService {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly staffRepository: StaffRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  public async create(createStaffDto: CreateStaffDto, adminId: string) {
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      const { providerId } = await this.staffRepository.findOne({
        conditions: { _id: adminId }
      })
      createStaffDto.providerId = providerId

      // Generate random password
      const password = Math.random().toString(36).slice(-8)
      createStaffDto.password = await this.authService.hashPassword(password)

      let staff: Staff
      try {
        staff = await this.staffRepository.create(createStaffDto, { session })
      } catch (err) {
        if (err instanceof MongoServerError) {
          const { code, keyPattern, keyValue } = err
          if (code === 11000) {
            if (_.get(keyPattern, 'staffCode') === 1)
              throw new BadRequestException(
                `Mã nhân viên: ${_.get(keyValue, 'staffCode')} đã tổn tại. Vui lòng nhập mã nhân viên khác.`
              )
            if (_.get(keyPattern, 'email') === 1)
              throw new BadRequestException(`Email: ${_.get(keyValue, 'email')} đã tổn tại. Vui lòng nhập email khác.`)
          }
        }
        console.error(err)
        throw err
      }
      // Send email
      try {
        await this.mailerService.sendMail({
          to: createStaffDto.email,
          subject: '[Furnique] Thông tin đăng nhập hệ thống',
          template: 'invite-staff',
          context: {
            name: `${createStaffDto.firstName} ${createStaffDto.lastName}`,
            email: createStaffDto.email,
            password
          }
        })
      } catch (error) {
        console.error(`send mail error=${error}, stack=${JSON.stringify(error['stack'])}`)
        if (error['responseCode'] === 501) {
          console.error('501 can not send mail')
          throw new BadRequestException('Dịch vụ email đang gặp sự cố. Vui lòng thử lại sau!')
        } else {
          throw error
        }
      }

      await session.commitTransaction()
      return new IDResponse(staff._id)
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  public async update(staffId: string, updateStaffDto: UpdateStaffDto, adminId: string) {
    const { providerId } = await this.staffRepository.findOne({
      conditions: { _id: adminId }
    })

    const staff = await this.staffRepository.findOneAndUpdate(
      {
        _id: staffId,
        providerId,
        role: {
          $in: [UserRole.STAFF, UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF]
        }
      },
      updateStaffDto
    )
    if (!staff) throw new AppException(Errors.STAFF_NOT_FOUND)

    return new SuccessResponse(true)
  }

  public async paginate(filter: FilterQuery<Staff>, paginationParams: PaginationParams, staffId: string) {
    const { providerId } = await this.staffRepository.findOne({
      conditions: { _id: staffId }
    })

    const result = await this.staffRepository.paginate(
      {
        providerId,
        role: {
          $in: [UserRole.STAFF, UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF]
        },
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      { projection: '-password', ...paginationParams }
    )
    return result
  }

  public async getConsultantList(filter: FilterQuery<Staff>, paginationParams: PaginationParams) {
    const result = await this.staffRepository.paginate(
      {
        role: UserRole.CONSULTANT_STAFF,
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      { projection: '-password', ...paginationParams }
    )
    return result
  }

  public async getOne(filter: FilterQuery<Staff>, staffId: string) {
    const { providerId } = await this.staffRepository.findOne({
      conditions: { _id: staffId }
    })

    const staff = await this.staffRepository.findOne({
      conditions: {
        providerId,
        role: {
          $in: [UserRole.STAFF, UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF]
        },
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      projection: '-password'
    })
    if (!staff) throw new AppException(Errors.STAFF_NOT_FOUND)

    return staff
  }

  public async deactivateStaff(filter: FilterQuery<Staff>, adminId: string) {
    const { providerId } = await this.staffRepository.findOne({
      conditions: { _id: adminId }
    })

    const staff = await this.staffRepository.findOneAndUpdate(
      {
        providerId,
        status: Status.ACTIVE,
        role: {
          $in: [UserRole.STAFF, UserRole.CONSULTANT_STAFF, UserRole.DELIVERY_STAFF]
        },
        ...filter
      },
      {
        status: Status.INACTIVE
      }
    )
    if (!staff) throw new AppException(Errors.STAFF_NOT_FOUND)

    // TODO: send mail for information

    return new SuccessResponse(true)
  }

  async getProviderId(staffId: string) {
    const { providerId } = await this.staffRepository.findOne({
      conditions: { _id: staffId },
    })
    return providerId
  }
}
