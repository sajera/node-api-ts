// outsource dependencies
import * as fs from 'fs';
import * as _ from 'lodash';
import * as express from 'express';
import * as swagger from 'swagger-ui-express';
// local dependencies
import { Logger } from '../service';
import { Annotation } from './controller';
import { PORT, HOST, API_PATH, APP_VERSION, APP_NAME, NODE_ENV, DEBUG, SWAGGER_PATH } from '../constant';


/**
 * Swagger addition data annotation restriction
 */
export interface SwaggerAnnotation {
  description?: string;
  summary: string;
  tags?: string[];
  parameters?: Array<any>; // TODO define schema
  responses?: Partial<any>; // TODO define schema
}
export interface SwEP extends SwaggerAnnotation {
  tags: string[];
  operationId: string;
  consumes: string[];
  produces: string[];
  security: Array<any>;
  parameters: Array<any>;
  responses: any;
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
export const ANNOTATION_SWAGGER = Symbol('SWAGGER');
export function Swagger (pathOptions: SwaggerAnnotation) {
  return Reflect.metadata(ANNOTATION_SWAGGER, pathOptions);
}

export default class SwaggerServer {
  private content = {
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
    definitions: {
      Authorization: {
        in: 'header',
        type: 'string',
        example: 'Bearer <ACCESS_TOKEN>',
        description: 'Authorization token in the standard form. Possible values: "Authorization: Bearer <ACCESS_TOKEN>"'
      },
    },
  };

  private get R401 () {
    return {
      description: 'Unauthorized',
      schema: this.schemaFromSample({
        code: '401',
        error: 'Unauthorized'
      })
    }
  }

  private get R404 () {
    return {
      description: 'Not Found',
      schema: this.schemaFromSample({
        code: '404',
        error: 'Not Found'
      })
    }
  }

  private get R500 () {
    return {
      description: 'Internal Server Error',
      schema: this.schemaFromSample({
        code: 'INTERNAL',
        error: 'Cannot read properties of undefined (reading "id")'
      })
    }
  }

  private get COMMON () {
    return {
      tags: [],
      // incoming data definition https://swagger.io/docs/specification/2-0/describing-parameters/
      parameters: [],
      // NOTE response definitions https://swagger.io/docs/specification/2-0/describing-responses/
      responses: { 404: this.R404, 500: this.R500 },
      // NOTE MIME Type definitions https://swagger.io/docs/specification/2-0/mime-types/
      consumes: ['application/json'],
      produces: ['application/json'],
      // NOTE Authentication https://swagger.io/docs/specification/2-0/authentication/
      security: []
    };
  }

  private constructor (private controllers: Annotation[]) {
    Logger.debug('SWAGGER', `specification: ${this.content.swagger}`);
    for (const controller of this.controllers) {
      // NOTE define global tags to split endpoints by controllers
      this.content.tags.push(controller.name);
      // IMPORTANT define controller endpoints
      for (const endpoint of controller.endpoints) {
        // IMPORTANT skip in case definition absent
        if (!endpoint.swagger) { continue; }
        // NOTE definition of endpoint
        const swEP: SwEP = { ...this.COMMON, ...endpoint.swagger, operationId: endpoint.action };
        // NOTE mark as part of controller
        swEP.tags.push(controller.name)
        // NOTE Authorization declaration
        if (endpoint.auth) {
          swEP.security.push({ Authorization: [] });
          _.set(swEP, 'responses.401', this.R401);
        }
        // NOTE path definition https://swagger.io/docs/specification/2-0/paths-and-operations/
        let path = `${controller.path}/${endpoint.path}`.replace(/\/+/g, '/');
        for (const name of path.match(/:[^/]+/g) || []) {
          // NOTE update path to swagger definition
          path = path.replace(name, `{${name.substring(1)}}`);
          // NOTE definition from path <=> params
          swEP.parameters.push({ name: name.substring(1), in: 'path', type: 'string', required: true });
        }

        // NOTE query support only primitive values
        const queryFields = _.get(endpoint, 'query.schema.schema.fields')
        if (queryFields) {// NOTE support only primitive values
          for (const [name, value] of Object.entries(queryFields)) {
            swEP.parameters.push({ name, in: 'query', type: _.get(value, 'type'), required: !_.get(value, 'spec.optional') })
          }
        }
        // TODO json - body
        const jsonFields = _.get(endpoint, 'json.schema.schema.fields')
        if (jsonFields) {// NOTE support only primitive values
          const body = { in: 'body', name: 'body', required: true, description: 'JSON Schema', schema: { type: 'object' } }
          console.log('json', body)

          for (const [name, value] of Object.entries(jsonFields)) {
            console.log('json:field', name, value)
            _.set(body, `schema.properties.${name}`, {
              required: !_.get(value, 'spec.optional'),
              type: _.get(value, 'type'),
            })
          }
          console.log(`Controller ${path} => JSON`, body);
          swEP.parameters.push(body)
        }
        // TODO urlencoded - body

        // NOTE include to "path" definition
        _.set(this.content.paths, `${path}.${endpoint.method}`, swEP);
        // console.log(`Controller ${path} => \n`
        //   , '\n endpoint:', _.omit(endpoint, ['auth', 'swagger'])
        //   // , '\n sw:', swEP
        // );
      }
    }

    // NOTE write swagger result to the file to simplify development
    DEBUG && fs.writeFile(
      'public/last-results.local.json',
      JSON.stringify(this.content, null, 2),
      () => Logger.debug('SWAGGER', 'last generated results available under public/last-results.local.json')
    );
  }

  private schemaFromSample (data, enums?: Array<string|number>) {
    const result = { type: typeof data }

    if (Array.isArray(data)) {
      _.set(result, 'type', 'array')
      _.set(result, 'items', this.schemaFromSample(_.first(data)))
      enums && _.set(result, 'items.enum', enums)
    }

    if (result.type === 'object') {
      _.set(result, 'type', 'object')
      for (const key in data) {
        _.set(result, `properties.${key}`, this.schemaFromSample(_.get(data, key)))
      }
    }

    if (result.type === 'string') {
      _.set(result, 'type', 'string')
      _.set(result, 'example', data)
      enums && _.set(result, 'enum', enums)
    }

    if (result.type === 'number') {
      _.set(result, 'type', 'integer')
      _.set(result, 'format', 'int32')
      _.set(result, 'example', data)
      enums && _.set(result, 'enum', enums)
    }

    return result
  }

  private schemaFromYup (data) {
    const result = []
    for (const [name, value] of Object.entries(data)) {
      const parameter = { name,  in: from, type: _.get(value, 'type') }
      console.log(`schemaType => ${name}:`, value);
      console.log(`schemaType => ${name}:`, parameter);

      result.push(parameter)
    }

    return result
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



  private static instance: SwaggerServer;

  public static create (controllers) { this.instance = new SwaggerServer(controllers); }

  public static start (server: express.Application) {
    Logger.important('SWAGGER', `available on http://${HOST}:${PORT}${SWAGGER_PATH}`);
    server.use(SWAGGER_PATH, swagger.serve, swagger.setup(this.instance.content, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: NODE_ENV,
      customJs: null,
    }));
  }
}
