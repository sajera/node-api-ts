// outsource dependencies
import * as cors from 'cors';
import * as http from 'node:http';
import * as path from 'node:path';
import * as express from 'express';
import * as cookie from 'express-session';
// local dependencies
import Swagger from './swagger';
import { Logger } from '../service';
import * as middleware from './middleware';
import { Controller, Annotation } from './controller';
import { HOST, PORT, API_PATH, DEBUG, SWAGGER_PATH, STATIC_PATH, COOKIE_SECRET } from '../constant';


class Server {
  private router = express.Router();

  private annotation: Annotation[] = [];

  private constructor (public expressApp: express.Application) { Logger.info('SERVER', 'create Express App'); }

  // NOTE is singleton
  private static instance: Server;

  private static nodeServer: http.Server;

  public static create () { this.instance = new Server(express()); }

  public static get expressApp () { return this.instance.expressApp; }

  private static get STATIC () {
    Logger.important('SERVER', `serve the static content from the ./public folder on the '${STATIC_PATH}' path`);
    // @see https://expressjs.com/en/4x/api.html#express.static
    return express.static(path.join(process.cwd(), 'public'), { fallthrough: true });
  }

  private static get COOKIE () {
    Logger.important('SERVER', `COOKIE is enabled and ${!DEBUG ? '' : 'not ' }secure`);
    !DEBUG && this.expressApp.set('trust proxy', 1);
    return cookie({ // @see https://expressjs.com/en/resources/middleware/session.html
      resave: false,
      secret: COOKIE_SECRET,
      saveUninitialized: true,
      cookie: { maxAge: 60000, secure: !DEBUG },
    });
  }

  private static get CORS () {
    Logger.important('SERVER', 'CORS enabled from \'/\' path');
    return cors({ // @see https://www.npmjs.com/package/cors#configuration-options
      credentials: true,
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization'],
      origin: [/\/\/localhost/, /\/\/127.0.0.1/, /\/\/0.0.0.0/, 'http://some-ui', 'http://some-api'],
    });
  }

  private static logRequest (request: express.Request, response: express.Response, next: express.NextFunction) {
    Logger.important('REQUEST', `${request.method}: ${request.originalUrl}`);
    return next();
  }

  private static notFound (request: express.Request, response: express.Response) {
    // NOTE actually it should not be used
    Logger.error('SERVER:404', `${request.method}: ${request.originalUrl}`);
    return response.status(404).type('json').send({ code: '404', error: 'Not Found' });
  }

  public static subscribe (Ctrl: typeof Controller) {
    // NOTE grab all annotation
    this.instance.annotation.push(Ctrl.annotation);
    // NOTE create controller router
    const router = express.Router();
    // NOTE setup all endpoints of controller
    for (const { path, method, action, urlencoded, json, auth, query, params, multer } of Ctrl.annotation.endpoints) {
      Logger.log('SUBSCRIBE', `${Ctrl.annotation.name} => ${method.toUpperCase()}(${action}) ${API_PATH}${Ctrl.annotation.path}${path}`);
      let middlewares = [];
      // NOTE check auth first
      auth && (middlewares = middlewares.concat(middleware.authMiddleware(auth)));
      // NOTE query is light and important
      query && (middlewares = middlewares.concat(middleware.queryMiddleware(query)));
      // NOTE params is light and important
      params && (middlewares = middlewares.concat(middleware.paramsMiddleware(params)));
      // NOTE skip multipart form data
      urlencoded && (middlewares = middlewares.concat(middleware.urlEncodedMiddleware(urlencoded)));
      // NOTE allow to take data from "urlencoded" first
      json && (middlewares = middlewares.concat(middleware.jsonMiddleware(json)));
      // TODO multipart form data
      multer && (middlewares = middlewares.concat(middleware.multerMiddleware(multer)));
      // NOTE set up the controller action handler
      middlewares.push(Ctrl.handle(action))
      // NOTE pass middlewares of endpoint based on annotation(decorators)
      router[method](path, ...middlewares);
    }
    // NOTE add the controller route
    this.instance.router.use(Ctrl.annotation.path, router);
  }

  public static async initialize () {
    Logger.info('SERVER', 'initialize routes');
    // NOTE log all connections
    if (DEBUG) { this.expressApp.use(this.logRequest); }
    // NOTE common allow cors to make sure the errors also available ¯\_(ツ)_/¯
    this.expressApp.use(API_PATH, this.CORS);
    // NOTE enable cookie session
    COOKIE_SECRET && this.expressApp.use(API_PATH, this.COOKIE);
    // NOTE serve static from root path "/" exclude "/api/*" paths
    STATIC_PATH && this.expressApp.use([new RegExp(`^${API_PATH}`), STATIC_PATH], this.STATIC);
    // NOTE initialize swagger
    if (SWAGGER_PATH) {
      Swagger.create(this.instance.annotation);
      Swagger.start(this.expressApp);
    }
    // NOTE business logic middleware
    this.expressApp.use(API_PATH, this.instance.router);
    // NOTE last common middleware
    this.expressApp.use(this.notFound);
  }

  public static async stop () {
    if (this.nodeServer) {
      this.nodeServer.close();
      this.nodeServer = null;
      Logger.error('SERVER', 'was stopped');
    }
  }

  public static async start () {
    await this.stop();
    await (new Promise(resolve => {
      this.nodeServer = this.expressApp.listen(PORT, () => {
        Logger.important('SERVER', `is running on http://${HOST}:${PORT}`);
        resolve(PORT);
      });
    }));
  }
}
// NOTE create server instance
Server.create();
export { Server };
export default Server;
