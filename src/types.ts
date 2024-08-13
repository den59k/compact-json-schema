type JsonType = "string" | "boolean" | "number" | "integer" | "object" | "array"
type JsonOptional = `${JsonType}?`
type NullableJson = `${JsonType}??`

type AllTypes<K extends JsonType> = K | `${K}?` | `${K}??`

export type SmallType = JsonType | JsonOptional | NullableJson

type ObjectType = { type: AllTypes<"object">, props: ObjectParams }
type ArrayType = { type: AllTypes<"array">, items: SchemaItem }
type StringType = { type: AllTypes<"string">, minLength?: number, maxLength?: number }
type StringEnumType = StringType & { enum: string[] }
type ConstType = { const: number | string | boolean }

type FullType = 
  StringType | 
  StringEnumType |
  ObjectType |
  ArrayType |
  { type: SmallType }

export type SchemaItem = SmallType | FullType | ObjectParams | Array<SmallType | FullType | ObjectParams> | Array<string>

type ObjectParams = {
  [ key: string ]: SchemaItem
}

type GetType<T extends SchemaItem> = 
  T extends "string"? string: 
  T extends "string?"? string | undefined: 
  T extends "string??"? string | null | undefined: 
  T extends "number" | "integer"? number: 
  T extends "number?" | "integer?"? number | undefined: 
  T extends "number??" | "integer??"? number | null | undefined: 
  T extends "boolean"? boolean: 
  T extends "boolean?"? boolean | undefined: 
  T extends "boolean??"? boolean | null | undefined: 
  T extends "object"? object: 
  T extends "object?"? object | undefined: 
  T extends "object??"? object | null | undefined: 
  T extends "array"? Array<any>:
  T extends "array?"? Array<any> | undefined:
  T extends "array??"? Array<any> | null | undefined:
  T

export type SchemaType<T extends SchemaItem> = 
  T extends ConstType? T["const"]:
  T extends ObjectType? GetObjectType<T["props"]>:
  T extends ArrayType? Array<SchemaType<T["items"]>>:
  T extends StringEnumType? T["enum"][number]:
  T extends FullType? GetType<T["type"]>: 
  T extends Array<SmallType | FullType | ObjectParams>? SchemaType<T[number]>: 
  T extends Array<string>? T[number]:
  T extends ObjectParams? GetObjectType<T>: 
  GetType<T>

type GetObjectType<T extends ObjectParams> = {
  [ K in keyof T ]: SchemaType<T[K]>
}

// type GetObjectType<T extends ObjectParams> = {
//   [ K in keyof T ]: 
//     T[K] extends NullableJson | { type: NullableJson }? SchemaType<T[K]> | null | undefined: 
//     T[K] extends JsonOptional | { type: JsonOptional }? SchemaType<T[K]> | undefined:
//     SchemaType<T[K]>
// }
