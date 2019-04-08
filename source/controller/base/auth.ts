
// outsource dependencies
import { get } from 'lodash';
import { Request, Response, NextFunction } from 'express';

// local dependencies
import Controller from './index';
import { PermissionOptions } from './interface';


// NOTE using class decorator ts is lose data structure
// thats is a reason to non use it for class implementation to care about help suggestion for typing
// export function Authorization<T extends new(...args: any[]) => {}> (constructor: T) {
//     return class extends constructor {
//         public self?: object; // TODO must be a User
//         public authorized?: boolean; // TODO may be another data
//     };
// }


/**
 * Intercept action and execute authorization check
 * on check fail send authorization error
 * on check success continue execution of endpoint
 *
 * @example
 * export default class My extends Controller {
 *     @WithAuth
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function WithAuth (target: Controller, property: string, descriptor: any) {
    return {
        value: async (request: Request, response: Response) => {
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE care about previous check
            if ( !target.authorized ) {
                // TODO common check authorization method from Controller
                await target._checkAuth.call(target, request, response);
            }
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE continue executing endpoint
            return descriptor.value.call(target, request, response);
        }
    };
}

/**
 * Intercept action and execute try to find authorization check
 * on absent mark `authorized` call authorization check continue only on success
 * try to get data which belong to current logged user using applied options
 * on action fail send authorization error
 *
 * @example
 * export default class My extends Controller {
 *     @WithSelf({user: true})
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function WithSelf (target: Controller, property: string, descriptor: any) {
    return {
        value: async (request: Request, response: Response) => {
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE care about previous check
            if ( !target.authorized ) {
                // TODO common check authorization method from Controller
                await target._checkAuth.call(target, request, response);
            }
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE common get authorized user
            await target._getSelf.call(target, request, response);
            // NOTE care about status of response
            if ( response.headersSent ) { return; }
            // NOTE continue executing endpoint
            return descriptor.value.call(target, request, response);
        }
    };
}

/**
 * Intercept action and execute try to find authorization check
 * on absent mark `authorized` call authorization check continue only on success
 * on absent object `self` call try to get data which belong to current logged user only on success
 * try to execute checking user permission
 * on action fail send access denied error
 *
 * @example
 * export default class My extends Controller {
 *     @WithPermission({})
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function WithPermission (options: PermissionOptions = {}) {
    // NOTE to wrap decorators and delegate options for them
    return (target: Controller, property: string, descriptor: any) => {
        return {
            value: async (request: Request, response: Response) => {
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE care about previous check
                if ( !target.authorized ) {
                    // TODO common check authorization method from Controller
                    await target._checkAuth.call(target, request, response);
                }
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE care about previous check
                if ( !target.self ) {
                    // TODO common check authorization method from Controller
                    await target._getSelf.call(target, request, response);
                }
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE check permission
                await target._checkSelfPermissions.call(target, request, response);
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE continue executing endpoint
                return descriptor.value.call(target, request, response);
            }
        };
    };
}
