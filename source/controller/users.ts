
// outsource dependencies
import * as path from 'path';
import { Request, Response } from 'express';

// local dependencies
import Configuration from '../configuration';
import Controller, { METHOD, WithAuth, WithSelf } from './base';


export default class Users extends Controller {


    private async preTest (request?: Request, response?: Response) {
        console.log('preTest');
        return await (new Promise((resolve, reject) => {
            resolve({preTest: true});
            // reject({error: true});
        }));
    }

    @WithSelf()
    @Users.Endpoint({action: 'filter', path: '/users/filter', method: METHOD.POST})
    public async filter (request: Request, response: Response) {
        // NOTE each await will freeze endpoint until it done
        const thisElse = await this.preTest();

        const data = await (new Promise((resolve, reject) => {
            resolve({data: true});
            // reject({error: true});
        }));

        console.log('test', thisElse);

        // this.

        await response.status(200).type('json')
            .send({user: 'Super useful user data', id: request.params.id, data, thisElse});
    }

    @WithAuth
    @WithSelf()
    @Users.Endpoint({action: 'byId', path: '/users/:id', method: METHOD.GET})
    public async byId (request: Request, response: Response) {
        // NOTE each await will freeze endpoint until it done
        const thisElse = await this.preTest();

        const data = await (new Promise((resolve, reject) => {
            resolve({data: true});
            // reject({error: true});
        }));

        await response.status(200).type('json')
            .send({user: 'Super useful user data', id: request.params.id, data, thisElse});
    }

}
