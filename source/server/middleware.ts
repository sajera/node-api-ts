
// outsource dependencies
import * as http from 'http';
import * as multer from 'multer';
import * as express from 'express';
// local dependencies
import { Logger, AuthService, Yup } from '../service';

interface JSONAnnotation { // TODO import * as bodyParser from 'body-parser'; bodyParser.json;
  type?: string;
  limit?: string;
  inflate?: boolean;
  strict?: boolean;
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#syntax
  reviver?(key: string, value: any): any;
  // @see https://www.npmjs.com/package/body-parser#verify
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;

  schema?: Yup<unknown>
}
export interface JSONEndpoint extends JSONAnnotation {}
export function jsonMiddleware ({ schema, ...options }: JSONAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return express.json({ // @see https://www.npmjs.com/package/body-parser#options
    type: '*/json',
    inflate: true, // false => reject compressed body
    strict: true,
    limit: '5mb',
    ...options,
  });
}
/**
 * settings of the "body-parse".json middleware
 * @example
 * /@API({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @JSON({ ... })
 *     @Endpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_JSON = Symbol('JSON');
export function JSON (options: JSONEndpoint) {
  return Reflect.metadata(ANNOTATION_JSON, options);
}


interface URLEncodedAnnotation { // TODO import * as bodyParser from 'body-parser'; bodyParser.json;
  type?: string;
  limit?: string;
  inflate?: boolean;
  extended?: boolean;
  // @see https://www.npmjs.com/package/body-parser#verify
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
}
export interface URLEncodedEndpoint extends URLEncodedAnnotation {}
export function urlEncodedMiddleware (options: URLEncodedAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return express.urlencoded({ // @see https://www.npmjs.com/package/body-parser#options-3
    type: '*/x-www-form-urlencoded',
    extended: true,
    inflate: true, // false => reject compressed body
    limit: '2mb',
    ...options
  });
}
/**
 * settings of the "body-parse".urlencoded middleware
 * @example
 * /@API({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @URLEncoded({ ... })
 *     @Endpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_URLENCODED = Symbol('URLENCODED');
export function URLEncoded (options: URLEncodedEndpoint) {
  return Reflect.metadata(ANNOTATION_URLENCODED, options);
}


interface MulterAnnotation { // TODO to know more
  any?: any;
}
export interface MulterEndpoint extends MulterAnnotation {
  any?: any;
}
export function multerMiddleware (options: MulterAnnotation) {
  Logger.important('MULTER', 'Middleware not implemented yet', options);
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  // TODO need real example
  return multer().none();
}
/**
 * settings of the "multer" middleware
 * @example
 * /@API({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Multer({ ... })
 *     @Endpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_MULTER = Symbol('MULTER');
export function Multer (options: MulterEndpoint) {
  return Reflect.metadata(ANNOTATION_MULTER, options);
}

declare module 'express' {
  export interface Request {
    auth?: AuthService.Auth;
  }
}
interface AuthAnnotation {
  lightweight?: boolean; // not sure it useful
  optional?: boolean;
}
export interface AuthEndpoint extends AuthAnnotation {}
export function authMiddleware ({ optional, lightweight }: AuthAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    try {
      // NOTE verify token sign and expiration only
      const auth = AuthService.verifyAuthAccess(request.header('Authorization'));
      // NOTE throw in case "Session Interrupted/Invalidated"
      !lightweight && (request.auth = await AuthService.getStoredAuth(null, auth.sid));
      return next();
    } catch (error) {
      // NOTE allow to "try" to get auth and pass in case it missing
      if (optional) { return next(); }
      Logger.debug('AUTH:401', error.message);
      return response.status(401).type('json').send('Unauthorized');
    }
  };
}
/**
 * settings of the "auth" middleware
 * @example
 * /@API({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Auth({ ... })
 *     @Endpoint({ path: '/express/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_AUTH = Symbol('AUTH');
export function Auth (options: AuthEndpoint) {
  return Reflect.metadata(ANNOTATION_AUTH, options);
}
