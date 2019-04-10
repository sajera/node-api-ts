
// outsource dependencies
import { Request, Response } from 'express';

// local dependencies
import Controller from './index';

/**
 * Intercept action and respond 200 Ok for options request
 *
 * @example
 * export default class My extends Controller {
 *     @Validate([ is.countable.required('query.id') ])
 *     @AllowOptions // 200 after validation
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function AllowOptions (target: Controller, property: string, descriptor: any) {
    return {
        value: async (request: Request, response: Response) => {
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE respond 200 ok
            if ( request.method === 'options' ) {
                response.status(200).send('ok');
            }
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE continue executing endpoint
            return descriptor.value.call(target, request, response);
        }
    };
}

export default AllowOptions;
