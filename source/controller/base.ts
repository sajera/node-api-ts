
// outsource dependencies
import * as path from 'path';
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
import Configuration from '../configuration';

export enum METHOD {
    ALL = 'all', USE = 'use', GET = 'get', PUT = 'put', POST = 'post', DELETE = 'delete', OPTIONS = 'options'
}

export interface Rout {
    path: string;
    method: METHOD;
    cycle: string[] | Array<(request: Request, response: Response) => void>;
}

export class BaseController {
    public static readonly router: Router = Router();
    public static readonly routes: Rout[] = [];
    public self?: object;

    /**
     * ability to customize life cycle of middleware for specific controller
     */
    public static lifeCycle (cycle: string[] | Array<(request: Request, response: Response) => void>) {
        const Controller = this;
        return async (request: Request, response: Response, next: NextFunction) => {
            try {
                const instance = new Controller(request, response);
                for (const step of cycle) {
                    if ( typeof step === 'string' ) {
                        await instance[step](request, response);
                    } else {
                        await step.call(instance, request, response);
                    }
                    // NOTE stop loop if "step" send response back
                    if (response.headersSent) {
                        break;
                    }
                }
            } catch ( error ) {
                Controller.handleError(error, request, response, next);
            }
        };
    }
    /**
     * simple customization middleware to handle error
     */
    public static handleError (error: Error, request: Request, response: Response, next: NextFunction) {
        response.status(500).type('json').send(error);
    }

    /**
     * simple customization to prepare routes before setup
     */
    public static getRoutes (): Rout[] {
        return this.routes;
    }

    /**
     * complicate customization to setup routes
     */
    public static setupRoutes (router: Router) {
        const Controller = this;
        const routes = Controller.getRoutes();
        for ( const rout of routes ) {
            router[rout.method](rout.path, Controller.lifeCycle(rout.cycle));
        }
    }

    public static initialize (router: Router) {
        this.setupRoutes(this.router);
        router.use(this.router);
    }

    // ---------- LIFE CYCLE -----------------------

    public constructor (public request: Request, public response: Response) {}

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

export default BaseController;
