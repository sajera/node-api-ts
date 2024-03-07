// outsource dependencies
import * as dotenv from 'dotenv';
// local dependencies

// NOTE make sure that the variables are acceptable for TypeScript
const varBoolean = (value: string = ''): boolean => /^true|1$/i.test(value);
const varString = (value: string = ''): string => /^(null|undefined)$/i.test(value) ? '' : value;
const varNumber = (value: string = ''): number => Number(value) || parseFloat(value) || 0;
// const toArrayStrings = (value: string = ''): string[] => value ? value.split(/\s*,\s*/) : [];

// NOTE read the local configuration @example .env.local-prod
const localEnv = `.env.local${process.env.NODE_ENV || ''}`;
// IMPORTANT avoid overriding the original environment variables passed through the process
dotenv.config({ path: [localEnv, '.env'] }).parsed;
// NOTE to log what the "dotenv" resolve from .env files
// export const env = dotenv.config({ debug: varBoolean(process.env.DEBUG), path: [localEnv, '.env'] }).parsed;

// NOTE just to make sure the production mode used by default
!process.env.NODE_ENV && (process.env.NODE_ENV = 'production');

// NOTE
export const NODE_ENV = varString(process.env.NODE_ENV);
export const LOG_LEVEL = process.env.DEBUG ? 100 : varNumber(process.env.LOG_LEVEL);
export const DEBUG = varBoolean(process.env.DEBUG) || LOG_LEVEL > 10;

// NOTE server variables
export const PORT = varNumber(process.env.PORT || '80');
export const HOST = varString(process.env.HOST || '0.0.0.0');
export const API_PATH = varString(process.env.API_PATH);

export const STATIC_PATH = varString(process.env.STATIC_PATH);

export const SWAGGER_PATH = varString(process.env.SWAGGER_PATH);

export const COOKIE_SECRET = varString(process.env.COOKIE_SECRET);

export const JWT_SECRET = varString(process.env.JWT_SECRET);
export const SID_SECRET = varString(process.env.SID_SECRET);

export const PWD_HASH = varNumber(process.env.PWD_HASH);
export const PWD_SALT = varString(process.env.PWD_SALT);

export const REDIS_URL = varString(process.env.REDIS_URL);

export const MONGO_URL = varString(process.env.MONGO_URL)
