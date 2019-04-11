
/**
 * Authorization addition data annotation restriction
 */
export interface AuthAnnotation {
    // NOTE without final implementation - define only idea
    permissions?: any;
    self?: boolean;
    any?: any;
}

/**
 * Authorization addition for endpoints
 */
export interface AuthEndpoint extends AuthAnnotation {
    // NOTE without final implementation - define only idea
    any?: any;
}
