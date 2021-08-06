import clc from 'cli-color'
import moment from 'moment'
import yn from 'yn'

export enum LoggerLevel {
  Debug = 10,
  Warn = 20,
  Error = 30,
  Critical = 40,
  Info = 50
}

export class Logger {
  colors = {
    [LoggerLevel.Debug]: clc.blue,
    [LoggerLevel.Warn]: clc.yellow,
    [LoggerLevel.Error]: clc.red,
    [LoggerLevel.Critical]: clc.bgRed,
    [LoggerLevel.Info]: clc.green
  }

  constructor(private scope: string) {}

  sub(scope: string) {
    return new Logger(`${this.scope}:${scope}`)
  }

  info(message: string, data?: any) {
    this.print(message, data, LoggerLevel.Info)
  }

  debug(message: string, data?: any) {
    this.print(message, data, LoggerLevel.Debug)
  }

  warn(message: string, data?: any) {
    this.print(message, data, LoggerLevel.Warn)
  }

  error(error: Error | undefined, message?: string, data?: any) {
    const timeFormat = 'L HH:mm:ss.SSS'
    const time = moment().format(timeFormat)

    const timeText = clc.blackBright(time)
    const titleText = clc.bold(
      this.colors[LoggerLevel.Error](yn(process.env.SPINNED) ? `[Messaging] ${this.scope}` : this.scope)
    )
    if (message?.length && message[message.length - 1] !== '.') {
      message += '.'
    }

    if (data) {
      // eslint-disable-next-line no-console
      console.log(timeText, titleText, message, data, error)
    } else {
      // eslint-disable-next-line no-console
      console.log(timeText, titleText, message, error)
    }
  }

  private print(message: string, data: any, level: LoggerLevel) {
    const timeFormat = 'L HH:mm:ss.SSS'
    const time = moment().format(timeFormat)

    const timeText = clc.blackBright(time)
    const titleText = clc.bold(this.colors[level](yn(process.env.SPINNED) ? `[Messaging] ${this.scope}` : this.scope))

    if (data) {
      // eslint-disable-next-line no-console
      console.log(timeText, titleText, message, data)
    } else {
      // eslint-disable-next-line no-console
      console.log(timeText, titleText, message)
    }
  }
}
