import { ActivityType, Client, GatewayIntentBits } from 'discord.js'
import { executeSubscribeCommand } from './commands/subscribe'
import { executeUnsubscribeCommand } from './commands/unsubscribe'
import { Commands } from './constants'
import { scheduleCronJob } from './utils'
import logger from './utils/logger'
import './config/environment'

const SCHEDULE = {
  DAY: '5 8-18 * * *',
  NIGHT: '5 21,0-6/3 * * *',
}

const BotClient = new Client({ intents: [GatewayIntentBits.GuildMessages] })

BotClient.once('ready', (client) => {
  logger.info('Bot is ready!')
  client.user.setActivity('Galnet', { type: ActivityType.Watching })
  scheduleCronJob({ schedule: SCHEDULE.DAY, client })
  scheduleCronJob({ schedule: SCHEDULE.NIGHT, client })
})

BotClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return
  }

  const { commandName } = interaction

  try {
    if (commandName === Commands.SUBSCRIBE) {
      await executeSubscribeCommand({ interaction })
    } else if (commandName === Commands.UNSUBSCRIBE) {
      await executeUnsubscribeCommand({ interaction })
    }
  } catch (error) {
    await interaction.reply(`Something went wrong 😔`)
    logger.error('Error while handling command', error)
  }
})

void BotClient.login(process.env.BOT_TOKEN)

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
})
