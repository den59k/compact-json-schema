export interface SchemaTypesMap {
  "integer": number,
  "string": string,
  "number": number,
  "boolean": boolean,
  "object": object,
  "array": Array<any>
}

type JsonType = keyof SchemaTypesMap
type JsonOptional = `${JsonType}?`
type NullableJson = `${JsonType}??`

type AllTypes<K extends JsonType> = K | `${K}?` | `${K}??`

export type SmallType = JsonType | JsonOptional | NullableJson

/**
 * Annotation keywords that may accompany any typed schema object without
 * changing the inferred TS type (see SchemaType). They are passed through as-is
 * by unfoldSchema, so e.g. `{ type: "string", default: "x" }` is valid and keeps
 * its runtime default. Kept to the bare minimum (`default` carries real semantic
 * weight); augment this interface via declaration merging to allow more, e.g.
 * `description`, `title`, or domain-specific keywords like `format`.
 */
export interface SchemaAnnotations {
  default?: any
}

export type ObjectType = { type: "object" | "object?" | "object??", properties: ObjectParams } & SchemaAnnotations
export type ArrayType = { type: "array" | "array?" | "array??", items: SchemaItem } & SchemaAnnotations
type StringType = { type: "string" | "string?" | "string??" } & SchemaAnnotations
type StringEnumType = StringType & { enum: string[] }
type ConstType = { const: number | string | boolean } & SchemaAnnotations

type FullType =
  StringType |
  StringEnumType |
  ObjectType |
  ArrayType |
  ({ type: SmallType } & SchemaAnnotations)

export type SchemaItem = SmallType | FullType | ObjectParams | Array<SmallType | FullType | ObjectParams> | Array<string>

type ObjectParams = {
  [ key: string ]: SchemaItem
}

type GetType<T extends SmallType> = 
    T extends `${infer BaseType}??` ? (BaseType extends JsonType? GetBaseType<BaseType> | undefined | null: never) :
    T extends `${infer BaseType }?` ? (BaseType extends JsonType? GetBaseType<BaseType> | undefined: never) :
    GetBaseType<T>;

type GetBaseType<T extends SmallType> = T extends keyof SchemaTypesMap? SchemaTypesMap[T]: T

export type SchemaType<T extends SchemaItem> = 
  T extends ConstType? T["const"]:
  T extends { type: SmallType }? (
    T extends ObjectType? GetObjectType<T["properties"]>:
    T extends ArrayType? Array<SchemaType<T["items"]>>:
    T extends StringEnumType? T["enum"][number]:
    GetType<T["type"]>
  ): 
  T extends Array<SmallType | FullType | ObjectParams>? SchemaType<T[number]>: 
  T extends Array<string>? T[number]:
  T extends ObjectParams? GetObjectType<T>: 
  T extends SmallType? GetType<T>: T

type GetObjectType<T extends ObjectParams> = {
  [ K in keyof T ]: SchemaType<T[K]>
}

// type GetObjectType<T extends ObjectParams> = {
//   [ K in keyof T ]: 
//     T[K] extends NullableJson | { type: NullableJson }? SchemaType<T[K]> | null | undefined: 
//     T[K] extends JsonOptional | { type: JsonOptional }? SchemaType<T[K]> | undefined:
//     SchemaType<T[K]>
// }
