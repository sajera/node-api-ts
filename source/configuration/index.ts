
// outsource dependencies
import * as fs from 'fs';
import * as path from 'path';
import { get } from 'lodash';

/**
 * Implement detect and setup configuration based on environment file
 */
export class Configuration {
    private _config: Configuration;
    private static _instance: Configuration;
    private configStore: string = 'configuration';

    public static get (path: string = '', def: any = void(0)) {
        return get(this, `_instance._config${path ? '.' + path : ''}`, def);
    }

    public static getENV (path: string = '', def: any = void(0)) {
        return !path ? process.env || def : get(process.env, path, def);
    }
    
    public static initialize () {
        this._instance = new Configuration(process.env.APPLICATION_ENV || process.env.NODE_ENV);
        this._instance.initialize();
    }

    private constructor (public environment: string = 'development') {
        this._config = this;
    }

    private initialize () {
        // NOTE read "*.env" file and extend process environment
        try { this.setupEnvironment(); } catch ( error ) {
            console.warn('\n[CONFIG]', `Failed to extend environment`);
        }
        // NOTE read "*.json" file and extend configuration object
        try { this.setupConfiguration(); } catch ( error ) {
            console.warn('\n[CONFIG]', `Failed to extend configuration using "${this.environment}" `);
        }
        if (
            Boolean(Configuration.getENV('LOG_CONFIG', false))
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        ) { this.log(); }
    }
    
    public log () {
        const toView = {};
        const hidden = ['_config', 'configStore', 'environment'];
        Object.keys(this).map(key => hidden.indexOf(key) === -1 && (toView[key] = this[key]) );
        console.info(`\n---------- [CONFIG: ${this.environment}] ----------`
            , JSON.stringify(toView, null, 4)
        );
    }

    private setupConfiguration () {
        // NOTE absolute path to root process dir
        const main = path.dirname(process.mainModule.filename);
        // NOTE absolute path to configStore "{NODE_ENV||'development'}.json"
        const configFilePath = path.join(main, this.configStore, this.environment);
        const configData = require(configFilePath);
        // NOTE store configuration
        Object.assign(this._config, configData);
    }

    private setupEnvironment () {
        const pathToEnv = this.pathENV();
        // NOTE try to get and parse environment file
        const source = fs.readFileSync(pathToEnv, {encoding: 'utf8'}),
            envConfig = { NODE_ENV: this.environment },
            lines = String( source ).split('\n');
        let field: string, value: string, key = 0;
        for ( ; (key < lines.length) && lines[ key ]; key ++ ) {
            field = lines[ key ].match(/^\s*([\w\.\-\$\@\#\*\!\~]+)\s*=+/)[1];
            value = lines[ key ].match(/=\s*(.*)\s*$/)[1].trim();
            if ( field ) {
                envConfig[ field ] = value.replace(/(^['"]|['"]$)/g, '').replace(/\s+/, ' ');
            }
        }
        // NOTE to provide ability change the environment from "*.env" file
        if ( this.environment !== envConfig.NODE_ENV ) {
            this.environment = envConfig.NODE_ENV;
        }
        // NOTE extend and to process env
        Object.assign(process.env, envConfig);
    }

    /**
     * try to find env file
     */
    private pathENV () {
        // NOTE absolute path to root process dir
        const main = path.dirname(process.mainModule.filename);
        // NOTE absolute path to default ".env"
        const env = path.join(main, '../', '.env');
        // NOTE absolute path to config directory ".env"
        const dirEnv = path.join(main, this.configStore, '.env');
        // NOTE absolute path to default "{NODE_ENV||'development'}.env"
        const namedEnv = path.join(main, this.environment + '.env');
        // NOTE absolute path to config directory "{NODE_ENV||'development'}.env"
        const configStoredEnv = path.join(main, this.configStore, this.environment + '.env');
        // NOTE choose by priority
        return fs.existsSync( configStoredEnv ) ? configStoredEnv
            : fs.existsSync( namedEnv ) ? namedEnv
                : fs.existsSync( dirEnv ) ? dirEnv
                    : fs.existsSync( env ) ? env : null;
    }

}
// NOTE initialize configuration
Configuration.initialize();
// NOTE export initialized
export default Configuration;
