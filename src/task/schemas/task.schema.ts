import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Priority, TaskStatus, TaskType } from '@src/common/contracts/constant'
import { StaffDto } from '@staff/dto/staff.dto'
import { Transform } from 'class-transformer'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'

export type TaskDocument = HydratedDocument<Task>

@Schema({
  collection: 'tasks',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Task {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string

  @ApiProperty()
  @Prop({ type: String, required: true })
  description: string

  @ApiProperty()
  @Prop({ type: Date })
  startDate: Date

  @ApiProperty()
  @Prop({ type: Date })
  dueDate: Date

  @ApiPropertyOptional()
  @Prop({ type: Date })
  completionDate?: Date

  @ApiProperty()
  @Prop({
    enum: TaskType,
    default: TaskType.SHIPPING
  })
  type: TaskType

  @ApiProperty()
  @Prop({
    enum: Priority,
    default: Priority.MEDIUM
  })
  priority: Priority

  @ApiProperty()
  @Prop({
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus

  @ApiProperty()
  @Prop()
  reporter: StaffDto

  @ApiProperty()
  @Prop()
  assignee: StaffDto

  @ApiPropertyOptional({name: 'OrderId of SHIPPING task'})
  @Prop()
  orderId?: string
}

export const TaskSchema = SchemaFactory.createForClass(Task)

TaskSchema.plugin(paginate)
