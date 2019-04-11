
/**
 * Dummy for implementation permission check
 */
export interface Permission {
    // NOTE without final implementation - define only idea
    any?: any;
}

/**
 * Authorization addition data annotation restriction
 */
export interface AuthAnnotation {
    permissions?: Permission;
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
