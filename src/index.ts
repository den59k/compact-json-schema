import type { SchemaItem } from './types'

export { unfoldSchema } from './main'
export { registerAlias } from './aliases'
export { combineSchema, sc } from './fastify'
export type { CompactJsonSchemaProvider } from './fastify'
export type { SchemaType, SchemaItem, SchemaTypesMap, SchemaAnnotations } from './types'

export { provideTypeBoxMap, unfoldTypeBoxSchema } from './typebox'

/**
 * Create schema object
 * @param obj Schema definition
 * @returns Same object
 */
export const schema = <T extends SchemaItem>(obj: T) => obj
