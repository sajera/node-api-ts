// outsource dependencies

// local dependencies
import { Server } from './server';
import { Logger } from './service';
import { Redis } from './database';
import * as config from './constant';

// NOTE controllers
import SystemCtrl from './controller/system';

class API {

  public static async start () {
    // NOTE subscribe controllers
    await Server.subscribe(SystemCtrl);
    // NOTE non-business DB
    await Redis.initialize();
    // TODO initialize database connection
    // DB.initialize();
    // TODO initialize models
    // Model.initialize(DB);
    // NOTE initialize express server
    await Server.initialize();
    // NOTE start express server
    await Server.start();
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

Logger.debug('CONFIG', config);
API.start()
  .then(() => Logger.important('API', 'Successfully started'))
  .catch(async (error: unknown) => {
    await API.stop();
    Logger.error('API', error);
    process.exit(100500);
  });
