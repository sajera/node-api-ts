// outsource dependencies
import * as cors from 'cors';

// local dependencies
import { Server } from './index';
import Configuration from '../configuration';


export default class CorsOptions {
    public readonly credentials: boolean = Configuration.get('cors.credentials', true);
    public readonly origin: boolean | string | string[] = Configuration.get('cors.origin', false);
    public readonly preflightContinue: boolean = Configuration.get('cors.preflightContinue', true);
    public readonly methods: string[] = Configuration.get('cors.methods', [
        'GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'
    ]);
    public readonly exposedHeaders: string[] = Configuration.get('cors.exposedHeaders', [
        'Content-Range', 'X-Content-Range'
    ]);
    public readonly allowedHeaders: string[] = Configuration.get('cors.allowedHeaders', [
        'Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Token'
    ]);

    private constructor () {
        if (Configuration.get('cors', false) && (
            Configuration.get('cors.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) { this.log(); }
    }

    public log () {
        const fields = [];
        const hidden = [];
        Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
        console.info('\n---------------- [CORS] ----------------'
            , JSON.stringify(this, fields, 4)
        );
    }
    
    public static initialize (server: Server) {
        const corsOptions = new CorsOptions();
        server.app.use(cors(corsOptions));
    }
}
