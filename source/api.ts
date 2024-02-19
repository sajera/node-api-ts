
import Logger from './logger';
import { Server } from './server';
// import Controller from './controller';

// TODO remove
import * as config from './constant';
// import { API_PATH, SWAGGER_PATH } from './constant';
// import SwaggerServer from './server/swagger';

import TestSystemController from './test-system-ctrl'
Logger.info('CONFIG', config);

class API {

  public static async start () {
    // NOTE create server instance
    Server.create();
    // TODO initialize database connection
    // DB.initialize();
    // TODO initialize models
    // Model.initialize(DB);
    // NOTE initialize controller
    // await Controller.initialize(Server.expressApp);

    Server.subscribe(TestSystemController)

    // Server.expressApp.use(API_PATH, Controller)
    // NOTE initialize swagger
    // if (SWAGGER_PATH) {
    //   SwaggerServer.create(Controller.annotations)
    //   SwaggerServer.start(Server.expressApp)
    // }
    // NOTE initialize express server
    await Server.initialize();
    // TODO remove
    // NOTE test if error
    // await (new Promise((resolve, reject) => reject('test on error')));
  }

  public static async stop () {
    // TODO stop database connection
    // await DB.stop();
    // NOTE stop express server
    await Server.stop();
  }
}

API.start()
  .then(() => Logger.important('API', 'Successfully started'))
  .catch(async (error: unknown) => {
    await API.stop();
    Logger.error('API', error);
  });
