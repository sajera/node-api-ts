// outsource dependencies
import * as bodyParser from 'body-parser';

// local dependencies
import { Server } from './index';
import Configuration from '../configuration';


export default class UrlencodedOptions {
    public readonly limit: number | string = Configuration.get('urlencodedParse.limit', '100kb');
    public readonly inflate: boolean = Boolean(Configuration.get('urlencodedParse.inflate', true));
    public readonly extended: boolean = Boolean(Configuration.get('urlencodedParse.extended', true));
    public readonly parameterLimit: number = Configuration.get('urlencodedParse.parameterLimit', 1000);
    public readonly type: string | string[] = Configuration.get('urlencodedParse.type', [
        'application/x-www-form-urlencoded', '*/x-www-form-urlencoded'
    ]);
    private constructor () {
        if (Configuration.get('urlencodedParse', false) && (
            Configuration.get('urlencodedParse.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) { this.log(); }
    }

    public log () {
        const fields = [];
        const hidden = [];
        Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
        console.info('\n----------- [BODY:URLENCODED] -----------'
            , JSON.stringify(this, fields, 4)
        );
    }
    
    public static initialize (server: Server) {
        const urlencodedOptions = new UrlencodedOptions();
        server.app.use(bodyParser.urlencoded(urlencodedOptions));
    }
}
