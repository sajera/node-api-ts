
// outsource dependencies
import * as path from 'path';
import { Request, Response } from 'express';

// local dependencies
import Configuration from '../configuration';
import ExpressController, { METHOD } from './express-controller';

export default class Test extends ExpressController {


    private async preTest (request?: Request, response?: Response) {
        console.log('preTest');
        return await (new Promise((resolve, reject) => {
            resolve({preTest: true});
            // reject({error: true});
        }));
    }

    @Test.Endpoint({action: 'test', path: '/test', method: METHOD.GET})
    public async test (request: Request, response: Response) {
        // NOTE each await will freeze endpoint until it done
        const thisElse = await this.preTest();

        const data = await (new Promise((resolve, reject) => {
            resolve({data: true});
            // reject({error: true});
        }));

        console.log('test', thisElse);

        await response.status(200).type('json')
            .send({user: 'Super useful user data', id: request.params.id, data, thisElse});
    }

}
