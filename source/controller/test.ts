
// outsource dependencies
import * as path from 'path';
import { Router, Request, Response, NextFunction } from 'express';

// local dependencies
import Configuration from '../configuration';
import { BaseController, Rout, METHOD } from './base';


export class TestController extends BaseController {
    public static readonly routes: Rout[] = [
        { method: METHOD.GET, path: '/test', cycle: ['test'] },
        { method: METHOD.GET, path: '/_test', cycle: ['getSelf', 'preTest', 'test'] },
    ];

    private async preTest (request: Request, response: Response) {
        console.log('preTest');
    }

    private async test (request: Request, response: Response) {
        const data = await (new Promise((resolve, reject) => {
            resolve({data: true});
            // reject({error: true});
        }));
        response
            .status(200)
            .type('json')
            .send({user: 'Super useful user data', id: request.params.id, self: this.self, data});
    }

}

export default TestController;
