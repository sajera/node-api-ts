// outsource dependencies
import * as fs from 'fs';
import { set } from 'lodash';
import * as path from 'path';
import * as swagger from 'swagger-ui-express';

// local dependencies
import { Server } from './server';
import * as logger from './logger';
import { Annotation } from './controller/base';
import { PORT, HOST, API_PATH, APP_VERSION, APP_NAME, NODE_ENV, DEBUG } from './constant';

export default class SwaggerOptions {

  private constructor () {
    logger.log('SWAGGER', this);
  }

  /**
   * almost static swagger information
   */
  private static getContent () {
    return {
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
  }

  /**
   * generate "swagger.paths" based on annotations from controllers
   */
  private static definePaths (content, controllers: Annotation[]) {
    for (const controller of controllers) {
      // NOTE define global tags to split endpoints by controllers
      content.tags.push(controller.name);
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
        set(content.paths, `${path}.${endpoint.method}`, ep);
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

  public static initialize (server: Server, controllers: Annotation[]) {
    // NOTE base information may contain any swagger data
    const content = SwaggerOptions.getContent();
    // NOTE controller annotation into sagger declaration
    SwaggerOptions.definePaths(content, controllers);
    // TODO setup definitions

    logger.important('SWAGGER', `available on ${content.host}/swagger`, `swagger:${content.swagger}`);

    // TODO setup definition it should present in configuration
    content.definitions = require(path.join(process.cwd(), 'swagger/definitions.json'));
    // NOTE write swagger result to the file to simplify development
    DEBUG && fs.writeFile(
      'swagger/last-results.local.json',
      JSON.stringify(content, null, 2),
      () => logger.important('SWAGGER', 'last generated results available under swagger/last-results.local.json')
    );
    // TODO setup swagger
    server.app.use('/swagger', swagger.serve, swagger.setup(content, {
      customSiteTitle: NODE_ENV,
      customJs: null,
      customCss: '.swagger-ui .topbar { display: none }',
      // NOTE generate at runtime
      // filePath: "swagger/swagger-api-doc.json",
    }));
  }
}
