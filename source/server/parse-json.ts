// outsource dependencies
import * as bodyParser from 'body-parser';

// local dependencies
import { Server } from './index';
import Configuration from '../configuration';


export default class JsonOptions {
    public readonly strict: boolean = Boolean(Configuration.get('jsonParse.strict', true));
    public readonly inflate: boolean = Boolean(Configuration.get('jsonParse.inflate', true));
    public readonly limit: number | string = Configuration.get('jsonParse.limit', '100kb');
    public readonly type: string | string[] = Configuration.get('jsonParse.type', 'application/json');
    private constructor () {
        if (Configuration.get('jsonParse', false) && (
            Configuration.get('jsonParse.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) { this.log(); }
    }

    public log () {
        const fields = [];
        const hidden = [];
        Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
        console.info('\n---------------- [BODY:JSON] ----------------'
            , JSON.stringify(this, fields, 4)
        );
    }
    
    public static initialize (server: Server) {
        const jsonOptions = new JsonOptions();
        server.app.use(bodyParser.json(jsonOptions));
    }
}
