// outsource dependencies
import * as cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
// local dependencies
import Swagger from './swagger';
import { Logger } from '../service';
import * as middleware from './middleware';
import { Controller, Annotation } from './controller';
import { HOST, PORT, API_PATH, LOG_LEVEL, SWAGGER_PATH, STATIC_PATH } from '../constant';

export class Server {
  // NOTE is singleton
  private static _instance: Server;
  private router = express.Router()
  private annotation: Annotation[] = []
  private static _nodeServer: http.Server;
  private static get instance () { return this._instance; }

  public static create () { this._instance = new Server(express()); }
  public static get expressApp () { return this._instance.expressApp; }

  private get STATIC () {
    Logger.important('SERVER', `Serve the static content from the ./public folder on the .${STATIC_PATH} path`);
    // @see https://expressjs.com/en/4x/api.html#express.static
    return express.static(path.join(process.cwd(), 'public'), { fallthrough: true });
  }

  private get CORS () {
    Logger.important('SERVER', 'CORS enabled from root ./ ');
    return cors({ // @see https://www.npmjs.com/package/cors#configuration-options
      credentials: true,
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Token'],
      origin: [/\/\/localhost/, /\/\/127.0.0.1/, /\/\/0.0.0.0/, 'http://some-ui', 'http://some-api'],
    });
  }

  /**
   * let's make sure that is a common middlewares and first in a queue
   */
  private constructor (public expressApp: express.Application) {
    // NOTE debug request middleware
    if (LOG_LEVEL > 0) { expressApp.use(this.logRequest); }
    // NOTE common allow cors to make sure the errors also available ¯\_(ツ)_/¯
    expressApp.use(this.CORS);
    STATIC_PATH && expressApp.use([new RegExp(`^${API_PATH}`), STATIC_PATH], this.STATIC);
  }

  private logRequest (request: express.Request, response: express.Response, next: express.NextFunction) {
    Logger.important('SERVER:CONNECT', `${request.method}: ${request.originalUrl}`);
    return next();
  }

  private static notFound (request: express.Request, response: express.Response) {
    // NOTE actually it should not be used
    Logger.error('SERVER:404', `${request.method}: ${request.originalUrl}`);
    return response.status(404).send('Not Found');
  }

  public static subscribe (Ctrl: typeof Controller) {
    // NOTE grab all annotation
    this.instance.annotation.push(Ctrl.annotation)
    // NOTE create controller router
    const router = express.Router();
    // NOTE setup all endpoints of controller
    for (const { path, method, action, urlencoded, json } of Ctrl.annotation.endpoints) {
      Logger.info('SUBSCRIBE', `${Ctrl.annotation.name} => ${method.toUpperCase()}(${action}) ${API_PATH}${Ctrl.annotation.path}${path}`);
      const middlewares = []
      // NOTE middlewares of endpoint
      json && middlewares.push(middleware.jsonMiddleware(json))
      urlencoded && middlewares.push(middleware.urlEncodedMiddleware(urlencoded))
      // NOTE set up the controller handler
      middlewares.push(Ctrl.handle(action))
      router[method].apply(router, [path, ...middlewares])
    }
    // NOTE add the controller route
    this.instance.router.use(Ctrl.annotation.path, router)
  }

  public static async initialize () {
    Logger.debug('SERVER', 'protocol HTTP');
    // NOTE it's should be impossible
    await this.stop();

    // NOTE initialize swagger
    if (SWAGGER_PATH) {
      Swagger.create(this.instance.annotation)
      Swagger.start(this.expressApp)
    }
    // NOTE last common debug middleware
    this.expressApp.use(API_PATH, this.instance.router);
    // NOTE last common debug middleware
    this.expressApp.use(this.notFound);
    // NOTE assumed all middleware already subscribed
    await this.start();
  }

  public static async stop () {
    if (this._nodeServer) {
      this._nodeServer.close();
      this._nodeServer = null;
      Logger.error('SERVER', 'was stopped');
    }
  }

  public static async start () {
    if (this._nodeServer) { await this.stop(); }
    await (new Promise(resolve => {
      this._nodeServer = this.expressApp.listen(PORT, () => {
        Logger.important('SERVER', `is running on http://${HOST}:${PORT}`);
        resolve(PORT);
      });
    }));
  }
}
