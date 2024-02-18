// outsource dependencies
import * as path from 'path';
import * as express from 'express';

// local dependencies
import { Server } from './index';
import Configuration from '../configuration';


export default class StaticOptions {
  // NOTE list of directory names
  public readonly resources: string[] = Configuration.get('static.resources', []);

  // NOTE allow | deny | ignore
  public readonly dotfiles: string = Configuration.get('static.dotfiles', 'ignore');

  public readonly maxAge: number | string = Configuration.get('static.maxAge', 0);

  public readonly etag: boolean = Boolean(Configuration.get('static.etag', true));

  public readonly extensions: string[] = Configuration.get('static.extensions', false);

  public readonly redirect: boolean = Boolean(Configuration.get('static.redirect', true));

  public readonly index: boolean | string | string[] = Configuration.get('static.index', false);

  public readonly fallthrough: boolean = Boolean(Configuration.get('static.fallthrough', true));

  public readonly cacheControl: boolean = Boolean(Configuration.get('static.cacheControl', true));

  public readonly lastModified: boolean = Boolean(Configuration.get('static.lastModified', true));

  private constructor () {
    if (Configuration.get('static', false) && (
      Configuration.get('static.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
    )) { this.log(); }
  }

  public log () {
    const fields = [];
    const hidden = [];
    Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
    console.info('\n---------------- [STATIC] ----------------'
      , JSON.stringify(this, fields, 4)
    );
  }

  public static initialize (server: Server) {
    const staticOptions = new StaticOptions();
    // NOTE absolute path to root process dir
    const main = path.dirname(process.mainModule.filename);
    for (const resource of staticOptions.resources) {
      const dirPath = path.join(main, '..', resource);
      server.app.use(resource, express.static(dirPath, staticOptions));
    }
  }
}
