// local dependencies
const pkg = require('../../package.json');

// all environment variables
export * from './environment';

// NOTE project meta
export const APP_NAME = pkg.name;
export const APP_VERSION = pkg.version;
