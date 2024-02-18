
import Server from './server';
import Swagger from './swagger';
import Controller from './controller';
// import Configuration from './configuration';
import * as logger from './logger';
import * as config from './constant';

class API {

  public static async start () {
    // NOTE
    logger.info('CONFIG', config);

    // TODO initialize database connection
    // DB.initialize();
    // TODO initialize models
    // Model.initialize(DB);
    // TODO initialize controller
    await Controller.initialize(Server.instance);
    // NOTE
    await Swagger.initialize(Server.instance, Controller.annotations);
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
  .then(() => logger.important('API', 'Successfully started'))
  .catch(async (error: unknown) => {
    await API.stop();
    logger.error('API', error);
  });
