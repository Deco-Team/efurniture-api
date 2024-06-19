import { Errors } from '@common/contracts/error'
import { AppException } from '@common/exceptions/app.exception'
import { Injectable, PipeTransform } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any) {
    const validObjectId = Types.ObjectId.isValid(value)
    if (!validObjectId) throw new AppException(Errors.OBJECT_NOT_FOUND)

    return Types.ObjectId.createFromHexString(value)
  }
}
