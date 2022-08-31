import { Client } from 'discord.js'
import cron from 'node-cron'
import { checkForNewArticles } from './galnet'
import logger from './logger'
import { reportNews } from './reporter'

export const scheduleCronJob = ({ schedule, client }: { schedule: string; client: Client }) => {
  cron.schedule(
    schedule,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      logger.info('CRON running')
      const newArticleGalnetIds = await checkForNewArticles()
      if (!newArticleGalnetIds) {
        return
      }
      await reportNews({ client, newArticleGalnetIds })
    },
    {
      timezone: 'UTC',
    }
  )
}
