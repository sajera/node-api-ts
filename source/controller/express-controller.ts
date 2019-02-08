
// outsource dependencies
// import * as path from 'path';
import { get } from 'lodash';
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
// import Configuration from '../configuration';

export enum METHOD {
    ALL = 'all', USE = 'use', GET = 'get', PUT = 'put', POST = 'post', DELETE = 'delete', OPTIONS = 'options'
}
// cycle: string[] | Array<(request: Request, response: Response) => void>
export type middleware = ((request: Request, response: Response, next: NextFunction) => void);
export type errorMiddleware = ((error: Error, request: Request, response: Response, next: NextFunction) => void);

export interface Rout {
    path: string;
    method: METHOD;
    action: string;
}


export default class ExpressController {
    public static readonly router: Router = Router();
    private static routes: Rout[] = [];

    /**
     * common initialization method
     */
    public static initialize (router: Router) {
        this.setupRoutes(this.router);
        router.use(this.router);
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
                await instance[action](request, response);
                return;
            } catch ( error ) {
                _error = error;
                console.error(`[Controller: ${Controller.name} => ${action}] Execution error detected \n`, error);
            }
            // NOTE care about error handling
            try {
                await instance.handleError(_error, request, response, next);
            } catch ( error ) {
                // NOTE care =) about stacked request
                next({error, _error});
            }
        };
    }

    /**
     * apply rule to declare endpoint for controller
     * @example
     * export default class My extends ExpressController {
     *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
     *     public async some (request: Request, response: Response) { ... }
     * }
     *
     */
    public static Endpoint (rout: Rout) {
        // NOTE to correct setup routes must call declare endpoint of each controller instead common ExpressController
        this.routes.push(rout);
        // NOTE du not known but it has type error when used interface PropertyDescriptor
        return (t: ExpressController, p: string, d: any) => ({ value: d.value });
    }




    // ---------- LIFE CYCLE -----------------------
    public self?: object; // TODO must be a User
    public wasLogged?: boolean = false;
    public constructor (public readonly request: Request, public readonly response: Response, next?: NextFunction) {}

    /**
     * simple customization middleware to handle error
     */
    public async handleError ({message, stack}: Error, request: Request, response: Response, next?: NextFunction) {
        response.status(500).type('json').send({message, stack});
    }



    // ------------------------ [TODO] ------------------------------------------------


    public async checkSelfPermissions (request: Request, response: Response) {
        await this.getSelf(request, response);
        console.info('checkSelfPermissions => allow to all');
    }

    public async getSelf (request: Request, response: Response) {
        await this.checkAuth(request, response);
        // NOTE check auth fail
        if (response.headersSent) { return; }
        // const { authorization } = request.headers;
        // NOTE fake authorization
        this.self = {
            name: 'Fake',
            username: 'Fake',
            role: 'Fake Admin =)'
        };
    }

    public async checkAuth (request: Request, response: Response) {
        const { authorization } = request.headers;
        // NOTE fake authorization
        if ( authorization !== 'my_fake_authorization_token' ) {
            response.status(401).send('Authentication failed');
        }
    }


}


// NOTE example of wrapped decorator
export function Endpoint (options: Rout) {
    // NOTE to wrap decorators and delegate options for them
    return (target: ExpressController, property: string, descriptor: any) => {
        return {
            value: async (request: Request, response: Response, next?: NextFunction) => {
                console.info('\n---------------- [@log] ----------------'
                    , '\n target:', target
                    , '\n property:', property
                    , '\n descriptor:', descriptor
                    // , '\n method:', value.value
                    // , '\n _method:', String(target[key])
                    // , '\n this:', this
                    // , '\n request:', request
                    // , '\n response:', response
                );
                try {
                    // NOTE endpoint life cycle
                    await descriptor.value.call(target, request, response);
                } catch ( error ) {
                    // NOTE implement ability to setup own error format method
                    await target.handleError(error, request, response);
                }
                if (response.headersSent) { return; }
                next(`[CONTROLLER: ${get(target, 'constructor.name', 'Unknown')}] Request connection wos not close.`);
            }
        };
    };
}

// NOTE du not known but it has type error when used interface PropertyDescriptor
// export function End (target: Controller, property: string, descriptor: PropertyDescriptor) {
export function End (target: ExpressController, property: string, descriptor: any) {
    return {
        value: async (request: Request, response: Response, next?: NextFunction) => {
            console.info('\n---------------- [@log] ----------------'
                , '\n target:', target
                , '\n property:', property
                , '\n descriptor:', descriptor
                // , '\n method:', value.value
                // , '\n _method:', String(target[key])
                // , '\n this:', this
                // , '\n request:', request
                // , '\n response:', response
            );
            try {
                // NOTE endpoint life cycle
                await descriptor.value.call(target, request, response);
            } catch ( error ) {
                // NOTE implement ability to setup own error format method
                await target.handleError(error, request, response);
            }
            if (response.headersSent) { return; }
            next(`[CONTROLLER: ${get(target, 'constructor.name', 'Unknown')}] Request connection wos not close.`);
        }
    };
}
