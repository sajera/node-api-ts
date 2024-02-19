// outsource dependencies
import 'reflect-metadata';
import * as express from 'express';

// local dependencies
import { SwaggerEndpoint, ANNOTATION_SWAGGER } from './swagger';

/**
 * list of allowed to use express methods for API endpoints
 */
export enum API_METHOD {
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
  method: API_METHOD;
}
/**
 * Endpoint annotation restriction
 */
export interface Endpoint extends EndpointAnnotation {
  action: string;
  // NOTE without final implementation - define only idea
  swagger?: SwaggerEndpoint;
  // auth?: AuthEndpoint;
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
  public static GET = API_METHOD.GET;
  public static PUT = API_METHOD.PUT;
  public static POST = API_METHOD.POST;
  public static DELETE = API_METHOD.DELETE;

  public static annotation: Annotation;

  /**
   * controller instance should provide original request and response
   */
  public constructor (public readonly request: express.Request, public readonly response: express.Response) {}

  /**
   * controller action handler
   */
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
 *     @APIEndpoint({ method: API_METHOD.GET, path: '/express/:path' })
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
    // FIXME Ctrl.formatAnnotation(Ctrl, options) static ?
    // NOTE store data which was grabbed from annotations
    Ctrl.annotation = formatAnnotation(Ctrl, options);
    return Ctrl as T;
  };
}

/**
 * Take relevant annotation
 */
export function formatAnnotation (Ctrl: typeof Controller, rootOptions: ControllerAnnotation): Annotation {
  const target = Ctrl.prototype;
  const annotation: Annotation = { ...rootOptions, name: Ctrl.name, endpoints: [] };
  const endpointNames: string[] = [];
  // NOTE take only annotated as endpoint
  for (const name of Object.keys(target)) {
    if (Reflect.hasMetadata(ANNOTATION_ENDPOINT, target, name)) {
      endpointNames.push(name);
    }
  }
  // NOTE grab all relevant annotation of each endpoint
  for (const name of endpointNames) {
    // NOTE endpoint root information
    const { path, method }: EndpointAnnotation = Reflect.getMetadata(ANNOTATION_ENDPOINT, target, name);
    const endpoint: Endpoint = { action: name, path, method };
    // NOTE (optionally) endpoint Swagger information
    endpoint.swagger = Reflect.getMetadata(ANNOTATION_SWAGGER, target, name);

    // NOTE (optionally) endpoint Authorization information
    // const authAnnotation: AuthAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.AUTH, target, name);
    // if (authAnnotation) {
    //   endpoint.auth = authAnnotation;
    // }
    annotation.endpoints.push(endpoint);
  }
  return annotation;
}
