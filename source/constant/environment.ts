// outsource dependencies
import * as dotenv from 'dotenv';
// local dependencies

// NOTE make sure that the variables are acceptable for TypeScript
const varBoolean = (value: string = ''): boolean => /^true$/i.test(value);
const varString = (value: string = ''): string => /^(null|undefined)$/i.test(value) ? '' : value;
const varNumber = (value: string = ''): number => Number(value) || parseFloat(value) || 0;
const toArrayStrings = (value: string = ''): string[] => value ? value.split(/\s*,\s*/) : [];

// NOTE read the local configuration
const localEnv = `.env.local${process.env.NODE_ENV || ''}`;
// NOTE just to make sure the production mode used by default
!process.env.NODE_ENV && (process.env.NODE_ENV = 'production');
// IMPORTANT avoid overriding the original environment variables passed through the process
dotenv.config({ debug: varBoolean(process.env.DEBUG), path: [localEnv, '.env'] }).parsed;
// NOTE to log what the "dotenv" resolve from .env files
// export const env = dotenv.config({ debug: varBoolean(process.env.DEBUG), path: [localEnv, '.env'] }).parsed;

// NOTE
export const LOG_LEVEL = varNumber(process.env.DEBUG);
export const DEBUG = varBoolean(process.env.DEBUG) || LOG_LEVEL > 10;
export const NODE_ENV = varString(process.env.NODE_ENV);

// NOTE server variables
export const PORT = varNumber(process.env.PORT || '80');
export const HOST = varString(process.env.HOST || '0.0.0.0');
export const API_PATH = varString(process.env.API_PATH);
