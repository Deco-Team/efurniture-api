import { Errors } from '@common/contracts/error'
import { AppException } from '@common/exceptions/app.exception'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class TrimRequestBodyPipe implements PipeTransform {
  private isObj(obj: any): boolean {
    return typeof obj === 'object' && obj !== null
  }

  private trim(values) {
    Object.keys(values).forEach((key) => {
      if (this.isObj(values[key])) {
        values[key] = this.trim(values[key])
      } else {
        if (typeof values[key] === 'string') {
          values[key] = values[key].trim()
        }
      }
    })

    return values
  }

  transform(values: any, metadata: ArgumentMetadata) {
    const { type } = metadata
    if (type === 'body') {
      if (this.isObj(values)) {
        return this.trim(values)
      }

      throw new AppException(Errors.VALIDATION_FAILED)
    }

    return values
  }
}
