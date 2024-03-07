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
  sample?: unknown;
  // NOTE swagger annotation as is
  summary: string;
  tags?: string[];
  description?: string;
  parameters?: Array<SwParam>;
  responses?: { [key: number]: SwResponse };
}
interface SwParam {
  in: string;
  name: string;
  type?: string;
  schema?: unknown;
  required?: boolean;
  description?: string;
}
interface SwResponse {
  schema?: unknown;
  description?: string;
}
interface SwEP extends Omit<SwaggerAnnotation, 'sample'> {
  operationId: string;
  consumes: string[];
  produces: string[];
  security: Array<unknown>;
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
export function Swagger (options: SwaggerAnnotation) {
  return Reflect.metadata(ANNOTATION_SWAGGER, options);
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

  private get S401 () {
    return {
      description: 'Unauthorized',
      schema: this.schemaFromSample({
        code: '401',
        error: 'Unauthorized'
      })
    };
  }

  private get S404 () {
    return {
      description: 'Not Found',
      schema: this.schemaFromSample({
        code: '404',
        error: 'Not Found'
      })
    };
  }

  private get S422 () {
    return {
      description: 'Unprocessable Entity',
      schema: this.schemaFromSample({
        code: '...VALIDATION',
        error: { filed: '... message' }
      })
    };
  }

  private get S500 () {
    return {
      description: 'Internal Server Error',
      schema: this.schemaFromSample({
        code: 'INTERNAL',
        error: '... message'
      })
    };
  }

  private get COMMON () {
    return {
      tags: [],
      // incoming data definition https://swagger.io/docs/specification/2-0/describing-parameters/
      parameters: [],
      // NOTE response definitions https://swagger.io/docs/specification/2-0/describing-responses/
      responses: { 404: this.S404, 500: this.S500, 422: this.S422 },
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
        const { sample, ...sw } = endpoint.swagger;
        const swEP: SwEP = { ...this.COMMON, operationId: endpoint.action, ...sw };
        // NOTE mark as part of controller
        swEP.tags.push(controller.name);
        // NOTE response output from sample
        sample && (swEP.responses[200] = {
          description: 'Output Schema sample',
          schema: this.schemaFromSample(sample),
        });
        // NOTE path definition https://swagger.io/docs/specification/2-0/paths-and-operations/
        let path = `${controller.path}/${endpoint.path}`.replace(/\/+/g, '/');
        for (const name of path.match(/:[^/]+/g) || []) {
          // NOTE update path to swagger definition
          path = path.replace(name, `{${name.substring(1)}}`);
          // NOTE definition from path <=> params
          swEP.parameters.push({ name: name.substring(1), in: 'path', type: 'string', required: true });
        }
        // NOTE query support only primitive values
        const queryFields = _.get(endpoint, 'query.schema.schema.fields');
        queryFields && _.entries(queryFields).map(([name, value]) => swEP.parameters.push({
          name,
          in: 'query',
          type: _.get(value, 'type'),
          required: !_.get(value, 'spec.optional')
        }));
        // NOTE json | urlencoded - body
        const bodySchema = _.get(endpoint, 'json.schema.schema') || _.get(endpoint, 'urlencoded.schema.schema');
        bodySchema && swEP.parameters.push({
          in: 'body',
          name: 'body',
          required: true,
          description: 'Input Schema sample',
          schema: this.schemaFromYup(bodySchema),
        });
        // NOTE Authorization declaration
        if (endpoint.auth) {
          swEP.security.push({ Authorization: [] });
          _.set(swEP.responses, 401, this.S401);
        }
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

  private schemaFromSample (data) {
    // NOTE common schema for all types
    const schema = { type: typeof data, example: data };

    switch (schema.type) {
      default: return schema;
      // NOTE edge-cases
      case 'number': return { ...schema, type: 'integer' };
      case 'object':
        if (!data) { return schema; }
        if (Array.isArray(data)) {
          return { type: 'array', items: this.schemaFromSample(_.first(data)) };
        }
        // eslint-disable-next-line no-case-declarations
        const properties = {};
        for (const field in data) {
          _.set(properties, field, this.schemaFromSample(_.get(data, field)));
        }
        return { type: 'object', properties };
    }
  }

  private schemaFromYup (data) {
    // NOTE common schema for all types
    const schema = { type: _.get(data, 'type'), required: !_.get(data, 'spec.optional') };
    switch (schema.type) {
      default: return schema;
      // NOTE complex data types
      case 'array': return _.set(schema, 'items', this.schemaFromYup(data.innerType));
      case 'object':
        for (const [name, value] of _.entries(data.fields)) {
          _.set(schema, `properties.${name}`, this.schemaFromYup(value));
        }
        return schema;
    }
  }

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
