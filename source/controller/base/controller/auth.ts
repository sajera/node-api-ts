
// outsource dependencies
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

// local dependencies
import BaseController from './base';
import { AuthDecoratorOptions } from '../interfaces';

/**
 * Implemented base application controller
 * @abstract
 */
export default class AuthController extends BaseController {
    public self: Router;
    public isAuthorized: boolean;

    public static handleAuthDecorator (option: AuthDecoratorOptions) {
        console.log('handleAuthDecorator', option);
        return (target: AuthController, property: string, descriptor: any) => {
            console.log('return (target: AuthController, property: string, descriptor: any) =>');
            return {
                value: async () => {
                    console.log('handleAuthDecorator value: async () =>');
                    // // NOTE care about status of response
                    // if ( response.headersSent ) { return; }
                    // // NOTE care about previous check
                    // if ( !target.authorized ) {
                    //     // TODO common check authorization method from Controller
                    //     await target._checkAuth.call(target, request, response);
                    // }
                    // // NOTE care about status of response
                    // if ( response.headersSent ) { return; }
                    // // NOTE care about previous check
                    // if ( !target.self ) {
                    //     // TODO common check authorization method from Controller
                    //     await target._getSelf.call(target, request, response);
                    // }
                    // // NOTE care about status of response
                    // if ( response.headersSent ) { return; }
                    // // NOTE check permission
                    // await target._checkSelfPermissions.call(target, request, response);
                    // // NOTE care about status of response
                    // if ( response.headersSent ) { return; }
                    // // NOTE continue executing endpoint
                    return descriptor.value.call(target);
                }
            };
        };
    }
}
