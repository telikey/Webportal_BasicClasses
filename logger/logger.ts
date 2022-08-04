import { AppConfig } from "@basicClasses/appConfig/appConfig";
import { Browser } from "@basicClasses/browser/browser";
import _ from "lodash";

export enum LogLevel {
  verbose = 0,
  log = 1,
  info = 2,
  warn = 3,
  error = 4,
}

export class Logger {
  public static userMinLevel: LogLevel;
  public static userIncludeStack: boolean;

  // public static instance = new Logger(`Global`);

  private name: string;
  private minLevel: LogLevel;
  private includeStack: boolean;

  public static setMinLevel(level: string) {
    const levelCasted = _.get(LogLevel, level);
    if (!_.isNil(levelCasted)) {
      Logger.userMinLevel = levelCasted;
    }
  }

  public static setIncludeStack(include: boolean) {
    Logger.userIncludeStack = include;
  }

  constructor(from: string | { constructor: { name: string } }) {
    this.name = _.isString(from) ? from : from.constructor.name;
  }

  private static getMinLevel(levelName: string): LogLevel {
    const result = _.get(LogLevel, levelName);

    if (_.isNil(result) || !_.isNumber(result)) {
      console.error('Can`t apply logLevel as "' + levelName + '"');
    }

    return result || LogLevel.error;
  }

  public groupStart(label?: string, collapsed = false): void {
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  public groupEnd(): void {
    console.groupEnd();
  }

  public verbose(...t: any[]): void {
    // tslint:disable-next-line: no-console
    this.print(console.debug, LogLevel.verbose, ...t);
  }

  public log(...t: any[]): void {
    this.print(console.log, LogLevel.log, ...t);
  }

  public info(...t: any[]): void {
    this.print(console.log, LogLevel.info, ...t);
  }

  public warn(...t: any[]): void {
    this.print(console.warn, LogLevel.warn, ...t);
  }

  public error(...t: any[]): void {
    this.print(console.error, LogLevel.error, ...t);
  }

  public trace(name?: string): LoggerTrace {
    const trace = new LoggerTrace(name || this.name, this);
    return trace;
  }

  private print(fn: (...t: any) => void, currLevel: number, ...t: any[]) {
    if (this.currentLogLevel() > currLevel) {
      return;
    }

    const args = [];

    if (Browser.isIE) {
      args.push(" sv |");
    } else {
      args.push(
        "%c sv ",
        "color:white; background: #2D2D7D; border-right: 1px solid white;"
      );
    }

    args.push(`${this.name}`);
    args.push(...t);

    if (_.isNil(this.includeStack)) {
      this.includeStack = AppConfig.config.logger.includeStack || false;
    }

    const includeStack = this.includeStack || Logger.userIncludeStack;

    if (includeStack && currLevel < LogLevel.warn) {
      const errorInstance = new Error("ℹ");
      args.push(errorInstance);
    }
    fn(...args);
  }

  private currentLogLevel(): LogLevel {
    if (!_.isNil(Logger.userMinLevel)) {
      return Logger.userMinLevel;
    }

    if (!this.minLevel) {
      this.minLevel = Logger.getMinLevel(AppConfig.config.logger.minLevel);
    }

    return this.minLevel;
  }
}

export class LoggerTrace {
  private static get delimeter() {
    return 1000;
  }

  private name: string;
  private start: number;
  private log: Logger;

  constructor(name: string, log: Logger) {
    this.name = name;
    this.start = Date.now();
    this.log = log;
  }

  public finish(...t: any[]): void {
    const now = Date.now();
    const diff = now - this.start;
    const seconds = diff / LoggerTrace.delimeter;
    const msg = `${this.name}: estimate: ${seconds}s.`;
    this.log.verbose(msg, ...t);
  }
}
