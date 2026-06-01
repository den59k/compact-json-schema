import { BaseType, isBaseType, parseObjectFields, trimType } from './utils'
import { aliases } from './aliases'
import { SchemaItem } from './types'

type TypeMap = Record<BaseType | "union" | "null" | "literal" | "optional" | "any", any>
let typeMap: TypeMap = {} as any

export const provideTypeBoxMap = (map: TypeMap) => {
  typeMap = map
}

const unfoldArray = (schema: SchemaItem[] | string[]): any => {
  // It is enum if all values are strings and don't match base types
  const isEnum = schema.every(item => typeof item === "string") && schema.some(item => !isBaseType(item as string))

  if (isEnum) {
    if (schema.length === 1) {
      return typeMap["literal"](schema[0])
    } else {
      return typeMap["union"](schema.map(str => typeMap["literal"](str)))
    }
  } else {
    return typeMap["union"](schema.map(item => unfoldTypeBoxSchema(item as SchemaItem)))
  }
}

const wrapNull = (obj: any, isNullable: boolean) => {
  if (isNullable) {
    return typeMap["optional"](typeMap["union"]([ obj, typeMap["null"]() ]))
  } else {
    return obj
  }
}

export const unfoldTypeBoxSchema = <T extends SchemaItem>(schema: T, options?: any): any => {
  if (typeof schema === "string") {
    const trimmedType = trimType(schema)

    if (trimmedType in aliases) {
      const aliasSchema = unfoldTypeBoxSchema(aliases[trimmedType])
      return wrapNull(aliasSchema, schema.endsWith("??"))
    }

    const baseSchema = typeMap[trimmedType as BaseType](options)
    return wrapNull(baseSchema, schema.endsWith("??"))
  }

  if (Array.isArray(schema)) {
    return unfoldArray(schema)
  }

  if (typeof schema !== "object" || schema === null) {
    throw new Error(`Schema type ${schema} is not object`)
  }

  if (typeof schema.type === "string") {
    const isNullable = (schema as any).nullable || schema.type.endsWith("??")
    const trimmedType = trimType(schema.type)
    if (trimmedType === "array" && "items" in schema) {
      const { type, items, ...otherProps } = schema

      return wrapNull(typeMap['array'](unfoldTypeBoxSchema(items), otherProps), isNullable)
    } else if (trimmedType === "object" && "properties" in schema) {
      const { type, properties, ...otherProps } = schema
      const { properties: parsedProps, required } = parseObjectFields((properties as any), unfoldTypeBoxSchema)

      for (let key in parsedProps) {
        if (!required.includes(key)) {
          parsedProps[key] = typeMap["optional"](parsedProps[key])
        }
      }

      return wrapNull(typeMap['object'](parsedProps, otherProps), isNullable)
    } else if (trimmedType === "string" && "enum" in schema) {
      const { type, enum: _enum , ...otherProps } = schema
      const arr = (_enum as string[]).map(str => typeMap["literal"](str))
      if (isNullable) {
        arr.push(typeMap["null"])
      }
      return typeMap["union"](arr, otherProps)
    } else {
      const { type, ...otherProps } = schema
      return unfoldTypeBoxSchema(schema.type, otherProps)
    }
  }

  const { properties, required } = parseObjectFields(schema, unfoldTypeBoxSchema)

  for (let key in properties) {
    if (!required.includes(key)) {
      properties[key] = typeMap["optional"](properties[key])
    }
  }

  return typeMap['object'](properties)
}
