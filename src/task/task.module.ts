import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Task, TaskSchema } from '@task/schemas/task.schema'
import { TaskController } from '@task/controllers/task.controller'
import { TaskService } from '@task/services/task.service'
import { TaskRepository } from '@task/repositories/task.repository'
import { OrderModule } from '@order/order.module'
import { StaffModule } from '@staff/staff.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), OrderModule, StaffModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository]
})
export class TaskModule {}
