
import pkg = require('../package.json');

import Server from './server';
import Controller from './controller';
import Configuration from './configuration';


class API {

    public static async start () {

        // TODO initialize database connection
        // DB.initialize();
        // TODO initialize models / or it can be done from database initialization ?
        // IndexModel.initialize(DB);
        // TODO initialize controller
        await Controller.initialize(Server.instance);
        // NOTE initialize express server
        await Server.initialize();

        // TODO remove
        // NOTE test if error
        // await (new Promise((resolve, reject) => reject('test on error')));
    }

    public static async stop () {
        // TODO stop database connection

        // NOTE stop express server
        await Server.stop();
    }
}

API.start().then(() => console.info(`\n[API: ${pkg.name} -v ${pkg.version}] Successfully running\n`) )
    .catch(async (error: any) => {
        await API.stop();
        console.error(`\n[API: ${pkg.name} -v ${pkg.version}] was stopped with error:` , error);
    });
