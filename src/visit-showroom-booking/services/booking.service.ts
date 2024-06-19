import { BadRequestException, Injectable } from '@nestjs/common'
import { BookingStatus, Status, UserRole } from '@common/contracts/constant'
import { IDResponse } from '@common/contracts/dto'
import { AppException } from '@src/common/exceptions/app.exception'
import { Errors } from '@src/common/contracts/error'
import { CreateVisitShowroomBookingDto } from '@visit-showroom-booking/dto/booking.dto'
import { CategoryRepository } from '@category/repositories/category.repository'
import { VisitShowroomBookingRepository } from '@visit-showroom-booking/repositories/booking.repository'
import { BookingHistoryDto, VisitShowroomBooking } from '@visit-showroom-booking/schemas/booking.schema'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { MailerService } from '@nestjs-modules/mailer'
import * as moment from 'moment'
import { FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'

@Injectable()
export class VisitShowroomBookingService {
  constructor(
    private readonly visitShowroomBookingRepository: VisitShowroomBookingRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly mailerService: MailerService
  ) {}

  public async createBooking(createVisitShowroomBookingDto: CreateVisitShowroomBookingDto) {
    const { _id } = createVisitShowroomBookingDto.customer
    // check if customer or guest role
    if (!_id) {
      createVisitShowroomBookingDto.bookingHistory = [
        new BookingHistoryDto(BookingStatus.PENDING, 'guest', 'GUEST' as UserRole)
      ]
    } else {
      const customer = await this.customerRepository.findOne({
        conditions: {
          _id,
          status: {
            $ne: Status.DELETED
          }
        },
        projection: '-password'
      })
      if (!customer) throw new BadRequestException(Errors.CUSTOMER_NOT_FOUND.message)
      createVisitShowroomBookingDto.bookingHistory = [
        new BookingHistoryDto(BookingStatus.PENDING, _id, UserRole.CUSTOMER)
      ]
    }

    // 2. Check valid categories
    const categories = await this.categoryRepository.findMany({
      conditions: { _id: { $in: createVisitShowroomBookingDto.interestedCategories } }
    })
    if (categories.length !== createVisitShowroomBookingDto.interestedCategories.length)
      throw new AppException(Errors.CATEGORY_NOT_FOUND)

    // 3. Create booking
    const booking = await this.visitShowroomBookingRepository.create({
      ...createVisitShowroomBookingDto,
      interestedCategories: categories
    })

    // 4. Send email/notification to customer
    await this.mailerService.sendMail({
      to: booking.customer.email,
      subject: `[Furnique] Xác nhận hẹn tham quan showroom`,
      template: 'visit-showroom-booking-created',
      context: {
        ...booking.toJSON(),
        bookingDate: moment(booking.bookingDate).format('YYYY-MM-DD HH:mm'),
        notes: booking.notes ?? 'Không'
      }
    })
    // 5. Send notification to staff

    return new IDResponse(booking._id)
  }

  public async paginate(filter: FilterQuery<VisitShowroomBooking>, paginationParams: PaginationParams) {
    const result = await this.visitShowroomBookingRepository.paginate(
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

  public async getOne(filter: FilterQuery<VisitShowroomBooking>) {
    const booking = await this.visitShowroomBookingRepository.findOne({
      conditions: {
        ...filter,
        status: {
          $ne: BookingStatus.DELETED
        }
      }
    })
    if (!booking) throw new AppException(Errors.VISIT_SHOWROOM_BOOKING_NOT_FOUND)

    return booking
  }
}
