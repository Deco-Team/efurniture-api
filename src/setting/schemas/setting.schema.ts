import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { Transform } from 'class-transformer'
import { SettingKey } from '@setting/contracts/constant';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({
  collection: 'settings',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Setting {
  constructor(id?: string) {
    this._id = id;
  }
  @Transform(({ value }) => value?.toString())
  _id?: string;

  @Prop({ enum: SettingKey, required: true })
  key: SettingKey;

  @Prop({ type: Object, required: true })
  value: object;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);