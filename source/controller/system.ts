
// outsource dependencies
import * as path from 'path';
import { Request, Response } from 'express';

// local dependencies
import Configuration from '../configuration';
import Controller, { METHOD } from './base';

export default class System extends Controller {

    @System.Endpoint({action: 'test', path: '/test', method: METHOD.GET})
    public async test (request: Request, response: Response) {
        // NOTE each await will freeze endpoint until it done
        const data = await (new Promise((resolve, reject) => {
            resolve({data: true});
            // reject({error: true});
        }));

        await response.status(200).type('json')
            .send({user: 'Super useful user data', id: request.params.id, data});
    }

}
