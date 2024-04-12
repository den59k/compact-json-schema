import { unfoldSchema } from "./main"
import { SchemaItem } from "./types"

type SchemaName = 'body' | 'params' | 'querystring' | 'headers'

type SchemaInput = { [key in SchemaName ]?: SchemaItem }

export const combineSchema = <T extends SchemaInput>(schemas: T) => {
  return Object.fromEntries(
    Object.entries(schemas).map(([ key, value ]) => [ key, unfoldSchema(value) ])
  ) as { [K in keyof T]: any }
}

export const sc = <T extends SchemaInput>(schemas: T) => {
  return { schema: combineSchema(schemas) }
}
