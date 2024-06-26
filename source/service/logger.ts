// outsource dependencies

// local dependencies
import { DEBUG, LOG_LEVEL } from '../constant';


const rowFormat = (rows: unknown): string[] => !Array.isArray(rows) ? []
  // : DEBUG ? rows.map(row => JSON.stringify(row, null, 2))
  : rows.map(v => Logger.stringify(v));
/**
 * In the future, it is possible to use alternative loggers.
 */
const doLog = (kind: string = 'LOG', level: number = 100, title: string, ...args) => (DEBUG || LOG_LEVEL >= level)
  // eslint-disable-next-line no-console
  && console.log(`${new Date().toJSON()} ${kind} [${title || '???'}]`, ...rowFormat(args));

export class Logger {

  public static stringify (value, offset = null) {
    const catched = [];
    // NOTE resolve circular structure
    return JSON.stringify(value, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (catched.includes(value)) { return; }
        catched.push(value);
      }
      return value;
    }, offset);
  }

  /**
   * the logs will be visible at any cases - always
   */
  public static error (title: string, ...args) {
    doLog('ERROR', -1, title, ...args);
  }

  /**
   * the logs will be visible at any cases - always
   */
  public static important (title: string, ...args) {
    doLog('INFO ', -1, title, ...args);
  }

  /**
   * will be visible at DEBUG>=2
   */
  public static warn (title: string, ...args) {
    doLog('WARN ', 2, title, ...args);
  }

  /**
   * will be visible at DEBUG>=4
   */
  public static info (title: string, ...args) {
    doLog('INFO ', 4, title, ...args);
  }

  /**
   * will be visible at DEBUG>=6
   */
  public static log (title: string, ...args) {
    doLog('LOG  ', 6, title, ...args);
  }

  /**
   * will be visible at DEBUG>=10
   */
  public static debug (title: string, ...args) {
    doLog('DEBUG', 10, title, ...args);
  }
}
