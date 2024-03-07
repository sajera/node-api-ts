// outsource dependencies
import 'reflect-metadata';
import * as express from 'express';

// local dependencies
import { DEBUG } from '../constant';
import * as swagger from './swagger';
import * as middleware from './middleware';

/**
 * Endpoint annotation restriction
 */
export interface EndpointAnnotation {
  path: string;
  // list of allowed to use express methods for API endpoints
  method?: 'get'|'put'|'post'|'delete';
}
/**
 * Endpoint annotation restriction
 */
export interface Endpoint extends EndpointAnnotation {
  action: string;
  // NOTE predefined middlewares options
  urlencoded?: middleware.URLEncodedAnnotation;
  params?: middleware.ParamsAnnotation;
  multer?: middleware.MulterAnnotation;
  swagger?: swagger.SwaggerAnnotation;
  query?: middleware.QueryAnnotation;
  json?: middleware.JSONAnnotation;
  auth?: middleware.AuthAnnotation;
}
/**
 * Controller annotation restriction
 */
export interface ControllerAnnotation { path: string; }
/**
 * Controller annotation
 */
export interface Annotation extends ControllerAnnotation {
  name: string;
  endpoints: Endpoint[];
}

/**
 * Base application controller
 * @abstract
 */
export class Controller {
  public static GET = 'get' as const;

  public static PUT = 'put' as const;

  public static POST = 'post' as const;

  public static DELETE = 'delete' as const;

  public static annotation: Annotation;

  public static formatAnnotation (options: ControllerAnnotation) {
    const target = this.prototype;
    this.annotation = { ...options, name: this.name, endpoints: [] };
    const endpointNames: string[] = [];
    // NOTE take only annotated as endpoint
    for (const name of Object.keys(target)) {
      if (Reflect.hasMetadata(ANNOTATION_ENDPOINT, target, name)) {
        endpointNames.push(name);
      }
    }
    // NOTE grab all relevant annotations of each endpoint
    for (const name of endpointNames) {
      const { path, method = Controller.GET }: EndpointAnnotation = Reflect.getMetadata(ANNOTATION_ENDPOINT, target, name);
      this.annotation.endpoints.push({
        path,
        method,
        action: name,
        auth: Reflect.getMetadata(middleware.ANNOTATION_AUTH, target, name),
        json: Reflect.getMetadata(middleware.ANNOTATION_JSON, target, name),
        query: Reflect.getMetadata(middleware.ANNOTATION_QUERY, target, name),
        swagger: Reflect.getMetadata(swagger.ANNOTATION_SWAGGER, target, name),
        params: Reflect.getMetadata(middleware.ANNOTATION_PARAMS, target, name),
        multer: Reflect.getMetadata(middleware.ANNOTATION_MULTER, target, name),
        urlencoded: Reflect.getMetadata(middleware.ANNOTATION_URLENCODED, target, name),
      });
    }
  }

  // FIXME is it useful to expand by data from request ?
  public constructor (public readonly request: express.Request, public readonly response: express.Response) {}

  public static handle (action) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const Controller = this;
    return function handler (request: express.Request, response: express.Response, next: express.NextFunction) {
      const instance = new Controller(request, response);
      instance[action](request, response, next)
        .then(() => !response.headersSent && next())
        .catch((error: Error) => {
          console.error(`\nCONTROLLER: ${Controller.name}.${action}`, 'Execution Error:\n', error);
          // NOTE handle throwing endpoints
          return response.status(500).type('json')
            .send({ code: error.message || 'INTERNAL', debug: !DEBUG ? void(0) : error.stack });
        });
    };
  }
}

/**
 * Define correct metadata for API endpoints
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller {
 *     @Endpoint({ path: '/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export const ANNOTATION_ENDPOINT = Symbol('ENDPOINT');
export function Endpoint (endpoint: EndpointAnnotation) {
  return Reflect.metadata(ANNOTATION_ENDPOINT, endpoint);
}

/**
 * Wrap the original controller definition with a function that will first save relevant annotation
 * @example
 * @API({ path: '/entity' })
 * export default class My extends Controller { ... }
 * @decorator
 */
export function API<T> (options: ControllerAnnotation) {
  return (Ctrl: typeof Controller) => {
    Ctrl.formatAnnotation(options);
    return Ctrl as T;
  };
}
