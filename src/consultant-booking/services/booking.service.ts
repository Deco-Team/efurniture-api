import { Injectable } from '@nestjs/common'
import { BookingStatus, Status, UserRole } from '@common/contracts/constant'
import { IDResponse } from '@common/contracts/dto'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { CategoryRepository } from '@category/repositories/category.repository'
import { BookingHistoryDto, ConsultantBooking } from '@consultant-booking/schemas/booking.schema'
import { ConsultantBookingRepository } from '@consultant-booking/repositories/booking.repository'
import { CreateConsultantBookingDto } from '@consultant-booking/dto/booking.dto'
import { StaffRepository } from '@staff/repositories/staff.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { FilterQuery } from 'mongoose'
import { MailerService } from '@nestjs-modules/mailer'
import * as moment from 'moment'

@Injectable()
export class ConsultantBookingService {
  constructor(
    private readonly consultantBookingRepository: ConsultantBookingRepository,
    private readonly staffRepository: StaffRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mailerService: MailerService
  ) {}

  public async createBooking(createConsultantBookingDto: CreateConsultantBookingDto) {
    const {
      customer: { _id },
      consultantId
    } = createConsultantBookingDto
    createConsultantBookingDto.bookingHistory = [new BookingHistoryDto(BookingStatus.PENDING, _id, UserRole.CUSTOMER)]

    // 1. Check valid consultant
    let consultant
    if (consultantId) {
      consultant = await this.staffRepository.findOne({
        conditions: {
          _id: consultantId,
          status: Status.ACTIVE,
          role: UserRole.CONSULTANT_STAFF
        },
        projection: '-password'
      })
      if (!consultant) throw new AppException(Errors.CONSULTANT_STAFF_NOT_FOUND)
    }

    // 2. Check valid categories
    const categories = await this.categoryRepository.findMany({
      conditions: { _id: { $in: createConsultantBookingDto.interestedCategories } }
    })
    if (categories.length !== createConsultantBookingDto.interestedCategories.length)
      throw new AppException(Errors.CATEGORY_NOT_FOUND)

    // 3. Create booking
    const booking = await this.consultantBookingRepository.create({
      ...createConsultantBookingDto,
      interestedCategories: categories,
      consultant
    })

    // 4. Send email/notification to customer
    await this.mailerService.sendMail({
      to: booking.customer.email,
      subject: `[Furnique] Xác nhận đặt lịch tư vấn viên`,
      template: 'consultant-booking-created',
      context: {
        ...booking.toJSON(),
        bookingDate: moment(booking.bookingDate).format('YYYY-MM-DD HH:mm'),
        notes: booking.notes ?? 'Không'
      }
    })
    // 5. Send notification to staff

    return new IDResponse(booking._id)
  }

  public async paginate(filter: FilterQuery<ConsultantBooking>, paginationParams: PaginationParams) {
    const result = await this.consultantBookingRepository.paginate(
      {
        ...filter,
        status: {
          $ne: BookingStatus.DELETED
        }
      },
      { ...paginationParams }
    )
    return result
  }

  public async getOne(filter: FilterQuery<ConsultantBooking>) {
    const booking = await this.consultantBookingRepository.findOne({
      conditions: {
        ...filter,
        status: {
          $ne: BookingStatus.DELETED
        }
      }
    })
    if (!booking) throw new AppException(Errors.CONSULTANT_BOOKING_NOT_FOUND)

    return booking
  }
}
