
/*-------------------------------------------------
|          Express allowed methods                |
-------------------------------------------------*/
/**
 * list of allowed to use express methods
 */
export enum HTTP_METHOD {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    HEAD = 'head',
    DELETE = 'delete',
    OPTIONS = 'options',
}

/**
 * list of allowed to use express methods for API endpoints
 */
export enum API_METHOD {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete'
}

/*-------------------------------------------------
|                Annotation TYPES                 |
-------------------------------------------------*/
/**
 * create types using symbol or switch to another creation type using common method
 * @private
 */
function createType (name: string): symbol {
    return Symbol(name);
}
/**
 * Available types for annotation
 */
export const ANNOTATION_TYPE = {
    ENDPOINT: createType('endpoint'),
    SWAGGER: createType('swagger'),
    AUTH: createType('authorization'),
};

