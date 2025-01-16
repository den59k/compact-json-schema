import { SchemaItem, SmallType } from "./types";

const baseTypes = [ "string", "boolean", "number", "integer", "object", "array" ]
const isBaseType = (key: string) => {
  return !!baseTypes.find(item => item === key || item+"?" === key || item+"??" === key)
}

export const schema = <T extends SchemaItem>(obj: T) => obj

const trimType = (type: SmallType) => {
  if (type.endsWith("??")) return type.slice(0, -2)
  if (type.endsWith("?")) return type.slice(0, -1)
  return type
}

const aliases: Record<string, SchemaItem> = {}
export const registerAlias = (key: string, item: SchemaItem) => {
  aliases[key] = item
}

const parseObjectFields = (props: { [ key: string ]: SchemaItem }) => {
  
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

const unfoldArray = (schema: SchemaItem[] | string[]): any => {
  // It is enum if all values is string, and do not match the base types
  const isEnum = !schema.find(item => typeof item !== "string") && schema.find(item => !isBaseType(item as string))
  if (isEnum) {
    if (schema.length === 1) {
      return { type: "string", const: schema[0] }
    } else {
      return { type: "string", enum: schema }
    }
  } else {
    return {
      oneOf: schema.map((item: any) => unfoldSchema(item))
    }
  }
}

export const unfoldSchema = <T extends SchemaItem>(schema: T): any => {

  if (typeof schema === "string") {
    const trimmedType = trimType(schema)

    if (trimmedType in aliases) {
      if (schema.endsWith("??")) {
        return { ...unfoldSchema(aliases[trimmedType]), nullable: true }
      }
      return unfoldSchema(aliases[trimmedType])
    }

    if (schema.endsWith("??")) {
      return { type: trimmedType, nullable: true }
    }
    return { type: trimmedType }
  }

  if (Array.isArray(schema)) {
    return unfoldArray(schema)
  }

  if (typeof schema !== "object" || schema === null) {
    throw new Error(`Schema type ${schema} is not object`)
  }

  if (typeof schema.type === "string") {
    const { items, properties, type, ...otherProps } = schema as any 

    return {
      ...unfoldSchema(type),
      ...otherProps,
      items: items? unfoldSchema(items): undefined,
      ...(properties? parseObjectFields(properties): {})
    }
  }

  return {
    type: "object",
    ...parseObjectFields(schema)
  }
}
