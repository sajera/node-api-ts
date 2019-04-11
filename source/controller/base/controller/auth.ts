
// outsource dependencies
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

// local dependencies
import BaseController from './base';
import { AuthAnnotation, Permission } from '../interfaces';

/**
 * Expand base application controller by authorization
 * @abstract
 */
export default class AuthController extends BaseController {
    private _self: any;
    public get self (): any { return {...this._self}; }
    public set self (value) {
        // NOTE may by it should throw an error ???
        if (typeof this._self !== 'undefined') { return; }
        this._self = value;
    }

    private _isAuthorized: boolean;
    public get isAuthorized (): boolean { return Boolean(this._isAuthorized); }
    public set isAuthorized (value) {
        // NOTE may by it should throw an error ???
        if (typeof this._isAuthorized !== 'undefined') { return; }
        this._isAuthorized = Boolean(value);
    }

    public async checkAuthorization () {
        // TODO implement
        console.log('checkAuthorization NOT IMPLEMENTED');
        // throw new Error('checkAuthorization NOT IMPLEMENTED');
    }

    public async getLoggedUser () {
        // TODO implement
        console.log('checkAuthorization NOT IMPLEMENTED');
        return {name: 'Logged user =)'};
        // throw new Error('getLoggedUser NOT IMPLEMENTED');
    }
    
    public async checkLoggedUserPermissions (options: Permission) {
        // TODO implement
        throw new Error('checkLoggedUserPermissions NOT IMPLEMENTED');
    }

    public async unauthorizedError () {
        this.response.status(401).send('Unauthorized');
    }
    
    public static async checkAuthorizationFlow (target: AuthController, options: AuthAnnotation) {
        const { self = false, permissions = null } = options;
        // NOTE in any case we should delegate action to the instance to provide ability override rules
        try {
            // NOTE common authorization checker
            await target.checkAuthorization();
            target.isAuthorized = true;
            // NOTE (optionally) get logged user
            if ( self ) {
                target.self = await target.getLoggedUser();
            }
            // NOTE (optionally) check logged user permissions
            if ( permissions ) {
                await target.checkLoggedUserPermissions(permissions);
            }
        } catch (error) {
            // NOTE in any case error on this logic means `401 Unauthorized`
            await target.unauthorizedError();
        }
    }
}
