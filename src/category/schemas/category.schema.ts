import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Status } from '@common/contracts/constant'
import { Transform } from 'class-transformer'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'

export type CategoryDocument = HydratedDocument<Category>

@Schema({
  collection: 'categories',
  timestamps: {
    createdAt: true,
    updatedAt: true
  },
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Category {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String, required: true})
  name: string

  @ApiProperty()
  @Prop({ type: String })
  description: string

  @ApiProperty()
  @Prop({
    type: String
  })
  image: string

  @Prop({
    enum: Status,
    default: Status.ACTIVE
  })
  status: Status
}

export const CategorySchema = SchemaFactory.createForClass(Category)

CategorySchema.plugin(paginate)
