import { aliases } from "./aliases";
import { SchemaItem } from "./types";
import { isBaseType, trimType, parseObjectFields } from "./utils";

const unfoldArray = (schema: SchemaItem[] | string[]): any => {
  // It is enum if all values is string, and do not match the base types
  const isEnum = schema.every(item => typeof item === "string") && schema.some(item => !isBaseType(item as string))
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
    const trimmedType = trimType(type)

    if (trimmedType === "array" && items) {
      return {
        type: "array",
        nullable: type.endsWith("??")? true: undefined,
        ...otherProps,
        items: unfoldSchema(items)
      }
    }

    if (trimmedType === "object" && properties) {
      return {
        type: "object",
        nullable: type.endsWith("??")? true: undefined,
        ...otherProps,
        ...parseObjectFields(properties, unfoldSchema)
      }
    }

    return {
      ...unfoldSchema(type),
      ...otherProps
    }
  }

  return {
    type: "object",
    ...parseObjectFields(schema, unfoldSchema)
  }
}
