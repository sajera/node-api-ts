
// outsource dependencies
import * as http from 'http';
import * as multer from 'multer';
import * as express from 'express';
// local dependencies
import { Logger, AuthService } from '../service';

interface JSONAnnotation { // TODO import * as bodyParser from 'body-parser'; bodyParser.json;
  type?: string;
  limit?: string;
  inflate?: boolean;
  strict?: boolean;
  reviver?(key: string, value: any): any;
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
}
export interface JSONEndpoint extends JSONAnnotation {
  any?: any;
}
export function jsonMiddleware (options: JSONAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return express.json({ // @see https://www.npmjs.com/package/body-parser#options
    // @see https://www.npmjs.com/package/body-parser#verify
    // verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: string = 'UTF-8') => throw new Error('At som reason'),
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#syntax
    // reviver: (key: string, value: any): any => ''
    limit: options.limit || '5mb',
    type: options.type || '*/json',
    strict: options.strict || true,
    inflate: options.inflate || true, // false => reject compressed body
  });
}
/**
 * settings of the "body-parse".json middleware
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @JSON({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_JSON = Symbol('JSON')
export function JSON (options: JSONEndpoint) {
  return Reflect.metadata(ANNOTATION_JSON, options);
}


interface URLEncodedAnnotation { // TODO import * as bodyParser from 'body-parser'; bodyParser.json;
  type?: string;
  limit?: string;
  inflate?: boolean;
  extended?: boolean;
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
}
export interface URLEncodedEndpoint extends URLEncodedAnnotation {
  any?: any;
}
export function urlEncodedMiddleware (options: URLEncodedAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return express.urlencoded({ // @see https://www.npmjs.com/package/body-parser#options-3
    // @see https://www.npmjs.com/package/body-parser#verify
    // verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: string = 'UTF-8') => throw new Error('At som reason'),
    type: options.type || '*/x-www-form-urlencoded',
    extended: options.extended || true,
    inflate: options.inflate || true, // false => reject compressed body
    limit: options.limit || '2mb',
  });
}
/**
 * settings of the "body-parse".urlencoded middleware
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @URLEncoded({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_URLENCODED = Symbol('URLENCODED')
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
  Logger.important('MULTER', 'Middleware not implemented yet', options)
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  // TODO need real example
  return multer().none();
}
/**
 * settings of the "multer" middleware
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Multer({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_MULTER = Symbol('MULTER')
export function Multer (options: MulterEndpoint) {
  return Reflect.metadata(ANNOTATION_MULTER, options);
}


interface AuthAnnotation { // TODO to know more
  self?: boolean;
}
export interface AuthEndpoint extends AuthAnnotation {
  any?: any;
}
export function authMiddleware (options: AuthAnnotation) {
  Logger.important('AUTH', 'Middleware not implemented yet', options)
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  // TODO need real example
  return async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    try {
      const authorization = request.header('Authorization')
      Logger.debug('AUTH:HANDLE', `Authorization: ${authorization}`);

      const auth = AuthService.getAuthAccess(request.header('Authorization'))
      // TODO extend express.Request
      // request.auth = auth
      Logger.debug('AUTH:HANDLE', `getAuthAccess: ${auth}`);
      return next();
    } catch (error) {
      Logger.debug('AUTH:401', error.message);
      return response.status(401).type('json').send('Unauthorized');
    }
  }
}
/**
 * settings of the "auth" middleware
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Multer({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_AUTH = Symbol('AUTH')
export function Auth (options: AuthEndpoint) {
  return Reflect.metadata(ANNOTATION_AUTH, options);
}
