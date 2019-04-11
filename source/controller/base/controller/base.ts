
// outsource dependencies
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

// local dependencies
import Configuration from '../../../configuration';
import { Annotation, Endpoint } from '../interfaces';

/**
 * Implemented base application controller
 * @abstract
 */
export default class Controller {
    public static router: Router;
    public static annotation: Annotation;

    public static log () {
        console.info(`\n[CONTROLLER: ${this.name}(${this.annotation.name})]: ${this.annotation.path}`);
        for (const endpoint of this.annotation.endpoints) {
            const auth = endpoint.auth ? 'private' : 'public';
            const swagger = endpoint.swagger ? '(+Swagger)' : '';
            console.info(`  [ENDPOINT: ${auth} ${swagger}] ${endpoint.action}(${endpoint.method}, ${endpoint.path})`);
        }
    }

    /**
     * common initialization method
     */
    public static initialize (router: Router) {
        // NOTE create controller router
        this.router = Router();
        // NOTE setup all endpoints of controller
        for ( const endpoint of this.annotation.endpoints ) {
            this.setupEndpoint(endpoint);
        }
        // NOTE add controller router to application router
        router.use(this.annotation.path, this.router);
        // NOTE debug log
        // if ( Configuration.getENV('DEBUG', false) ) { this.log(); }
        this.log();
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
                console.error(`\n[CONTROLLER: ${Ctrl.name}.${action}] Error:\n`, error);
                next(error);
            });
        });
    }

    /**
     * controller instance should provide original request and response
     */
    public constructor (public readonly request: Request, public readonly response: Response) {}
}
