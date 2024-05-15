// outsource dependencies

// local dependencies
import { Server } from './server';
import * as config from './constant';
import { Counter } from './mongoose';
import { Logger, Redis, Mongoose } from './service';

// NOTE controllers
import SystemCtrl from './controller/system';

class API {

  public static async start () {
    // NOTE non-business DB
    await Redis.initialize();
    // NOTE business DB
    await Mongoose.initialize();
    // NOTE integer autoincrement for MongoDB
    await Counter.initialize();
    // TODO business DB @see https://www.npmjs.com/package/pg
    // await Postgres.initialize();

    // NOTE subscribe controllers
    await Server.subscribe(SystemCtrl);
    // await Server.subscribe(SystemCtrl);
    // await Server.subscribe(SystemCtrl);
    // await Server.subscribe(SystemCtrl);
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
  .catch(async error => {
    await API.stop();
    Logger.error('API', error.message, error.stack);
    process.exit(100500);
  });
