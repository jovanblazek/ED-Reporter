import { Client, GatewayIntentBits, InteractionType } from 'discord.js'
import { executeSetupCommand } from './commands/setup'
import { Commands } from './constants'
import logger from './utils/logger'
import './config/environment'

const BotClient = new Client({ intents: [GatewayIntentBits.GuildMessages] })

BotClient.once('ready', () => {
  logger.info('Bot is ready!')
})

BotClient.on('interactionCreate', async (interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    return
  }

  const { commandName } = interaction

  try {
    if (commandName === Commands.SETUP) {
      await executeSetupCommand({ interaction })
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
