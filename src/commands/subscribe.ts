import { Language } from '@prisma/client'
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { Commands } from '../constants'
import { Prisma } from '../utils'

export const SubscribeCommandBuilder = new SlashCommandBuilder()
  .setName(Commands.SUBSCRIBE)
  .setDescription('Subscribe to the Galnet news')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((option) =>
    option.setName('channel').setDescription('The channel to send the news to').setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('language')
      .setDescription('Language')
      .setRequired(true)
      .addChoices(
        ...Object.values(Language).map((language) => ({ name: language, value: language }))
      )
  )

export const executeSubscribeCommand = async ({
  interaction,
}: {
  interaction: ChatInputCommandInteraction
}) => {
  await interaction.deferReply({ ephemeral: true })
  const channelId = interaction.options.getChannel('channel')?.id
  const language = interaction.options.getString('language') as Language
  const { guildId } = interaction
  if (!channelId || !guildId || !language) {
    await interaction.editReply('There was an error 😔')
    return
  }

  await Prisma.subscriber.upsert({
    where: {
      guildId,
    },
    create: {
      guildId,
      channelId,
      language,
    },
    update: {
      channelId,
      language,
    },
  })

  await interaction.editReply(`Setup complete! 🥳`)
}
