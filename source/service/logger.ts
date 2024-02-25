
// local dependencies
import { DEBUG, LOG_LEVEL } from '../constant';

// TODO better formatting

const rowFormat = (rows: any): string[] => !Array.isArray(rows) ? []
  // : DEBUG ? rows.map(row => JSON.stringify(row, null, 2))
  : rows.map(row => JSON.stringify(row));
/**
 * In the future, it is possible to use alternative loggers.
 */
const doLog = (kind: string = 'LOG', level: number = 100, title: string, ...args: any[]) => {
  (DEBUG || LOG_LEVEL >= level) && console.log.apply(
    console,
    [`${new Date().toJSON()} ${kind} [${title || '???'}]`, ...rowFormat(args)]
  );
};

export class Logger {

  /**
   * the logs will be visible at any cases - always
   */
  public static error (title: string, ...args: any[]) {
    doLog('ERROR', -1, title, ...args);
  }

  /**
   * the logs will be visible at any cases - always
   */
  public static important (title: string, ...args: any[]) {
    doLog('INFO ', -1, title, ...args);
  }

  /**
   * will be visible at DEBUG>=2
   */
  public static warn (title: string, ...args: any[]) {
    doLog('WARN ', 2, title, ...args);
  }

  /**
   * will be visible at DEBUG>=4
   */
  public static info (title: string, ...args: any[]) {
    doLog('INFO ', 4, title, ...args);
  }

  /**
   * will be visible at DEBUG>=6
   */
  public static log (title: string, ...args: any[]) {
    doLog('LOG  ', 6, title, ...args);
  }

  /**
   * will be visible at DEBUG>=10
   */
  public static debug (title: string, ...args: any[]) {
    doLog('DEBUG', 10, title, ...args);
  }
}
