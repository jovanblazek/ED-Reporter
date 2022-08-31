import { Article, Language } from '@prisma/client'
import { Client, EmbedBuilder } from 'discord.js'
import logger from './logger'
import { Prisma } from './prismaClient'

const createEmbed = ({ title, content, imageName, galnetId, galnetPublishedAt }: Article) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(content)
    .setColor('#FB9227')
    .setURL(`https://community.elitedangerous.com/galnet/uid/${galnetId}`)
    .setImage(`https://hosting.zaonce.net/elite-dangerous/galnet/${imageName}.png`)
    .setTimestamp(galnetPublishedAt)
    .setFooter({
      text: 'Galnet',
      iconURL:
        'https://cdn.discordapp.com/attachments/1009111578903318608/1014540923364987002/reporter-logo.png',
    })
}

export const reportNews = async ({
  client,
  newArticleGalnetIds,
}: {
  client: Client
  newArticleGalnetIds: string[]
}) => {
  try {
    // get new articles
    const articles = await Prisma.article.findMany({
      where: {
        galnetId: {
          in: newArticleGalnetIds,
        },
      },
    })

    if (!articles.length) {
      return
    }

    // group them by language
    const articlesByLanguage = articles.reduce((acc, article) => {
      const { language } = article
      return {
        ...acc,
        [language]: [...(acc[language] ?? []), article],
      }
    }, {} as { [key in Language]: Article[] })

    // send articles to each subscriber by language
    const subscribers = await Prisma.subscriber.findMany()
    subscribers.map(async ({ language: subscriberLanguage, channelId }) => {
      const articlesForSubscriber = articlesByLanguage[subscriberLanguage]
      if (!articlesForSubscriber) {
        return
      }

      const channel = await client.channels.fetch(channelId)
      if (channel && channel.isTextBased()) {
        await channel.send({
          embeds: articlesForSubscriber.map((article) => createEmbed(article)),
        })
      }
    })
  } catch (error) {
    logger.error('Error while reporting news', error)
  }
}
