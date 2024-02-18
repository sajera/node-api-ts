
// local dependencies
import { DEBUG, LOG_LEVEL, APP_NAME, APP_VERSION } from './constant';

// TODO move to "service" ???
// TODO better formatting

const rowFormat = (rows: any): string[] => !Array.isArray(rows) ? []
  : DEBUG ? rows.map(row => JSON.stringify(row, null, 2))
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

// NOTE the logs will be visible at any cases - always
export const error = (title: string, ...args: any[]) => doLog('ERROR', -1, title, ...args);
export const important = (title: string, ...args: any[]) => doLog('=>', -1, title, ...args);
// 1 - tricky but DEBUG=1 will enable debug for all logs
// DEBUG>=2
export const warn = (title: string, ...args: any[]) => doLog('WARN', 2, title, ...args);
// 3
// DEBUG>=4
export const info = (title: string, ...args: any[]) => doLog('INFO', 4, title, ...args);
// 5
// DEBUG>=6
export const log = (title: string, ...args: any[]) => doLog('LOG', 6, title, ...args);
// 7
// 8
// 9
// DEBUG>= 10
export const debug = (title: string, ...args: any[]) => doLog('DEBUG', 6, title, ...args);
