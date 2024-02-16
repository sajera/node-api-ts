// outsource dependencies
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import * as multer from 'multer';
import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as fileStore from 'session-file-store';

// local dependencies
import Cors from './cors';
import ParseJSON from './parse-json';
import Configuration from '../configuration';
import ParseUrlencoded from './parse-urlencoded';
import StaticResources from './static-resources';


export class Server {
  // NOTE is singleton
  protected static _instance: Server;
  public static get instance () { return this._instance; }
  public static create (app: express.Application) { this._instance = new Server(app); }

  protected static _nodeServer: http.Server;
  public readonly cors: boolean = Boolean(Configuration.get('cors', false));
  public readonly static: boolean = Boolean(Configuration.get('static', false));
  public readonly swagger: boolean = Boolean(Configuration.get('swagger', false));
  public readonly showLog: boolean = Boolean(Configuration.get('server.log', false));
  public readonly jsonParse: boolean = Boolean(Configuration.get('jsonParse', false));
  public readonly urlencodedParse: boolean = Boolean(Configuration.get('urlencodedParse', false));
  public readonly port: number | string = Configuration.get('server.port', Configuration.getENV('PORT', 3000));


  // TODO to think
  public readonly apiPath: string = Configuration.get('api.path', '/api');


  private constructor (public app: express.Application) {
    // NOTE option debug middleware
    if (this.showLog) { app.use(this.handleLogConnection); }
    // NOTE setup common middleware
    if (this.cors) { Cors.initialize(this); }
    if (this.static) { StaticResources.initialize(this); }
    // NOTE preparing all allowed and not static requests
    if (this.jsonParse) { ParseJSON.initialize(this); }
    if (this.urlencodedParse) { ParseUrlencoded.initialize(this); }
    // TODO multipart
    // TODO cookie
    // TODO session

    // NOTE endpoints will be setup after Server create but before Server initialize
  }

  private handleLogConnection (request: express.Request, response: express.Response, next: express.NextFunction) {
    console.info(`[SERVER:CONNECT] ${request.method}: ${request.originalUrl}`);
    return next();
  }

  private handleError (request: express.Request, response: express.Response) {
    // NOTE actually it should not be used
    console.error(`[SERVER:404] ${request.method}: ${request.originalUrl}`);
    return response.status(404).send('Not Found');
  }

  public log () {
    const fields = [];
    const hidden = ['_instance', '_nodeServer'];
    Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
    console.info(`\n----------------- [SERVER: ${Configuration.get('environment')}] -----------------`
      , JSON.stringify(this, fields, 4)
    );
  }

  public static async initialize () {
    this.instance.log();
    // NOTE last common debug middleware
    this.instance.app.use(this.instance.handleError);
    await this.start();
  }

  public static async stop () {
    if (this._nodeServer) {
      this._nodeServer.close();
      this._nodeServer = null;
      console.info(`\n[SERVER] was stopped on ${this.instance.port} port`);
    }
  }

  public static async start () {
    if (this._nodeServer) { await this.stop(); }
    await (new Promise(resolve => {
      this._nodeServer = this.instance.app.listen(this.instance.port, () => {
        console.info(`\n[SERVER] is running on ${this.instance.port} port`);
        resolve(this.instance.port);
      });
    }));
  }

}
// NOTE create express server instance
Server.create(express());
// NOTE export server
export default Server;
