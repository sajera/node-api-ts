// outsource dependencies
import * as mongoose from 'mongoose';

// local dependencies
import { Logger } from '../service';
import { MONGO_URL } from '../constant';

class Mongoose {
  public static CONNECTED = false;

  private options: mongoose.ConnectOptions = { bufferCommands: false, autoIndex: true, autoCreate: true };

  private client: mongoose.Connection;

  constructor () {
    this.client = mongoose.connection;
    this.client.on('connecting', () => Logger.important('MONGOOSE', `Trying to establish Mongoose connection ${MONGO_URL}`));
    this.client.on('error', error => Logger.error('MONGOOSE', { message: error.message, stack: error.stack }));
    this.client.on('connected', () => {
      Logger.debug('MONGOOSE', 'Connection ready');
      Mongoose.CONNECTED = true;
    });
    this.client.on('disconnected', () => {
      Logger.debug('MONGOOSE', 'Connection closed');
      Mongoose.CONNECTED = false;
      // FIXME should we try to reconnect ? - btw the Mongoose has their own strategy to reconnect and 'disconnected' fired in case it fail
      // Mongoose.initialize();
    });
  }

  // NOTE is singleton
  private static instance: Mongoose;

  public static create () { this.instance = new Mongoose(); }

  public static initialize () {
    return mongoose.connect(MONGO_URL, this.instance.options);
  }
}

// NOTE create server instance
Mongoose.create();
export { Mongoose };
