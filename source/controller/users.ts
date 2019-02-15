
// outsource dependencies
import { Request, Response } from 'express';

// local dependencies
import Controller, { METHOD, WithAuth, WithPermission } from './base';

/**
 * Implement user CRUD and may be extended by user specific actions
 */
export default class Users extends Controller {
    public static readonly prefix: string = '/users';
    public transit: any;
    
    /**
     * endpoint to provide functionality to build lists
     */
    @WithAuth
    @Users.Endpoint({action: 'filter', path: '/filter', method: METHOD.POST})
    public async filter (request: Request, response: Response) {
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
    @Users.Endpoint({action: 'byId', path: '/id/:id', method: METHOD.GET})
    public async byId (request: Request, response: Response) {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to create item
     */
    @WithPermission({/* to know how to handle permissions */})
    @Users.Endpoint({action: 'create', path: '/new', method: METHOD.POST})
    public async create (request: Request, response: Response) {
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
    @Users.Endpoint({action: 'update', path: '/id/:id', method: METHOD.PUT})
    public async update (request: Request, response: Response) {
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to remove item
     */
    @WithAuth
    @Users.Endpoint({action: 'remove', path: '/id/:id', method: METHOD.DELETE})
    public async remove (request: Request, response: Response) {
        // NOTE provide ability to transit data from one action to another such as from remove list to remove item
        const id = this.transit ? this.transit : request.params.id;
        // TODO entity remove
        const data = await (new Promise((resolve, reject) => {
            // reject({error: true});
            resolve({data: true});
        }));
        // NOTE provide ability to transit closing request to caller
        if ( this.transit ) { return; }
        await response.status(200).type('json').send(data);
    }

    /**
     * endpoint to remove list item
     */
    @WithAuth
    @Users.Endpoint({action: 'removeList', path: '/list', method: METHOD.DELETE})
    public async removeList (request: Request, response: Response) {
        // TODO get user list from body
        const list = [{id: '100'}, {id: '200'}];
        for ( const { id } of list ) {
            this.transit = id;
            // NOTE delegate execution for each item to another action within controller
            await this.remove(request, response);
        }
        await response.status(200).type('json').send(list);
    }

}
