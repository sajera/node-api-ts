// outsource dependencies
import * as fs from 'fs';
import * as path from 'path';
import { Router } from 'express';

// local dependencies
import Server from '../server';
import { Annotation } from './base';
import Configuration from '../configuration';
// controllers
import UsersController from './users';
import SystemController from './system';

export default class IndexController {
    private router: Router;
    private annotations: Annotation[] = [];
    private apiPath: string = Configuration.get('api.path', '/api');

    /**
     * provide ability to write information about controllers
     */
    private async writeSwaggerPaths () {
        if ( !Configuration.get('swagger', false) ) { return; }
        // NOTE generate endpoint swagger
        const content = this.generateSwaggerPath();
        // NOTE output path
        const filePath = path.join(process.cwd(), Configuration.get('swagger.paths', 'swagger/paths.json'));
        await new Promise(resolve => {
            fs.writeFile(filePath, content, error => {
                if ( error ) { console.error('[SWAGGER: PATH] Error: ', error); }
                resolve({});
            });
        });
    }

    /**
     * generate `swagger.path`.json file content
     * based on annotations from controllers
     */
    private generateSwaggerPath (): string {
        
        return JSON.stringify({test: 'swagger file'}, null, 4);
    }

    /**
     *
     */
    private log () {
        console.info(`------------------- [API: ${this.apiPath}] -------------------`);
        for (const ctrl of this.annotations) {
            console.info(`[CONTROLLER: ${ctrl.name}]: ${ctrl.path}`);
            for (const point of ctrl.endpoints) {
                const auth = point.auth ? 'private' : 'public';
                const swagger = point.swagger ? ' (+Swagger)' : '';
                console.info(`  [ENDPOINT: ${auth}${swagger}] ${point.action}(${point.method}, ${point.path})`);
            }
        }
    }

    /**
     * Controller initialization
     */
    private async setupController (Ctrl) {
        await Ctrl.initialize(this.router);
        this.annotations.push(Ctrl.annotation);
    }

    /**
     * provide async initialization for controllers
     */
    private async initialize (server: Server) {
        // NOTE create own router
        this.router = Router();
        // NOTE initialize API Controllers
        await this.setupController(UsersController);
        await this.setupController(SystemController);
        
        // NOTE initialize API router
        server.app.use(this.apiPath, this.router);
    }

    /**
     * this method provide entry point for all API controllers
     */
    public static async initialize (server: Server) {
        const instance = new IndexController();
        // NOTE initialize API controllers
        await instance.initialize(server);
        // NOTE write swagger file `paths`
        await instance.writeSwaggerPaths();
        // NOTE debug log
        if (Configuration.get('api', false) && (
            Configuration.get('api.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) { instance.log(); }
    }
}

// {
//   "/oauth": {
//     "post": {
//       "tags": [
//         "oauth"
//       ],
//       "summary": "Authentication",
//       "description": "Get authentication token using user credential",
//       "operationId": "authentication",
//       "consumes": [
//         "application/json"
//       ],
//       "produces": [
//         "application/json"
//       ],
//       "parameters": [
//         {
//           "in": "body",
//           "name": "credantional",
//           "description": "user credential",
//           "required": true,
//           "schema": {
//             "type": "object",
//             "properties": {
//               "email": {
//                 "type": "string"
//               },
//               "password": {
//                 "type": "string"
//               }
//             }
//           }
//         }
//       ],
//       "responses": {
//         "405": {
//           "description": "Invalid input"
//         }
//       }
//     },
//     "put": {
//       "tags": [
//         "oauth"
//       ],
//       "summary": "Authentication refresh",
//       "description": "Get authentication token using refresh token",
//       "operationId": "authentication-refresh",
//       "consumes": [
//         "application/json"
//       ],
//       "produces": [
//         "application/json"
//       ],
//       "parameters": [
//         {
//           "in": "body",
//           "name": "refresh-token",
//           "description": "user credential",
//           "required": true,
//           "schema": {
//             "type": "object",
//             "properties": {
//               "token": {
//                 "type": "string"
//               }
//             }
//           }
//         }
//       ],
//       "responses": {
//         "405": {
//           "description": "Invalid input"
//         }
//       }
//     },
//     "delete": {
//       "tags": [
//         "oauth"
//       ],
//       "summary": "Sign out",
//       "description": "Destroy authentication token",
//       "operationId": "sign-out",
//       "consumes": [
//         "application/json"
//       ],
//       "produces": [
//         "application/json"
//       ],
//       "parameters": [
//         {
//           "name": "Authentication",
//           "in": "header",
//           "required": false,
//           "type": "string"
//         }
//       ],
//       "responses": {
//         "200": {
//           "description": "Avery request must be success"
//         }
//       }
//     }
//   }
// }
