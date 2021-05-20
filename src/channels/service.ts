import express, { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { MessageService } from '../messages/service'
import { Channel } from './base/channel'
import { ChannelConfig } from './base/config'
import { SlackChannel } from './slack/channel'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { Routers } from './types'

export class ChannelService extends Service {
  private channels: Channel<any>[]
  private routers: Routers

  constructor(
    private configService: ConfigService,
    private kvsService: KvsService,
    private conversationService: ConversationService,
    private messagesService: MessageService,
    router: Router
  ) {
    super()

    const fullRouter = Router()
    fullRouter.use(express.json())
    fullRouter.use(express.urlencoded({ extended: true }))
    router.use('/', fullRouter)

    this.routers = {
      full: fullRouter,
      raw: router
    }

    this.channels = [
      new TwilioChannel(this.getConfig('twilio'), kvsService, conversationService, messagesService, this.routers),
      new TelegramChannel(this.getConfig('telegram'), kvsService, conversationService, messagesService, this.routers),
      new SlackChannel(this.getConfig('slack'), kvsService, conversationService, messagesService, this.routers),
      new TeamsChannel(this.getConfig('teams'), kvsService, conversationService, messagesService, this.routers)
    ]
  }

  async setup() {
    for (const channel of this.channels) {
      const config = this.getConfig(channel.id)
      if (config.enabled) {
        await channel.setup()
      }
    }
  }

  list() {
    return this.channels
  }

  get(channelId: string) {
    return this.channels.find((x) => x.id === channelId)
  }

  getConfig(channelId: string): ChannelConfig {
    return {
      ...(this.configService.current.channels?.[channelId] || {}),
      externalUrl: this.configService.current.externalUrl
    }
  }
}