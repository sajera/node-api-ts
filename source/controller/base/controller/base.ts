
// outsource dependencies
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
import { Annotation, Endpoint } from '../interfaces';

/**
 * Implemented base application controller
 * @abstract
 */
export default class Controller {
  public static router: Router;

  public static annotation: Annotation;

  /**
     * common initialization method
     */
  public static initialize (router: Router) {
    // NOTE create controller router
    this.router = Router();
    // NOTE setup all endpoints of controller
    for (const endpoint of this.annotation.endpoints) {
      this.setupEndpoint(endpoint);
    }
    // NOTE add controller router to application router
    router.use(this.annotation.path, this.router);
  }

  /**
     * common simple setup endpoint
     */
  public static setupEndpoint ({ path, method, action }: Endpoint) {
    const Ctrl = this;
    this.router[method](path, (request: Request, response: Response, next: NextFunction) => {
      const instance = new Ctrl(request, response);
      instance[action]()
        .then(() => !response.headersSent && next())
        .catch((error: Error) => {
          console.error(`\n[CONTROLLER: ${Ctrl.name}.${action}] Execution Error:\n`, error);
          next(error);
        });
    });
  }

  /**
     * controller instance should provide original request and response
     */
  public constructor (public readonly request: Request, public readonly response: Response) {}
}
