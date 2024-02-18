// outsource dependencies
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import * as multer from 'multer';
import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as fileStore from 'session-file-store';
import * as cors from 'cors';

// local dependencies
import Cors from './cors';
// import ParseJSON from './parse-json';
// import Configuration from '../configuration';
// import ParseUrlencoded from './parse-urlencoded';
// import StaticResources from './static-resources';

import { HOST, PORT, API_PATH, LOG_LEVEL } from '../constant';
import * as logger from '../logger';

export class Server {
  // NOTE is singleton
  protected static _instance: Server;

  protected static _nodeServer: http.Server;

  public static get app () { return this._instance.app; }

  public static get instance () { return this._instance; }

  public static create (app: express.Application) { this._instance = new Server(app); }

  // public readonly cors: boolean = Boolean(Configuration.get('cors', false));
  // public readonly static: boolean = Boolean(Configuration.get('static', false));
  // public readonly swagger: boolean = Boolean(Configuration.get('swagger', false));
  // public readonly jsonParse: boolean = Boolean(Configuration.get('jsonParse', false));
  // public readonly urlencodedParse: boolean = Boolean(Configuration.get('urlencodedParse', false));
  // public readonly port: number | string = Configuration.get('server.port', Configuration.getENV('PORT', 3000));


  private constructor (public app: express.Application) {
    // NOTE option debug middleware
    if (LOG_LEVEL > 0) { app.use(this.handleLogConnection); }
    // TODO at any cases we should subscribe required helpers from code
    // NOTE setup common middleware
    this.setupCORS();
    // if (this.cors) { Cors.initialize(this); }
    // if (this.static) { StaticResources.initialize(this); }
    // NOTE preparing all allowed and not static requests
    // if (this.jsonParse) { ParseJSON.initialize(this); }
    // if (this.urlencodedParse) { ParseUrlencoded.initialize(this); }
    // TODO multipart
    // TODO cookie
    // TODO session

    // NOTE endpoints will be setup after Server create but before Server initialize
  }

  private setupCORS () {
    // NOTE https://www.npmjs.com/package/cors#configuration-options
    const options: cors.CorsOptions = {
      credentials: true,
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Token'],
      origin: [/\/\/localhost/, /\/\/127.0.0.1/, /\/\/0.0.0.0/, 'http://some-ui', 'http://some-api'],
    };
    logger.info('SERVER:CORS', options);
    this.app.use(cors(options));
  }

  private handleLogConnection (request: express.Request, response: express.Response, next: express.NextFunction) {
    logger.info('SERVER:CONNECT', `${request.method}: ${request.originalUrl}`);
    return next();
  }

  private handleError (request: express.Request, response: express.Response) {
    // NOTE actually it should not be used
    logger.error('SERVER:404', `${request.method}: ${request.originalUrl}`);
    return response.status(404).send('Not Found');
  }

  public static async initialize () {
    logger.info('SERVER:INIT', {
      HOST,
      PORT,
    });
    // NOTE last common debug middleware
    this.instance.app.use(this.instance.handleError);
    // NOTE assumed all middleware already subscribed
    await this.start();
  }

  public static async stop () {
    if (this._nodeServer) {
      this._nodeServer.close();
      this._nodeServer = null;
      logger.error('SERVER:STOP');
    }
  }

  public static async start () {
    if (this._nodeServer) { await this.stop(); }
    await (new Promise(resolve => {
      this._nodeServer = this.instance.app.listen(PORT, () => {
        logger.important('SERVER:START', `is running on ${HOST}:${PORT}`);
        resolve(PORT);
      });
    }));
  }

}
// NOTE create express server instance
Server.create(express());
// NOTE export server
export default Server;
