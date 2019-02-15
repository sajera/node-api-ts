
// outsource dependencies
import { get } from 'lodash';
import * as is from 's-is';
import { Request, Response } from 'express';

// local dependencies
import Controller from './index';
import { ValidateOptions } from './interface';

/**
 * Intercept action and execute validation check
 * on check fail send validation error
 * on check success continue execution of endpoint
 *
 * @example
 * export default class My extends Controller {
 *     @validate({
 *         'body.id': is.string.required,
 *         'body.age': is.countable,
 *         'body.name': is.string,
 *         'query.page': is.number,
 *         'query.size': is.number,
 *         'params.path': is.countable,
 *     })
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function Validate (options: ValidateOptions ) {
    return (target: Controller, property: string, descriptor: any) => {
        return {
            value: async (request: Request, response: Response) => {
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE care about previous check
                if ( !target.authorized ) {
                    // TODO common validate method from Controller
                    await target._validate.call(target, request, response, options);
                }
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE continue executing endpoint
                return descriptor.value.call(target, request, response);
            }
        };
    };
}

