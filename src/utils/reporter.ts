import { Article, Language } from '@prisma/client'
import { Client, EmbedBuilder } from 'discord.js'
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
      iconURL: 'https://edassets.org/static/img/companies/GalNet.png',
    })
}

export const reportNews = async ({ client }: { client: Client }) => {
  // get articles from past hour
  const articles = await Prisma.article.findMany({
    where: {
      createdAt: {
        gt: new Date(Date.now() - 3600000),
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
}
