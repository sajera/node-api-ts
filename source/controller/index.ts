// outsource dependencies
import * as fs from 'fs';
import * as path from 'path';
import { Router } from 'express';

// local dependencies
import Server from '../server';
import Configuration from '../configuration';
// controllers
import UsersController from './users';
import SystemController from './system';

export class IndexController {
    protected static _instance: IndexController;
    protected static get instance () { return this._instance; }

    private router: Router;
    private apiPath: string = Configuration.get('apiPath', '/api');

    private constructor () {
        if ( !IndexController._instance ) {
            IndexController._instance = this;
        } else {
            throw new Error('Duplicate of index controller detected !!!');
        }
    }
    
    /**
     * provide async initialization for controllers
     */
    private async initialize (server: Server) {
        console.info(`---------------- [API: ${this.apiPath}] ----------------`);
        this.router = Router();
        // NOTE initialize API Controllers
        await this.setupController(SystemController);
        await this.setupController(UsersController);
        
        // NOTE initialize API router
        server.app.use(this.apiPath, this.router);

        // NOTE initialize API v2 router example
        // this.router_v2 = Router();
        // server.app.use(this.apiPath_v2, this.router_v2);
    }

    /**
     * provide async initialization for controllers
     */
    private async setupController (Controller: any) {
        await Controller.initialize(this.router);
        // TODO store or provide functionality to store meta information about controller
    }

    /**
     * provide ability to write information about controllers
     */
    private async writeSwaggerPaths (filePath: string) {
        // TODO remove after implementation
        filePath = path.join(process.cwd(), 'swagger/test_auto_generated_paths.json');
        // TODO take information from controllers
        const content = JSON.stringify({test: 'swagger file'}, null, 4);
        await new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, error => {
                if ( error ) { return reject(error); }
                console.info(`----------- [SWAGGER PATHS: ${filePath}] -----------`);
                resolve({});
            });
        });
    }

    public static async initialize (server: Server) {
        const instance = new IndexController();
        await instance.initialize(server);
        if ( Configuration.get('swagger', false) ) {
            const outputFilePath = path.join(process.cwd(), Configuration.get('swagger.paths', 'swagger/paths.json'));
            await instance.writeSwaggerPaths(outputFilePath);
        }
    }
}

export default IndexController;
