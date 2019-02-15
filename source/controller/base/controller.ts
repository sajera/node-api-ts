
// outsource dependencies
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
import { RoutOptions, ValidateOptions } from './interface';

/**
 * Implemented base reusable functionality to inheritance of application controller
 *
 * @abstract
 */
export class Controller {
    public static router: Router;
    public static routes: RoutOptions[];
    public static readonly prefix: string = '';

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
        console.info(
            `\n[CONTROLLER: ${Controller.name}] endpoints:`
            , Controller.routes
                .map(rout => `\n\t${rout.method.toUpperCase()}: ${Controller.prefix}${rout.path} => (${rout.action})`)
                .join('')
        );
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
        // NOTE create own router and routes
        if ( !this.routes ) { this.routes = []; }
        if ( !this.router ) { this.router = Router(); }
        // NOTE controller must provide all it endpoints using decorator
        this.routes.push(rout);
        // console.info(`[CONTROLLER: ${this.name}: ${this.prefix}] add endpoint =>`, rout);
        return (t: Controller, p: string, d: any) => ({ value: d.value });
    }


    // ---------- LIFE CYCLE -----------------------
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
export class WithAuthorization extends Controller {
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
            await response.status(401).send('Authentication failed');
        }
    }

}

/**
 * in order to care about typing suggestions instead using decorators we should use inline inheritance
 * extend base controller to provide functionality of validation
 *
 * @abstract
 */
export default class WithValidation extends WithAuthorization {
    public invalid?: any;
    
    /**
     *
     */
    public async _validate (request: Request, response: Response, options: ValidateOptions) {
        
        // NOTE to test life cycle
        this.invalid = true;

        // NOTE if we have some validation errors send it back
        if ( this.invalid ) {
            await response.status(400).send(this.invalid);
        }
    }
}
