import { SchemaItem, SmallType } from "./types"

const baseTypes = [ "string", "boolean", "number", "integer", "bigint", "object", "array" ] as const
export const isBaseType = (key: string) => {
  return baseTypes.some(item => item === key || item+"?" === key || item+"??" === key)
}

export type BaseType = typeof baseTypes[number]

export const trimType = (type: SmallType) => {
  if (type.endsWith("??")) return type.slice(0, -2)
  if (type.endsWith("?")) return type.slice(0, -1)
  return type
}


export const parseObjectFields = (props: { [ key: string ]: SchemaItem }, unfoldSchema: any) => {
  
  const required: string[] = []
  const properties: { [ key: string ]: any } = {}
  for (let [key, value] of Object.entries(props)) {
    if (Array.isArray(value)) {
      required.push(key)
    } else if (typeof value === "object") {
      if (typeof value.type !== "string" || !value.type.endsWith("?")) {
        required.push(key)
      }
    } else if (typeof value === "string") {
      if (!value.endsWith("?")) {
        required.push(key)
      }
    }

    properties[key] = unfoldSchema(value)
  }

  return {
    properties,
    required
  }
}