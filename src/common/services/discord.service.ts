import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APIEmbedField, EmbedBuilder, WebhookClient } from 'discord.js'

@Injectable()
export class DiscordService {
  webhookClient: WebhookClient
  embed = new EmbedBuilder().setTitle('Furnique API').setColor(0x00ffff)
  constructor(private readonly configService: ConfigService) {
    this.webhookClient = new WebhookClient({
      id: this.configService.get('discord.webhookId'),
      token: this.configService.get('discord.webhookToken')
    })
  }

  async sendMessage({ content, fields }: { content?: string; fields?: APIEmbedField[] }) {
    try {
      await this.webhookClient.send({
        content,
        username: 'Furnique Bot',
        //avatarURL: 'https://imgur.com/GHh8QIp.png',
        avatarURL:
          'https://nftcalendar.io/storage/uploads/2021/11/30/webp_net-gifmaker__1__1130202114500961a63a2147d4d.gif',
        embeds: [fields ? this.embed.setFields(fields) : this.embed]
      })
    } catch (err) {}
  }
}
