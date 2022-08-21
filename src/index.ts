import { Client, GatewayIntentBits } from 'discord.js'
import { executeSubscribeCommand } from './commands/subscribe'
import { executeUnsubscribeCommand } from './commands/unsubscribe'
import { Commands } from './constants'
import logger from './utils/logger'
import './config/environment'

const BotClient = new Client({ intents: [GatewayIntentBits.GuildMessages] })

BotClient.once('ready', () => {
  logger.info('Bot is ready!')
  // await checkForNewArticles()
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
