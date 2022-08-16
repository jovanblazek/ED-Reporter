import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
import { SetupCommandBuilder } from '../commands/setup'
import logger from './logger'
import '../config/environment'

const TESTING_GUILD_ID = '822375694444134420'

const Rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '')
logger.info('Started refreshing application slash commands.')

Rest.put(Routes.applicationGuildCommands(process.env.APP_ID!, TESTING_GUILD_ID), {
  body: [SetupCommandBuilder],
})
  .then(() => {
    logger.info('Successfully reloaded application slash commands.')
  })
  .catch((error) => {
    logger.error('Failed to reload application slash commands.', error)
  })
