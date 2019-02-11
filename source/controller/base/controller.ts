
// outsource dependencies
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
import { RoutOptions } from './interface';

/**
 * Implemented base reusable functionality to inheritance of application controller
 *
 * @abstract
 */
export class Controller {
    private static routes: RoutOptions[] = [];
    public static readonly prefix: string = '';
    public static readonly router: Router = Router();

    /**
     * common initialization method
     */
    public static initialize (router: Router) {
        this.setupRoutes(this.router);
        router.use(this.prefix, this.router);
    }

    /**
     * complicate customization to setup routes
     */
    public static setupRoutes (router: Router) {
        const Controller = this;
        for ( const { method, path, action } of Controller.routes ) {
            router[method](path, Controller.lifeCycle(action));
        }
    }

    /**
     * ability to customize life cycle of middleware for specific controller
     */
    public static lifeCycle (action: string) {
        const Controller = this;
        return async (request: Request, response: Response, next: NextFunction) => {
            let _error: Error;
            const instance = new Controller(request, response);
            // NOTE try to execute endpoint
            try {
                return await instance[action](request, response);
            } catch ( error ) {
                _error = error;
                console.error(`[Controller: ${Controller.name} => ${action}] Execution error detected \n`, error);
            }
            // NOTE care about error handling
            try {
                return await instance.handleError(_error, request, response, next);
            } catch ( error ) {
                // NOTE care =) about stacked request
                next({error, _error});
            }
        };
    }

    /**
     * apply rule to declare endpoint for controller
     * @example
     * export default class My extends Controller {
     *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
     *     public async some (request: Request, response: Response) { ... }
     * }
     * @decorator
     */
    public static Endpoint (rout: RoutOptions) {
        // NOTE controller must provide all it endpoints using decorator
        this.routes.push(rout);
        // NOTE du not known but it has type error when used interface PropertyDescriptor
        return (t: Controller, p: string, d: any) => ({ value: d.value });
    }


    // ---------- LIFE CYCLE -----------------------
    // NOTE in order to care about typing suggestions instead us
    public constructor (public readonly request: Request, public readonly response: Response, next?: NextFunction) {}

    /**
     * simple customization middleware to handle error
     */
    public async handleError (error: Error, request: Request, response: Response, next?: NextFunction) {
        // NOTE break original error object using spread operator to provide ability of Object.toJSON method
        const { message, stack } = error;
        response.status(500).type('json').send({message, stack});
    }

}

/**
 * in order to care about typing suggestions instead using decorators we should use inline inheritance
 * extend base controller to provide functionality of authorization
 *
 * @abstract
 */
export default class WithAuthorization extends Controller {
    public self?: object; // TODO must be a User
    public authorized?: boolean;

    // ------------------------ [TODO] ------------------------------------------------

    /**
     *
     */
    public async _checkSelfPermissions (request: Request, response: Response) {
        console.info('checkSelfPermissions => allow to all', this.self);
    }

    /**
     *
     */
    public async _getSelf (request: Request, response: Response) {
        this.self = await (new Promise((resolve, reject) => {
            // NOTE fake self
            resolve({
                name: 'Fake',
                username: 'Fake',
                role: 'Fake Admin =)'
            });
        }));
    }

    /**
     *
     */
    public async _checkAuth (request: Request, response: Response) {
        const { authorization } = request.headers;
        // NOTE fake authorization
        if ( authorization !== 'my_fake_authorization_token' ) {
            response.status(401).send('Authentication failed');
        }
    }

}
