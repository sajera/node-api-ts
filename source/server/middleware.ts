// outsource dependencies
import * as multer from 'multer';
import * as http from 'node:http';
import * as express from 'express';
// local dependencies
import { forceCast } from '../constant';
import { Logger, AuthService, Yup } from '../service';

/**
 * expand the "Request" to allow touch new properties from middlewares
 */
declare module 'express' {
  export interface Request {
    auth?: AuthService.Auth;
  }
}

/**
 * to avoid code repeating for validation
 */
function createValidatorMiddleware (schema: Yup, reg: RegExp|null, prop: string, code: string) {
  return forceCast<express.Handler>((request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (response.headersSent) { return; }
    if (reg && !reg.test(request.header('Content-Type'))) { return next(); }
    const error = schema.validate(request[prop]);
    if (!error) { return next(); }
    return response.status(422).type('json').send({ code, error });
  });
}


export interface JSONAnnotation { // TODO import * as bodyParser from 'body-parser'; bodyParser.json;
  type?: string;
  limit?: string;
  inflate?: boolean;
  strict?: boolean;
  // @see https://www.npmjs.com/package/body-parser#verify
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#syntax
  // reviver?(key: string, value: any): any;
  /**
   * case couple handlers for different content types might be made optional for one of decorator
   * @Json({ schema, force: true })
   * @URLEncoded({ schema, force: false })
   */
  force?: boolean
  // validation
  schema?: Yup
}

export function jsonMiddleware ({ schema, force, ...options }: JSONAnnotation) {
  options = { // @see https://www.npmjs.com/package/body-parser#options
    type: '*/json',  // type: '*'
    inflate: true, // false => reject compressed body
    strict: true,
    limit: '5mb',
    // NOTE that is a default setting, and decorator allows to override for every specific endpoint
    ...options,
  };
  return !schema ? [express.json(options)] : [
    // NOTE parse middleware
    express.json(options),
    // NOTE validation middleware right after parse
    createValidatorMiddleware(schema, force ? null : /json/i, 'body', 'JSON_VALIDATION')
  ];
}
/**
 * settings of the "body-parse".json middleware
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Json({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_JSON = Symbol('JSON');
export function Json (options: JSONAnnotation) {
  return Reflect.metadata(ANNOTATION_JSON, options);
}


export interface URLEncodedAnnotation {
  type?: string;
  limit?: string;
  inflate?: boolean;
  extended?: boolean;
  // @see https://www.npmjs.com/package/body-parser#verify
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
  /**
   * case couple handlers for different content types might be made optional for one of decorator
   * @Json({ schema, force: true })
   * @URLEncoded({ schema, force: false })
   */
  force?: boolean
  // validation
  schema?: Yup
}
export function urlEncodedMiddleware ({ schema, force, ...options }: URLEncodedAnnotation) {
  options = { // @see https://www.npmjs.com/package/body-parser#options-3
    type: '*/x-www-form-urlencoded', // type: '*'
    extended: true,
    inflate: true, // false => reject compressed body
    limit: '2mb',
    // NOTE that is a default setting, and decorator allows to override for every specific endpoint
    ...options
  };
  return !schema ? [express.urlencoded(options)] : [
    // NOTE parse middleware
    express.urlencoded(options),
    // NOTE validation middleware right after parse
    createValidatorMiddleware(schema, force ? null : /form-urlencoded/i, 'body', 'FORM_VALIDATION')
  ];
}
/**
 * settings of the "body-parse".urlencoded middleware
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @URLEncoded({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_URLENCODED = Symbol('URLENCODED');
export function URLEncoded (options: URLEncodedAnnotation) {
  return Reflect.metadata(ANNOTATION_URLENCODED, options);
}


export interface QueryAnnotation { schema?: Yup }
export function queryMiddleware ({ schema }: QueryAnnotation) {
  // FIXME in case we need to customize parse query rules
  // // outsource dependencies
  // // import * as qs from 'qs';
  // // import * as _ from 'lodash';
  // function queryMiddleware (request: express.Request, response: express.Response, next: express.NextFunction) {
  //   if (response.headersSent) return;
  //   Logger.log('QUERY', 'express', request.query)
  //   request.query = qs.parse(_.get(request, '_parsedUrl.search')  || '', {
  //     depth: 2,
  //     ignoreQueryPrefix: true
  //   })
  //   return next();
  // }
  // return !schema ? [queryMiddleware] : [
  //   // NOTE parse middleware
  //   queryMiddleware,
  //   // NOTE validation middleware right after parse
  //   createValidatorMiddleware(schema, /.*/, 'query','QUERY_VALIDATION')
  // ];
  return !schema ? [] : [
    // NOTE for sure the express already parse the query
    createValidatorMiddleware(schema, null, 'query', 'QUERY_VALIDATION')
  ];
}
/**
 * settings of the "query" middleware
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Query({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_QUERY = Symbol('QUERY');
export function Query (options: QueryAnnotation) {
  return Reflect.metadata(ANNOTATION_QUERY, options);
}


export interface ParamsAnnotation { schema?: Yup }
export function paramsMiddleware ({ schema }: ParamsAnnotation) {
  return !schema ? [] : [
    // NOTE for sure the express already parse the query
    createValidatorMiddleware(schema, null, 'params', 'PARAMS_VALIDATION')
  ];
}
/**
 * settings of the "query" middleware
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Params({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_PARAMS = Symbol('PARAMS');
export function Params (options: ParamsAnnotation) {
  return Reflect.metadata(ANNOTATION_PARAMS, options);
}


export interface MulterAnnotation { // TODO to know more
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
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Multer({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_MULTER = Symbol('MULTER');
export function Multer (options: MulterAnnotation) {
  return Reflect.metadata(ANNOTATION_MULTER, options);
}


export interface AuthAnnotation {
  lightweight?: boolean; // not sure it useful
  optional?: boolean;
}
export function authMiddleware ({ optional, lightweight }: AuthAnnotation) {
  // NOTE that is a default setting, and decorator allows to override for every specific endpoint
  return async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    try {
      // NOTE verify token sign and expiration only
      const auth = AuthService.verifyAuthAccess(request.header('Authorization'));
      if (!lightweight) {
        // NOTE check session with the DB for case it was Interrupted by sign out or similar mechanism
        request.auth = await AuthService.getStoredAuth(null, auth.sid);
        if (!request.auth) { throw new Error('Session Interrupted/Invalidated'); }
      }
      return next();
    } catch (error) {
      // NOTE allow to "try" to get auth and pass in case it missing
      if (optional) { return next(); }
      Logger.debug('AUTH:401', error.message);
      return response.status(401).type('json').send({ code: 401, error: 'Unauthorized' });
    }
  };
}
/**
 * settings of the "auth" middleware
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Auth({ ... })
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_AUTH = Symbol('AUTH');
export function Auth (options: AuthAnnotation) {
  return Reflect.metadata(ANNOTATION_AUTH, options);
}
