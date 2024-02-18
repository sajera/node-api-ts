// outsource dependencies
import * as cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import * as https from 'https';
import * as multer from 'multer'; // need to be setup in place
import * as express from 'express';
// local dependencies
import Logger from '../logger';
import Swagger from './swagger';
import { HOST, PORT, API_PATH, LOG_LEVEL, SWAGGER_PATH } from '../constant';

export class Server {
  // NOTE is singleton
  private static _instance: Server;
  public static create () { this._instance = new Server(express()); }

  private static _nodeServer: http.Server;

  public static get expressApp () { return this._instance.expressApp; }

  public static get instance () { return this._instance; }

  private get STATIC () {
    const options = { // @see https://expressjs.com/en/4x/api.html#express.static
      fallthrough: true,
    };
    Logger.debug('SERVER:STATIC', options);
    return express.static(path.join(process.cwd(), 'public'), options);
  }

  private get CORS () {
    const options: cors.CorsOptions = { // @see https://www.npmjs.com/package/cors#configuration-options
      credentials: true,
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Token'],
      origin: [/\/\/localhost/, /\/\/127.0.0.1/, /\/\/0.0.0.0/, 'http://some-ui', 'http://some-api'],
    };
    Logger.debug('SERVER:CORS', options);
    return cors(options);
  }

  private get JSON () {
    const options = { // @see https://www.npmjs.com/package/body-parser#options
      // @see https://www.npmjs.com/package/body-parser#verify
      // verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: string = 'UTF-8') => throw new Error('At som reason'),
      // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#syntax
      // reviver: (key: string, value: any): any => ''
      inflate: true, // false => reject compressed body
      type: '*/json',
      limit: '5mb',
      strict: true,
    };
    Logger.debug('SERVER:JSON', options);
    return express.json(options);
  }

  private get URLENCODED () {
    // NOTE form data
    const options = { // @see https://www.npmjs.com/package/body-parser#options-3
      type: '*/x-www-form-urlencoded',
      extended: true,
      inflate: true, // false => reject compressed body
      limit: '2mb',
    };
    Logger.debug('SERVER:URLENCODED', options);
    return express.urlencoded(options);
  }

  private get FORM () {
    Logger.debug('SERVER:FORM', 'No files');
    return multer().none();
  }

  /**
   * let's make sure that is a common middlewares and first in a queue
   */
  private constructor (public expressApp: express.Application) {
    // NOTE debug request middleware
    if (LOG_LEVEL > 0) { expressApp.use(this.logRequest); }
    // NOTE common allow cors to make sure the error available ¯\_(ツ)_/¯
    expressApp.use(this.CORS);
    expressApp.use([new RegExp(`^${API_PATH}`), '/'], this.STATIC);
    // expressApp.use([/^\/api/, '/'], this.STATIC);
    // FIXME is it only common or should be specified per endpoint ?
    expressApp.use(API_PATH, this.URLENCODED);
    expressApp.use(API_PATH, this.FORM);
    expressApp.use(API_PATH, this.JSON);
  }


  private logRequest (request: express.Request, response: express.Response, next: express.NextFunction) {
    Logger.info('SERVER:CONNECT', `${request.method}: ${request.originalUrl}`);
    return next();
  }

  private static notFound (request: express.Request, response: express.Response) {
    // NOTE actually it should not be used
    Logger.error('SERVER:404', `${request.method}: ${request.originalUrl}`);
    return response.status(404).send('Not Found');
  }

  public static async initialize () {
    Logger.info('SERVER:INIT', { HOST, PORT });
    await this.stop();
    // NOTE last common debug middleware
    this.expressApp.use(this.notFound);
    // NOTE assumed all middleware already subscribed
    await this.start();
  }

  public static async stop () {
    if (this._nodeServer) {
      this._nodeServer.close();
      this._nodeServer = null;
      Logger.error('SERVER:STOP');
    }
  }

  public static async start () {
    if (this._nodeServer) { await this.stop(); }
    await (new Promise(resolve => {
      this._nodeServer = this.expressApp.listen(PORT, () => {
        Logger.important('SERVER:START', `is running on ${HOST}:${PORT}`);
        resolve(PORT);
      });
    }));
  }

}
// NOTE export server
export default Server;
