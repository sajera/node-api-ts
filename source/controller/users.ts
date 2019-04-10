
// outsource dependencies
import { Request, Response } from 'express';

// local dependencies
import { APIController, APIEndpoint, API_METHOD, BaseController } from './base';

/**
 * Implement user CRUD and may be extended by user specific actions
 */
@APIController({ path: '/users' })
export default class Users extends BaseController {

    /**
     * endpoint to provide functionality to build lists
     */
    @APIEndpoint({ path: '/filter', method: API_METHOD.POST })
    public async filter () {
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
        await this.response.status(200).type('json').send(data);
    }

    /**
     * endpoint to get item by id
     */
    @APIEndpoint({ path: '/:id', method: API_METHOD.GET })
    public async byId () {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({get: true});
        }));
        await this.response.status(200).type('json').send(data);
    }

    /**
     * endpoint to create item
     */
    @APIEndpoint({ path: '/new', method: API_METHOD.POST })
    public async create () {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({create: true});
        }));
        await this.response.status(200).type('json').send(data);
    }

    /**
     * endpoint to update item
     */
    public async update () {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({update: true});
        }));
        await this.response.status(200).type('json').send(data);
    }

    /**
     * endpoint to remove item
     */
    public async remove () {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({remove: true});
        }));
        // NOTE provide ability to transit closing request to caller
        await this.response.status(200).type('json').send(data);
    }

    /**
     * endpoint to remove list item
     */
    public async removeList () {
        // TODO get user list from body
        const list = [{id: '100'}, {id: '200'}];
        
        await this.response.status(200).type('json').send(list);
    }

}
