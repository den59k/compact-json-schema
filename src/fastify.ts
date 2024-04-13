import { unfoldSchema } from "./main"
import { SchemaItem } from "./types"

type SchemaName = 'body' | 'params' | 'querystring' | 'headers'

type SchemaInput = { [key in SchemaName ]?: SchemaItem }

export const combineSchema = <T extends SchemaInput>(schemas: T) => {
  return Object.fromEntries(
    Object.entries(schemas).map(([ key, value ]) => [ key, unfoldSchema(value) ])
  ) as { [K in keyof T]: any }
}

export function sc<T extends SchemaInput>(schemas: T): { schema: { [K in keyof T]: any } }
export function sc(params: SchemaItem): { schema: { params: any } }
export function sc<K extends SchemaName | "query">(params: SchemaItem, type: K): { schema: { [ key in K ]: any } }
export function sc(params: SchemaItem | null, body: SchemaItem): { schema: { params: any, body: any } }
export function sc(params: SchemaItem | null, body: SchemaItem | null, querystring: SchemaItem): { schema: { params: any, body: any, querystring: any } }
export function sc(params: SchemaItem, querystring: SchemaItem, type: "querystring" | "query"): { schema: { params: any, querystring: any } }

export function sc(...args: any[]) {
  if (args.length === 1) {
    if (typeof args[0] === "object" && ("body" in args[0] || "params" in args[0] || "querystring" in args[0] || "headers" in args[0] )) {
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
