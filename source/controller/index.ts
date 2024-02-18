// outsource dependencies
import * as fs from 'fs';
import * as path from 'path';
import { set } from 'lodash';
import * as express from 'express';

// local dependencies
import { Annotation } from './base';
import { API_PATH, DEBUG } from '../constant';
// controllers
import UsersController from './users';
import SystemController from './system';

export default class IndexController {
  // NOTE is singleton
  private router: express.Router;

  private annotations: Annotation[] = [];

  protected static _instance: IndexController;

  public static get annotations () { return this._instance.annotations; }

  /**
   *
   */
  private log () {
    console.info(`------------------- [API: ${API_PATH}] -------------------`);
    for (const ctrl of this.annotations) {
      console.info(`[CONTROLLER: ${ctrl.name}]: ${ctrl.path}`);
      for (const point of ctrl.endpoints) {
        const auth = point.auth ? 'private' : 'public';
        const swagger = point.swagger ? ' (+Swagger)' : '';
        console.info(`  [ENDPOINT: ${auth}${swagger}] ${point.action}(${point.method}, ${point.path})`);
      }
    }
  }

  /**
   * Controller initialization
   */
  private async setupController (Ctrl) {
    await Ctrl.initialize(this.router);
    this.annotations.push(Ctrl.annotation);
  }

  /**
   * provide async initialization for controllers
   */
  private async initialize (server: express.Application) {
    // NOTE create own router
    this.router = express.Router();
    // NOTE initialize API Controllers
    await this.setupController(UsersController);
    await this.setupController(SystemController);

    // NOTE initialize API router
    server.use(API_PATH, this.router);
  }

  /**
   * this method provide entry point for all API controllers
   */
  public static async initialize (server: express.Application) {
    this._instance = new IndexController();
    // NOTE initialize API controllers
    await this._instance.initialize(server);
    // NOTE debug log
    this._instance.log();
  }
}
