// outsource dependencies
import * as fs from 'fs';
import * as path from 'path';
import * as swagger from 'swagger-ui-express';

// local dependencies
import { Server } from './index';
import Configuration from '../configuration';

export default class SwaggerOptions {
    public readonly customJs: string = Configuration.get('swagger.customJs', null);
    public readonly customCss: string = Configuration.get('swagger.customCss', null);
    public readonly explorer: boolean = Configuration.get('swagger.explorer', false);
    public readonly swaggerUrl: string = Configuration.get('swagger.swaggerUrl', null);
    public readonly customSiteTitle: string = Configuration.get('swagger.customSiteTitle', 'Sajera API');

    public readonly paths: string = Configuration.get('swagger.paths', null);
    public readonly definitions: string = Configuration.get('swagger.definitions', null);
    public readonly info: string = Configuration.get('swagger.info', 'swagger/info.json');

    private constructor () {
        if (Configuration.get('swagger', false) && (
            Configuration.get('swagger.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) { this.log(); }
    }

    public log () {
        const fields = [];
        const hidden = [];
        Object.keys(this).map(key => hidden.indexOf(key) === -1 && fields.push(key));
        console.info('\n---------------- [SWAGGER] ----------------'
            , JSON.stringify(this, fields, 4)
        );
    }

    private static writeLastResults (content: object) {
        if (Configuration.get('swagger', false) && (
            Configuration.get('swagger.log', false)
            || Configuration.get('debug', false)
            || Configuration.getENV('DEBUG', false)
        )) {
            const stringContent = JSON.stringify(content, null, 4);
            fs.writeFile('swagger/last-results.local.json', stringContent, () => '');
        }
    }

    public static initialize (server: Server) {
        const swaggerOptions = new SwaggerOptions();
        // NOTE base information may contain any swagger data
        const content = require(path.join(process.cwd(), swaggerOptions.info));
        // NOTE setup paths it should present in configuration
        content.paths = !swaggerOptions.paths ? {}
            : require(path.join(process.cwd(), swaggerOptions.paths));
        // NOTE setup definition it should present in configuration
        content.definitions = !swaggerOptions.definitions ? {}
            : require(path.join(process.cwd(), swaggerOptions.definitions));
        // NOTE write swagger result to the file to simplify development
        this.writeLastResults(content);
        // NOTE setup swagger
        server.app.use('/swagger', swagger.serve, swagger.setup(content, swaggerOptions));
    }
}
