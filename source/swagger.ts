// outsource dependencies
import * as fs from 'fs';
import { set } from 'lodash';
import * as path from 'path';
import * as swagger from 'swagger-ui-express';

// local dependencies
import { Server } from './server';
import Configuration from './configuration';
import { Annotation } from './controller/base';

export default class SwaggerOptions {
  public readonly customJs: string = Configuration.get('swagger.customJs', null);
  public readonly customCss: string = Configuration.get('swagger.customCss', null);
  public readonly explorer: boolean = Configuration.get('swagger.explorer', false);
  public readonly swaggerUrl: string = Configuration.get('swagger.swaggerUrl', null);
  public readonly customSiteTitle: string = Configuration.get('swagger.customSiteTitle', 'Sajera API');

  // TODO remove
  public readonly paths: string = Configuration.get('swagger.paths', null);
  public readonly definitions: string = Configuration.get('swagger.definitions', null);
  public readonly info: string = Configuration.get('swagger.info', 'swagger/info.json');

  private constructor () {
    if (Configuration.get('swagger', false) && (
      Configuration.get('swagger.log', false)
      || Configuration.get('debug', false)
      || Configuration.getENV('DEBUG', false)
    )) { this.log(); }
  }

  public log () {
    const fields = [];
    const hidden = [];
    Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
    console.info('\n---------------- [SWAGGER] ----------------'
      , JSON.stringify(this, fields, 4)
    );
  }

  /**
   * almost static swagger information
   */
  private static getContent (server: Server) {
    return {
      tags: [],
      paths: {},
      swagger: '2.0',
      basePath: server.apiPath,
      schemes: ['http', 'https'],
      externalDocs: { url: 'http://swagger.io', description: 'Find out more about Swagger' },
      info: {
        title: 'API url definition',
        contact: { email: 'allsajera@gmail.com' },
        license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
        description: `Base definition for API url format. Presentation example. Path generating rules {VERSION} / {CONTROLLER} [/ {QUANTITY}] [/ {ADDITION}]
            1. VERSION -  means API version and using as base path for all urls "${server.apiPath}"
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
      host: `0.0.0.0:${server.port}`,
      version: Configuration.get('VERSION', '1.0.0'),
      definitions: {
        Authorization: {
          type: 'string',
          example: 'JWT eyJ0eXAiOiJKV',
          description: "Authorization token in the standard form. Possible values: 'Authorization: JWT <ACCESS_TOKEN>' or 'Authorization: Bearer <ACCESS_TOKEN>'"
        },
      },
    }
  }

  /**
   * generate "swagger.paths" based on annotations from controllers
   */
  private static definePaths (content, controllers: Annotation[]) {
    for (const controller of controllers) {
      // NOTE define global tags to split endpoints by controllers
      content.tags.push(controller.name)
      for (const endpoint of controller.endpoints) {
        // NOTE skip in case definition absent
        if (!endpoint.swagger) continue
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
        }
        if (endpoint.auth) { // NOTE Authorization declaration
          ep.security.push({ Authorization: [] })
          set(ep.responses, 401, { description: 'Unauthorized' })
        }
        // NOTE path definition https://swagger.io/docs/specification/2-0/paths-and-operations/
        let path = `${controller.path}/${endpoint.path}`.replace(/\/+/g, '/')
        for (let name of path.match(/:[^/]+/g) || []) {
          // NOTE update path to swagger definition
          path = path.replace(name, `{${name.substring(1)}}`)
          // NOTE record parameter definition
          ep.parameters.push({ name: name.substring(1), in: 'path', type: 'string', required: true })
        }
        set(content.paths, `${path}.${endpoint.method}`, ep)
        console.log(`Controller ${path} => \n`
          , '\n endpoint:', endpoint
          , '\n ep:', ep
        );
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
    const swaggerOptions = new SwaggerOptions();
    // NOTE base information may contain any swagger data
    const content = SwaggerOptions.getContent(server);
    // NOTE controller annotation into sagger declaration
    SwaggerOptions.definePaths(content, controllers);
    // TODO setup definitions

    console.log('\n---------------- [SWAGGER] ----------------'
      // , '\n swagger:', server
      // , '\n content:', content
      // , '\n controllers:', controllers
    );

    // TODO setup definition it should present in configuration
    content.definitions = !swaggerOptions.definitions ? {}
      : require(path.join(process.cwd(), swaggerOptions.definitions));
    // NOTE write swagger result to the file to simplify development
    // fs.writeFile('swagger/last-results.local.json', JSON.stringify(content, null, 4), () => '');
    // NOTE setup swagger
    server.app.use('/swagger', swagger.serve, swagger.setup(content, swaggerOptions));
  }
}
