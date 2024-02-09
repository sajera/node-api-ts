
import pkg = require('../package.json');

import Server from './server';
import Swagger from './swagger';
import Controller from './controller';
import Configuration from './configuration';


class API {

  public static async start () {

    // TODO initialize database connection
    // DB.initialize();
    // TODO initialize models
    // Model.initialize(DB);
    // TODO initialize controller
    await Controller.initialize(Server.instance);
    // NOTE
    await Swagger.initialize(Server.instance, Controller.annotations)
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
  .then(() => console.info(`\n[API: ${pkg.name} -v ${pkg.version}] Successfully running\n`))
  .catch(async (error: any) => {
    await API.stop();
    console.error(`\n[API: ${pkg.name} -v ${pkg.version}] was stopped with error:` , error);
  });
