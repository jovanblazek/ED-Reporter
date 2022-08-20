import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { Commands } from '../constants'

export const SetupCommandBuilder = new SlashCommandBuilder()
  .setName(Commands.SETUP)
  .setDescription('Setup the bot')
  .addChannelOption((option) =>
    option.setName('channel').setDescription('The channel to send the news to').setRequired(true)
  )

// TODO add remove command
// TODO on setup, remove the old data and insert the new data
export const executeSetupCommand = async ({
  interaction,
}: {
  interaction: CommandInteraction<CacheType>
}) => {
  await interaction.reply(`Hello there!`)
}
