import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { createHmac } from 'crypto'
import { Connection, ClientSession } from 'mongoose'

@Injectable()
export class HelperService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async executeCommandsInTransaction(
    fn: (session: ClientSession, data?: Record<string, any>) => Promise<any>,
    data?: Record<string, any>
  ): Promise<any> {
    let result: any
    const session = await this.connection.startSession()
    await session.withTransaction(async () => {
      result = await fn(session, data)
    })
    return result
  }

  createSignature(rawData: string, key: string) {
    const signature = createHmac('sha256', key).update(rawData).digest('hex')
    return signature
  }
}
