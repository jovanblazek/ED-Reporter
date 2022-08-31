import { Language } from '@prisma/client'
import got from 'got'
import logger from './logger'
import { Prisma } from './prismaClient'
import { translateText } from './translator'

const GALNET_URL =
  'https://cms.zaonce.net/en-GB/jsonapi/node/galnet_article?sort=-created&page%5Blimit%5D=3'

type GalnetResponseType = {
  data: {
    attributes: {
      title: string
      published_at: Date
      field_galnet_guid: string
      field_galnet_image: string
      field_slug: string
      body: {
        value: string
      }
    }
  }[]
}

const fetchGalnet = async () => {
  try {
    const { data } = await got(GALNET_URL).json<GalnetResponseType>()
    return data
  } catch (error) {
    logger.error('Error while fetching galnet', error)
    return null
  }
}

const getLastArticleGalnetId = async () => {
  const lastArticle = await Prisma.article.findFirst({
    where: {
      language: Language.ENGLISH,
    },
    orderBy: {
      galnetPublishedAt: 'desc',
    },
  })
  return lastArticle?.galnetId || null
}

const filterNewArticles = ({
  lastArticleGalnetId,
  articles,
}: {
  lastArticleGalnetId: string | null
  articles: GalnetResponseType['data']
}) => {
  if (!lastArticleGalnetId) {
    return articles
  }

  // find index of last article
  const lastArticleIndex = articles.findIndex(
    (article) => article.attributes.field_galnet_guid === lastArticleGalnetId
  )

  return lastArticleIndex
    ? articles.slice(0, lastArticleIndex > 0 ? lastArticleIndex : undefined)
    : []
}

const saveArticles = async ({
  articles,
  language,
}: {
  articles: GalnetResponseType['data']
  language: Language
}) => {
  const articlesToSave = articles.map(
    ({
      attributes: {
        title,
        published_at: galnetPublishedAt,
        field_galnet_guid: galnetId,
        field_galnet_image: imageName,
        body: { value: content },
      },
    }) => ({
      language,
      galnetId,
      galnetPublishedAt,
      title,
      content,
      imageName,
    })
  )

  articlesToSave.sort(
    (a, b) => new Date(a.galnetPublishedAt).getTime() - new Date(b.galnetPublishedAt).getTime()
  )

  await Prisma.article.createMany({
    data: articlesToSave,
  })

  logger.info(`Saved ${articlesToSave.length} articles with language ${language}`)
}

const translateArticlesToCzech = async ({ articles }: { articles: GalnetResponseType['data'] }) => {
  return Promise.all(
    articles.map(
      async ({
        attributes: {
          title,
          body: { value: content, ...restBody },
          ...restAttributes
        },
        ...rest
      }) => ({
        attributes: {
          title: (await translateText(title, 'en', 'cs')) ?? title,
          body: {
            value: (await translateText(content, 'en', 'cs')) ?? content,
            ...restBody,
          },
          ...restAttributes,
        },
        ...rest,
      })
    )
  )
}

export const checkForNewArticles = async () => {
  try {
    const lastArticleGalnetId = await getLastArticleGalnetId()
    const galnetArticles = await fetchGalnet()
    if (!galnetArticles) {
      return null
    }

    const newArticles = filterNewArticles({
      lastArticleGalnetId,
      articles: galnetArticles,
    })
    if (!newArticles.length) {
      return null
    }

    await saveArticles({
      articles: newArticles,
      language: Language.ENGLISH,
    })

    const czechArticles = await translateArticlesToCzech({
      articles: newArticles,
    })

    await saveArticles({
      articles: czechArticles,
      language: Language.CZECH,
    })

    return newArticles.map(({ attributes: { field_galnet_guid } }) => field_galnet_guid)
  } catch (error) {
    logger.error('Error while checking for new articles', error)
    return null
  }
}
