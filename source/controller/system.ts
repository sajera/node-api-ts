
// outsource dependencies
import { Request, Response } from 'express';

// local dependencies
import Configuration from '../configuration';
import Controller, { METHOD, WithSelf } from './base';

/**
 * system endpoints which not belong to any controllers and mostly unique
 */
export default class System extends Controller {
    public static readonly prefix: string = '/system';

    /**
     * implement user self
     */
    @WithSelf()
    @System.Endpoint({action: 'getSelf', path: '/self', method: METHOD.GET})
    public async getSelf (request: Request, response: Response) {
        // TODO must prepare user self data to send only public information
        const user = this.self;
        // NOTE very simple solution to take logged user using decorator "WithSelf"
        return await response.status(200).type('json').send(user);
    }

    /**
     * implement user sign up
     */
    @System.Endpoint({action: 'signUp', path: '/sign-up', method: METHOD.POST})
    public async signUp (request: Request, response: Response) {
        // TODO implement user creation
        const user = request.body;
        // NOTE very simple solution without email verification to delegate authorization to authorization action
        return await this.signIn(request, response);
    }

    /**
     * implement user sign in
     */
    @System.Endpoint({action: 'signIn', path: '/sign-in', method: METHOD.POST})
    public async signIn (request: Request, response: Response) {
        // TODO implement authorization flow
        // NOTE currently fake authorization token
        return await response.status(200).type('json').send({
            access_token: 'my_fake_authorization_token',
            refresh_token: '',
        });
    }

    /**
     * implement user sign out
     */
    @System.Endpoint({action: 'signOut', path: '/sign-out', method: METHOD.GET})
    public async signOut (request: Request, response: Response) {
        // TODO kill session and authorization tokens
        await (new Promise((resolve, reject) => {

            // emulation ... some code

            // NOTE all done
            resolve({});
        }));
        // NOTE in any case 200: "ok"
        return await response.status(200).type('json').send({});
    }
    
    /**
     * provide public system info
     */
    @System.Endpoint({action: 'information', path: '/info', method: METHOD.GET})
    public async information (request: Request, response: Response) {
        return await response.status(200).type('json').send({
            base: false,
            health: 'UP',
            auth: 'Authorization',
            version: Configuration.get('version', 1),
        });
    }

}
