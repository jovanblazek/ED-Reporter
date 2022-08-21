import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { Commands } from '../constants'
import { Prisma } from '../utils'

export const UnsubscribeCommandBuilder = new SlashCommandBuilder()
  .setName(Commands.UNSUBSCRIBE)
  .setDescription('Unsubscribe from the news')

export const executeUnsubscribeCommand = async ({
  interaction,
}: {
  interaction: ChatInputCommandInteraction
}) => {
  await interaction.deferReply({ ephemeral: true })
  const { guildId } = interaction
  if (!guildId) {
    await interaction.editReply('There was an error 😔')
    return
  }

  await Prisma.subscriber.delete({
    where: {
      guildId,
    },
  })

  await interaction.editReply(`We are sad to see you go 😔`)
}