// outsource dependencies
import { Router } from 'express';

// local dependencies
import Server from '../server';
import Configuration from '../configuration';
// controllers
import TestController from './test-ec';
// import UsersController from './users';

export class IndexController {
    // NOTE is singleton
    protected static _instance: IndexController;
    public static get instance () { return this._instance; }
    public static create (router: Router) { this._instance = new IndexController(router); }

    private apiPath: string = Configuration.get('apiPath', '/api');
    private constructor (public router: Router) {
        // NOTE initialize API Controllers
        TestController.initialize(this.router);
    
    }

    public static async initialize (server: Server) {
        console.info(`-------------- [API: ${this.instance.apiPath}/*] --------------`);
        server.app.use(this.instance.apiPath, this.instance.router);
    }
}

// NOTE create express router instance
IndexController.create(Router());
// NOTE export controller
export default IndexController;
