// outsource dependencies
import 'reflect-metadata';
import * as express from 'express';

// local dependencies
import { DEBUG } from '../constant';
import * as swagger from './swagger';
import { AuthService } from '../service';
import * as middleware from './middleware';

/**
 * list of allowed to use express methods for API endpoints
 */
export enum METHOD {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete'
}

/**
 * Endpoint annotation restriction
 */
export interface EndpointAnnotation {
  path: string;
  method?: METHOD;
}
/**
 * Endpoint annotation restriction
 */
export interface Endpoint extends EndpointAnnotation {
  action: string;
  // NOTE without final implementation - define only idea
  urlencoded?: middleware.URLEncodedAnnotation;
  multer?: middleware.MulterAnnotation;
  swagger?: swagger.SwaggerAnnotation;
  query?: middleware.QueryAnnotation;
  json?: middleware.JSONAnnotation;
  auth?: middleware.AuthEndpoint;
  // TODO
  any?: any;
}
/**
 * Controller annotation restriction
 */
export interface ControllerAnnotation {
  path: string;
}
/**
 * Controller annotation
 */
export interface Annotation extends ControllerAnnotation {
  name: string;
  endpoints: Endpoint[];
}

/**
 * Implemented base application controller
 * @abstract
 */
export class Controller {
  public readonly auth: AuthService.Auth;

  public static GET = METHOD.GET;

  public static PUT = METHOD.PUT;

  public static POST = METHOD.POST;

  public static DELETE = METHOD.DELETE;

  public static annotation: Annotation;

  public static formatAnnotation (rootOptions: ControllerAnnotation) {
    const target = this.prototype;
    this.annotation = { ...rootOptions, name: this.name, endpoints: [] };
    const endpointNames: string[] = [];
    // NOTE take only annotated as endpoint
    for (const name of Object.keys(target)) {
      if (Reflect.hasMetadata(ANNOTATION_ENDPOINT, target, name)) {
        endpointNames.push(name);
      }
    }
    // NOTE grab all relevant annotations of each endpoint
    for (const name of endpointNames) {
      const { path, method = METHOD.GET }: EndpointAnnotation = Reflect.getMetadata(ANNOTATION_ENDPOINT, target, name);
      this.annotation.endpoints.push({
        path,
        method,
        action: name,
        auth: Reflect.getMetadata(middleware.ANNOTATION_AUTH, target, name),
        json: Reflect.getMetadata(middleware.ANNOTATION_JSON, target, name),
        query: Reflect.getMetadata(middleware.ANNOTATION_QUERY, target, name),
        swagger: Reflect.getMetadata(swagger.ANNOTATION_SWAGGER, target, name),
        multer: Reflect.getMetadata(middleware.ANNOTATION_MULTER, target, name),
        urlencoded: Reflect.getMetadata(middleware.ANNOTATION_URLENCODED, target, name),
      });
    }
  }

  public constructor (public readonly request: express.Request, public readonly response: express.Response) {
    this.auth = request.auth;
    // TODO grab the data prepared by previous middlewares
    // TODO made interfaces
  }

  public static handle (action) {
    const Ctrl = this;
    return function handle (request: express.Request, response: express.Response, next: express.NextFunction) {
      const instance = new Ctrl(request, response);
      instance[action](request, response, next)
        .then(() => !response.headersSent && next())
        .catch((error: Error) => {
          console.error(`\nCONTROLLER: ${Ctrl.name}.${action}`, 'Execution Error:\n', error);
          // NOTE handle throwing endpoints
          return response.status(500).type('json')
            .send({ code: 'ENDPOINT_INTERNAL', error: error.message, stack: DEBUG ? error.stack : undefined });
        });
    };
  }
}

export const ANNOTATION_ENDPOINT = Symbol('ENDPOINT');
/**
 * Define correct metadata for API endpoints
 *
 * @example
 * /@APIController({ path: '/ctrl-prefix' })
 * export default class My extends Controller {
 *     @APIEndpoint({ method: METHOD.GET, path: '/express/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export function Endpoint (endpoint: EndpointAnnotation) {
  return Reflect.metadata(ANNOTATION_ENDPOINT, endpoint);
}

/**
 * Wrap the original controller definition with a function
 * that will first save relevant annotation
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller { ... }
 * @decorator
 */
export function API<T> (options: ControllerAnnotation) {
  return (Ctrl: typeof Controller) => {
    Ctrl.formatAnnotation(options);
    // NOTE store data which was grabbed from annotations
    // Ctrl.annotation = formatAnnotation(Ctrl, options);
    return Ctrl as T;
  };
}
