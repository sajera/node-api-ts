
/**
 * Swagger addition data annotation restriction
 */
export interface SwaggerAnnotation {
  description?: string;
  operationId?: string;
  summary?: string;
  tags?: string[]
  consumes?: string[]
  produces?: string[]
  parameters?: Array<any> // TODO define schema
  responses?: Partial<any> // TODO define schema
}

/**
 * Swagger addition data annotation restriction
 */
export interface SwaggerEndpoint extends SwaggerAnnotation {
  any?: any;
}
