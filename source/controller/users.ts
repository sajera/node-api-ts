
// outsource dependencies
import * as path from 'path';
import { Request, Response } from 'express';

// local dependencies
import Controller, { METHOD, WithAuth } from './base';

/**
 * Implement user CRUD and may be extended by user specific actions
 */
export default class Users extends Controller {
    public static readonly prefix: string = '/users';
    
    /**
     * endpoint to provide functionality to build lists
     */
    @WithAuth
    @Users.Endpoint({action: 'filter', path: '/filter', method: METHOD.POST})
    public async filter (request: Request, response: Response) {
        console.log('filter');
        // TODO get filtered page with users
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({
                page: 0,
                size: 10,
                content: [],
                totalPages: 0,
            });
        }));
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to get item by id
     */
    @WithAuth
    @Users.Endpoint({action: 'byId', path: '/:id', method: METHOD.GET})
    public async byId (request: Request, response: Response) {
        console.log('byId');
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to create item
     */
    @WithAuth
    @Users.Endpoint({action: 'create', path: '/', method: METHOD.POST})
    public async create (request: Request, response: Response) {
        console.log('create');
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to update item
     */
    @WithAuth
    @Users.Endpoint({action: 'update', path: '/:id', method: METHOD.PUT})
    public async update (request: Request, response: Response) {
        console.log('update');
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        await response.status(200).type('json').send(data);
    }

}
