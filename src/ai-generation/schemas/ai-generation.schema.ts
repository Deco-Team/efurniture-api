import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AIGenerationPlatform, AIGenerationType } from '../contracts/constant'

export type AIGenerationDocument = HydratedDocument<AIGeneration>

@Schema({
  collection: 'ai-generations',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class AIGeneration {
  constructor(id?: string) {
    this._id = id
  }
  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String })
  customerId: string

  @ApiProperty({ enum: AIGenerationType })
  @Prop({ enum: AIGenerationType, default: AIGenerationType.TEXT_TO_MODEL })
  type: AIGenerationType

  @ApiProperty({ enum: AIGenerationPlatform })
  @Prop({ enum: AIGenerationPlatform, default: AIGenerationPlatform.TRIPO_3D_AI })
  platform: AIGenerationPlatform

  @ApiProperty()
  @Prop({ type: Number })
  cost: number

  @ApiProperty()
  @Prop({ type: String })
  taskId?: string // used for TEXT_TO_MODEL

  @ApiProperty()
  @Prop({ type: String })
  imageUrl?: string // used for TEXT_TO_IMAGE
}

export const AIGenerationSchema = SchemaFactory.createForClass(AIGeneration)

AIGenerationSchema.plugin(paginate)
