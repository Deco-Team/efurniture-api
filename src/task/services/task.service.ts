import { Injectable } from '@nestjs/common'
import { StaffRepository } from '@staff/repositories/staff.repository'
import { IDResponse, SuccessResponse } from '@common/contracts/dto'
import * as _ from 'lodash'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, FilterQuery } from 'mongoose'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { Status, TaskStatus, TaskType, UserRole } from '@common/contracts/constant'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { Task } from '@task/schemas/task.schema'
import { TaskRepository } from '@task/repositories/task.repository'
import { CreateShippingTaskDto } from '@task/dto/task.dto'
import { OrderService } from '@order/services/order.service'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class TaskService {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly staffRepository: StaffRepository,
    private readonly taskRepository: TaskRepository,
    private readonly orderService: OrderService,
    private readonly mailerService: MailerService
  ) {}

  public async createShippingTask(createShippingTaskDto: CreateShippingTaskDto) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Validate reporter and assignee
      const reporter = await this.staffRepository.findOne({
        conditions: {
          _id: createShippingTaskDto.reporterId
        },
        projection: '-password'
      })
      const assignee = await this.staffRepository.findOne({
        conditions: {
          _id: createShippingTaskDto.assigneeId
        },
        projection: '-password'
      })
      if (
        !assignee ||
        assignee.status !== Status.ACTIVE ||
        assignee.role !== UserRole.DELIVERY_STAFF ||
        reporter?.providerId.toString() !== assignee.providerId.toString()
      ) {
        throw new AppException(Errors.DELIVERY_STAFF_NOT_FOUND)
      }

      // 2. Check shipping task is already created by orderId
      const shippingTask = await this.taskRepository.findOne({
        conditions: {
          orderId: createShippingTaskDto.orderId
        }
      })
      if (shippingTask) {
        throw new AppException(Errors.ORDER_HAS_ASSIGNED_DELIVERY)
      }

      // 3. Create shipping task
      const task = await this.taskRepository.create(
        {
          ...createShippingTaskDto,
          type: TaskType.SHIPPING,
          reporter,
          assignee
        },
        { session }
      )

      // 4. Update isDeliveryAssigned to order
      await this.orderService.assignDeliveryToOrder(createShippingTaskDto.orderId, session)

      // 5. Send notification to staff

      await session.commitTransaction()
      return new IDResponse(task._id)
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }

  public async paginate(filter: FilterQuery<Task>, paginationParams: PaginationParams) {
    const result = await this.taskRepository.paginate(
      {
        status: {
          $ne: Status.DELETED
        },
        ...filter
      },
      { ...paginationParams }
    )
    return result
  }

  public async progressShippingTask(orderId: string, userId: string) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Update shipping task to IN_PROGRESS
      const task = await this.taskRepository.findOneAndUpdate(
        {
          orderId
        },
        {
          status: TaskStatus.IN_PROGRESS
        },
        { session }
      )
      if (
        !task ||
        task.status !== TaskStatus.PENDING ||
        task.type !== TaskType.SHIPPING ||
        task.assignee?._id.toString() !== userId
      ) {
        throw new AppException(Errors.SHIPPING_TASK_INVALID)
      }

      // 2. Update order status to DELIVERING
      await this.orderService.deliveryOrder(orderId, userId, UserRole.DELIVERY_STAFF, session)

      // 3. Send email/notification to customer
      // 4. Send notification to staff

      await session.commitTransaction()
      return new SuccessResponse(true)
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }

  public async completeShippingTask(orderId: string, userId: string) {
    // Execute in transaction
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // 1. Update shipping task to COMPLETED
      const task = await this.taskRepository.findOneAndUpdate(
        {
          orderId
        },
        {
          status: TaskStatus.COMPLETED,
          completionDate: new Date()
        },
        { session }
      )
      if (
        !task ||
        task.status !== TaskStatus.IN_PROGRESS ||
        task.type !== TaskType.SHIPPING ||
        task.assignee?._id.toString() !== userId
      ) {
        throw new AppException(Errors.SHIPPING_TASK_INVALID)
      }

      // 2. Update order status to COMPLETED
      const order = await this.orderService.completeOrder(orderId, userId, UserRole.DELIVERY_STAFF, session)

      // 3. Send email/notification to customer
      await this.mailerService.sendMail({
        to: order.customer.email,
        subject: `[Furnique] Đơn hàng #${order.orderId} đã được giao thành công`,
        template: 'order-completed',
        context: {
          ...order,
          _id: order._id,
          orderId: order.orderId,
          customer: order.customer,
          items: order.items.map((item) => {
            const variant = item.product.variants.find((variant) => variant.sku === item.sku)
            return {
              ...item,
              product: {
                ...item.product,
                variant: {
                  ...variant,
                  price: Intl.NumberFormat('en-DE').format(variant.price)
                }
              }
            }
          }),
          totalAmount: Intl.NumberFormat('en-DE').format(order.totalAmount)
        }
      })
      // 4. Send notification to staff

      await session.commitTransaction()
      return new SuccessResponse(true)
    } catch (error) {
      await session.abortTransaction()
      console.error(error)
      throw error
    }
  }
}
