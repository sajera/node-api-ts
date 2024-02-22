// outsource dependencies
import 'reflect-metadata';
import * as express from 'express';

// local dependencies
import * as swagger from './swagger';
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
  urlencoded?: middleware.URLEncodedEndpoint;
  multer?: middleware.MulterEndpoint;
  swagger?: swagger.SwaggerEndpoint;
  json?: middleware.JSONEndpoint;
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
        json: Reflect.getMetadata(middleware.ANNOTATION_JSON, target, name),
        swagger: Reflect.getMetadata(swagger.ANNOTATION_SWAGGER, target, name),
        multer: Reflect.getMetadata(middleware.ANNOTATION_MULTER, target, name),
        urlencoded: Reflect.getMetadata(middleware.ANNOTATION_URLENCODED, target, name),
      });
    }
  }

  public constructor (public readonly request: express.Request, public readonly response: express.Response) {
    // TODO grab the data prepared by previous middlewares
    // TODO made interfaces
  }

  public static handle (action) {
    const Ctrl = this;
    return function handle (request, response, next: express.NextFunction) {
      const instance = new Ctrl(request, response);
      instance[action]()
        .then(() => !response.headersSent && next())
        // TODO handle 500
        .catch((error: Error) => {
          console.error(`\n[CONTROLLER: ${Ctrl.name}.${action}] Execution Error:\n`, error);
          next(error);
        });
    }
  }
}

export const ANNOTATION_ENDPOINT = Symbol('ENDPOINT')
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
export function APIEndpoint (endpoint: EndpointAnnotation) {
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
export function APIController<T> (options: ControllerAnnotation) {
  return (Ctrl: typeof Controller) => {
    Ctrl.formatAnnotation(options)
    // NOTE store data which was grabbed from annotations
    // Ctrl.annotation = formatAnnotation(Ctrl, options);
    return Ctrl as T;
  };
}
