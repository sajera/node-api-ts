
// outsource dependencies
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

// local dependencies
import { METHOD } from '../constant';
import { Annotation, Endpoint } from '../interfaces';

/**
 * Implemented base application controller
 * @abstract
 */
export default class BaseController {
    public static router: Router;
    public static annotation: Annotation;

    /**
     * common initialization method
     */
    public static initialize (router: Router) {
        // NOTE create controller router
        this.router = Router();
        // console.info(
        //     `\n[CONTROLLER: ${this.name}]`
        //     , this.annotation
        // );
        // NOTE setup all endpoints of controller
        for ( const endpoint of this.annotation.endpoints ) {
            this.setupEndpoint(endpoint);
        }

        // NOTE add controller router to application router
        router.use(this.annotation.path, this.router);
    }

    private static setupEndpoint ({ path, method, action, allowOption, allowHead }: Endpoint) {
        const check = this.createMiddleware('_checkResponseStatus');
        // NOTE provide ability to send 200 ok for option request on action
        if (allowOption) {
            this.router[METHOD.OPTIONS](path, this.createMiddleware('allowOption'), check);
        }
        // NOTE provide ability to send 200 ok for head request on action
        if (allowHead) {
            this.router[METHOD.HEAD](path, this.createMiddleware('allowHead'), check);
        }
        this.router[method](path, this.createMiddleware(action), check);
    }

    /**
     * Create middleware functions with encapsulated data
     * which will create instance of controller and trigger necessary method
     */
    public static createMiddleware (action: string, data?: any): RequestHandler {
        const Controller = this;
        // tslint:disable-next-line:only-arrow-functions
        return function (request: Request, response: Response, next: NextFunction) {
            const instance = new Controller(request, response);
            (new Promise((resolve, reject) => instance[action](data).then(resolve).catch(reject)))
            .then(() => !response.headersSent && next())
            .catch((error: Error) => {
                instance.handleError(error)
                .then(() => !response.headersSent && next())
                .catch((error: Error) => {
                    console.error(`\n[CONTROLLER: ${Controller.name}.${action}] Error:\n`, error);
                    next(error);
                });
            });
        };
    }

    constructor (public readonly request: Request, public readonly response: Response) {}

    public async allowOption () {
        await this.response.status(200).type('json').send('ok');
    }

    public async allowHead () {
        await this.response.status(200).type('json').send('ok');
    }

    public async handleError (error: Error) {
        await this.response.status(500).type('json').send({message: error.message});
    }
    
    /**
     * Actually developer may make a mistake and at some reason won't send the response. Its a developer error
     */
    public async _checkResponseStatus () {
        if ( !this.response.headersSent ) {
            throw new Error('After handling endpoint response was not sent !');
        }
    }
    
}
