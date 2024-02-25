// local dependencies
const pkg = require('../../package.json');

// all environment variables
export * from './environment';

// NOTE project meta
export const APP_NAME = pkg.name;
export const APP_VERSION = pkg.version;

// TODO
/**************************************
 * let's fuck TS using bloody hacks :)
 **************************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function forceCast<T> (v: any): T { return v; }
