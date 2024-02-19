// outsource dependencies
import * as fs from 'fs';
import { set } from 'lodash';
import * as express from 'express';
import * as swagger from 'swagger-ui-express';
// local dependencies
import Logger from '../logger';
import { Annotation, ANNOTATION_TYPE } from '../controller/base';
import { PORT, HOST, API_PATH, APP_VERSION, APP_NAME, NODE_ENV, DEBUG, SWAGGER_PATH } from '../constant';

// configure
export const ANNOTATION_SWAGGER = Symbol('SWAGGER')
/**
 * Swagger addition data annotation restriction
 */
interface SwaggerAnnotation {
  description?: string;
  operationId?: string;
  summary?: string;
  tags?: string[]
  consumes?: string[]
  produces?: string[]
  parameters?: Array<any> // TODO define schema
  responses?: Partial<any> // TODO define schema
}
/**
 * Swagger addition data annotation restriction
 */
export interface SwaggerEndpoint extends SwaggerAnnotation {
  any?: any;
}
/**
 * Define addition data for swagger endpoints
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Swagger({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export function Swagger (value: SwaggerAnnotation) {
  return Reflect.metadata(ANNOTATION_SWAGGER, value);
}

const BASE = {
  tags: [],
  paths: {},
  swagger: '2.0',
  basePath: API_PATH,
  version: APP_VERSION,
  host: `${HOST}:${PORT}`,
  schemes: ['http', 'https'],
  externalDocs: { url: 'http://swagger.io', description: 'Find out more about Swagger' },
  info: {
    title: `${APP_NAME}:${NODE_ENV} API url definition`,
    contact: { email: 'allsajera@gmail.com' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    description: `Base definition for API url format. Presentation example. Path generating rules {VERSION} / {CONTROLLER} [/ {QUANTITY}] [/ {ADDITION}]
            1. VERSION -  means API version and using as base path for all urls "${API_PATH}"
            2. CONTROLLER - logic entity - handler/worker which will determine actions for specific entity or api module
            3. [QUANTITY] - mark used to determine response type as list or single item
                single - GET: api/user/{id}
                list - GET: api/user/list
            4. [ADDITION] - provide logic to define complicate actions
                DELETE: api/user/{id}/status/DISABLED
                POST: api/user/{id}/status/DISABLED
                PUT: api/user/{id}/status/{status}
                POST: api/user/filter`,
  },
  securityDefinitions: {
    Authorization: { type: 'apiKey', name: 'Authorization', in: 'header', description: 'Authorization: Bearer <ACCESS_TOKEN>' }
  },
  // TODO
  definitions: {
    Authorization: {
      type: 'string',
      example: 'JWT eyJ0eXAiOiJKV',
      description: 'Authorization token in the standard form. Possible values: \'Authorization: JWT <ACCESS_TOKEN>\' or \'Authorization: Bearer <ACCESS_TOKEN>\''
    },
  },
};

export default class SwaggerServer {
  private content = BASE
  private static _instance: SwaggerServer;
  public static get content () { return this._instance.content; }
  public static create (controllers) { this._instance = new SwaggerServer(controllers); }

  private constructor (private controllers: Annotation[]) {
    Logger.log('SWAGGER', `specification: ${this.content.swagger}`);

    this.createPaths()
    this.createDefinitions()

    // NOTE write swagger result to the file to simplify development
    DEBUG && fs.writeFile(
      'public/last-results.local.json',
      JSON.stringify(this.content, null, 2),
      () => Logger.important('SWAGGER', 'last generated results available under swagger/last-results.local.json')
    );
  }

  /**
   * generate "swagger.definitions" based on annotations from controllers
   */
  private createDefinitions () {
    // TODO setup definition it should present in configuration
    // this.content.definitions = require(path.join(process.cwd(), 'public/definitions.json'));
  }

  /**
   * generate "swagger.paths" based on annotations from controllers
   */
  private createPaths () {
    for (const controller of this.controllers) {
      // NOTE define global tags to split endpoints by controllers
      this.content.tags.push(controller.name);
      for (const endpoint of controller.endpoints) {
        // NOTE skip in case definition absent
        if (!endpoint.swagger) { continue; }
        const ep = { // NOTE definition of endpoint
          tags: [controller.name],
          summary: controller.name,
          operationId: endpoint.action,
          ...(endpoint.swagger || {}),
          // incoming data definition https://swagger.io/docs/specification/2-0/describing-parameters/
          parameters: [],
          // NOTE response definitions https://swagger.io/docs/specification/2-0/describing-responses/
          responses: {
            404: { description: 'Not Found' },
            500: { description: 'Internal Server Error' },
            // 500: { description: 'Internal Server Error', schema: { type: 'object', properties: { message: { type: "string" } } } },
          },
          // NOTE MIME Type definitions https://swagger.io/docs/specification/2-0/mime-types/
          consumes: ['application/json'],
          produces: ['application/json'],
          // NOTE Authentication https://swagger.io/docs/specification/2-0/authentication/
          security: []
        };
        if (endpoint.auth) { // NOTE Authorization declaration
          ep.security.push({ Authorization: [] });
          set(ep.responses, 401, { description: 'Unauthorized' });
        }
        // NOTE path definition https://swagger.io/docs/specification/2-0/paths-and-operations/
        let path = `${controller.path}/${endpoint.path}`.replace(/\/+/g, '/');
        for (const name of path.match(/:[^/]+/g) || []) {
          // NOTE update path to swagger definition
          path = path.replace(name, `{${name.substring(1)}}`);
          // NOTE record parameter definition
          ep.parameters.push({ name: name.substring(1), in: 'path', type: 'string', required: true });
        }
        set(this.content.paths, `${path}.${endpoint.method}`, ep);
        // console.log(`Controller ${path} => \n`
        //   , '\n endpoint:', endpoint
        //   , '\n ep:', ep
        // );
      }
    }
  }

  // TODO define parameters https://swagger.io/docs/specification/2-0/describing-parameters/
  // parameters: [
  //   {
  //     "in": "body",
  //     "name": "credantional",
  //     "description": "user credential",
  //     "required": true,
  //     "schema": {
  //       "type": "object",
  //       "properties": {
  //         "email": {
  //           "type": "string"
  //         },
  //         "password": {
  //           "type": "string"
  //         }
  //       }
  //     }
  //   }
  // ],


  public static start (server: express.Application) {
    Logger.important('SWAGGER', `available on http://${this.content.host}/swagger`);
    server.use(SWAGGER_PATH, swagger.serve, swagger.setup(this.content, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: NODE_ENV,
      customJs: null,
    }));
  }
}
