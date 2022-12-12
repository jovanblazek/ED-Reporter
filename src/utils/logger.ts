/* eslint-disable @typescript-eslint/naming-convention */
import once from 'lodash/once'
import { createLogger, format, transports } from 'winston'

const { NODE_ENV } = process.env

type LogItem = {
  level: string
  message: string
  data?: Record<string, unknown>
  error?: string
  timestamp?: string
}

const TIMESTAMP_FORMAT = { format: 'YYYY-MM-DD HH:mm:ss' }

const formatData = (item: LogItem) => {
  const { level, message, timestamp, ...rest } = item
  const stringifiedRest = JSON.stringify(rest, null, '  ')
  return stringifiedRest !== '{}' ? `\n\x1b[32mAdditional data:\x1b[39m\n${stringifiedRest}` : ''
}
const formatError = (item: LogItem) => (item.error ? ` - ${item.error}` : '')

const consoleFormatter = format.combine(
  format.colorize(),
  format.timestamp(TIMESTAMP_FORMAT),
  format.printf(
    (item: LogItem) =>
      `${item.timestamp || ''} [${item.level}]: ${item.message}${formatData(item)}${formatError(
        item
      )}`
  )
)

const initLogger = once(() =>
  createLogger({
    level: 'debug',
    format: consoleFormatter,
    transports: [new transports.Console()],
    silent: NODE_ENV === 'test',
  })
)

const loggerInstance = initLogger()

const logger = {
  debug: loggerInstance.debug.bind(loggerInstance),
  info: loggerInstance.info.bind(loggerInstance),
  warn: loggerInstance.warn.bind(loggerInstance),
  error: loggerInstance.error.bind(loggerInstance),
}
export default logger
