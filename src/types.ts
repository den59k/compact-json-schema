type JsonType = "string" | "boolean" | "number" | "object" | "array"
type JsonOptional = `${JsonType}?`
type NullableJson = `${JsonType}??`

type AllTypes<K extends JsonType> = K | `${K}?` | `${K}??`

export type SmallType = JsonType | JsonOptional | NullableJson

type ObjectType = { type: AllTypes<"object">, props: ObjectParams }
type ArrayType = { type: AllTypes<"array">, items: SchemaItem }
type StringType = { type: AllTypes<"string">, minLength?: number, maxLength?: number }
type StringEnumType = StringType & { enum: string[] }

type FullType = 
  StringType | 
  StringEnumType |
  ObjectType |
  ArrayType |
  { type: SmallType }

export type SchemaItem = SmallType | FullType | ObjectParams

type ObjectParams = {
  [ key: string ]: SchemaItem
}

type GetType<T extends SchemaItem> = 
  T extends AllTypes<"string">? string: 
  T extends AllTypes<"boolean">? boolean: 
  T extends AllTypes<"number">? number: 
  T extends AllTypes<"object">? object: 
  T extends AllTypes<"array">? Array<any>: unknown

export type SchemaType<T extends SchemaItem> = 
  T extends ObjectType? GetObjectType<T["props"]>:
  T extends ArrayType? Array<SchemaType<T["items"]>>:
  T extends StringEnumType? T["enum"][number]:
  T extends FullType? GetType<T["type"]>: 
  T extends ObjectParams? GetObjectType<T>: GetType<T>

type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: any
}

type GetObjectType<T extends ObjectParams> = {
  [ K in KeyOfType<T, { type: JsonOptional } | JsonOptional> ]?: SchemaType<T[K]>
} & {
  [ K in KeyOfType<T, { type: JsonType } | JsonType> ]: SchemaType<T[K]>
} & {
  [ K in KeyOfType<T, { type: NullableJson } | NullableJson> ]?: SchemaType<T[K]> | null
}
