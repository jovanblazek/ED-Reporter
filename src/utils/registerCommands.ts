import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
import { SubscribeCommandBuilder } from '../commands/subscribe'
import { UnsubscribeCommandBuilder } from '../commands/unsubscribe'
import logger from './logger'
import '../config/environment'

const CLIArguments = process.argv.slice(2)
const CommandBuilders = [SubscribeCommandBuilder, UnsubscribeCommandBuilder]

const Rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '')
logger.info('Started refreshing application slash commands.')

switch (CLIArguments[0]) {
  case 'dev':
    Rest.put(Routes.applicationGuildCommands(process.env.APP_ID!, process.env.TESTING_GUILD_ID!), {
      body: CommandBuilders,
    })
      .then(() => {
        logger.info('🏡 Successfully reloaded local application slash commands.')
      })
      .catch((error) => {
        logger.error('Failed to reload local application slash commands.', error)
      })
    break
  case 'prod':
    Rest.put(Routes.applicationCommands(process.env.APP_ID!), {
      body: CommandBuilders,
    })
      .then(() => {
        logger.info('🌍 Successfully reloaded global application slash commands.')
      })
      .catch((error) => {
        logger.error('Failed to reload global application slash commands.', error)
      })
    break
  default:
    logger.error('Invalid command line arguments.')
}
