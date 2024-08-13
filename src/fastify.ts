import { unfoldSchema } from "./main"
import { SchemaItem, SchemaType } from "./types"
import type { FastifyTypeProvider } from 'fastify'

type SchemaName = 'body' | 'params' | 'querystring' | 'headers'
const schemaNames = [ "body", "params", "querystring", "headers" ]

type SchemaInput = { [key in SchemaName ]?: SchemaItem }

export const combineSchema = <T extends SchemaInput>(schemas: T) => {
  return Object.fromEntries(
    Object.entries(schemas).map(([ key, value ]) => [ key, unfoldSchema(value) ])
  ) as { [K in keyof T]: any }
}

export function sc<P extends SchemaInput>(schema: P): { schema: P }
export function sc<P extends SchemaItem>(params: P): { schema: { params: P } }
export function sc<P extends SchemaItem, K extends SchemaName>(params: P, type: K): { schema: { [ key in K ]: P } }
export function sc<P extends SchemaItem, P2 extends SchemaItem>(params: P, body: P2): { schema: { params: P, body: P2 } }

export function sc<P extends SchemaItem, P2 extends SchemaItem>(params: SchemaItem, querystring: SchemaItem, type: "query"): 
  { schema: { params: P, querystring: P2 } }

export function sc(...args: any[]) {

  if (args.length === 1 && typeof args[0] === "object") {
    const hasOnlySchemaNames = Object.keys(args[0]).reduce((res, item) => res && schemaNames.includes(item), true)
    if (hasOnlySchemaNames) {
      return { schema: combineSchema(args[0]) }
    }
  }

  const lastType = typeof args[args.length-1] === "string"? args[args.length-1]: null
  const keys = [ "params", "body", "querystring" ].slice(0, args.length-(lastType? 2: 0))
  if (lastType) {
    keys.push(lastType === "query"? "querystring": lastType)
  }

  return { 
    schema: Object.fromEntries(
      keys.map((key, index) => [ key, args[index] === null? null: unfoldSchema(args[index]) ]).filter(entry => entry[1] !== null)
    )
  }
}

export interface CompactJsonSchemaProvider extends FastifyTypeProvider {
  output: this['input'] extends SchemaItem? SchemaType<this['input']>: any,
}
