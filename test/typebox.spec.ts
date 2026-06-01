import { beforeEach, expect, it } from 'vitest'
import { registerAlias, unfoldSchema } from '../src'
import { provideTypeBoxMap, unfoldTypeBoxSchema } from '../src/typebox'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

beforeEach(() => {
  provideTypeBoxMap({
    string: Type.String,
    boolean: Type.Boolean,
    number: Type.Number,
    integer: Type.Integer,
    object: Type.Object,
    array: Type.Array,
    bigint: Type.BigInt,
    union: Type.Union,
    null: Type.Null,
    literal: Type.Literal,
    optional: Type.Optional,
    any: Type.Any
  })
})

it("test string schema", () => {
  const string = unfoldTypeBoxSchema("string")
  expect(string).toEqual(Type.String())
})

it("test string schema with params", () => {
  const string = unfoldTypeBoxSchema({ type: "string", minLength: 1, maxLength: 5 })
  expect(string).toEqual(Type.String({ minLength: 1, maxLength: 5 }))
})

it("test string schema with enum", () => {
  const string = unfoldTypeBoxSchema({ type: "string", enum: [ "test", "test2" ] })
  expect(string).toEqual(Type.Union([Type.Literal("test"), Type.Literal("test2")]))
})

it("test boolean schema", () => {
  const boolean = unfoldTypeBoxSchema("boolean")
  expect(boolean).toEqual(Type.Boolean())
})

it("test number schema", () => {
  const number = unfoldTypeBoxSchema("number")
  expect(number).toEqual(Type.Number())
})

it("test object schema", () => {
  const object = unfoldTypeBoxSchema({ name: "string" })
  expect(object).toEqual(Type.Object({
    name: Type.String()
  }))
})

it("test nested object schema", () => {
  const object = unfoldTypeBoxSchema({ name: "string", obj: { type: "object?" }, nullable: { type: "object??", properties: {} } })
  expect(object).toEqual(Type.Object({
    name: Type.String(),
    obj: Type.Optional(Type.Object({})),
    nullable: Type.Optional(Type.Union([ Type.Object({}), Type.Null() ]))
  }))
})

it("test array schema", () => {
  const arr = unfoldTypeBoxSchema({ type: "array", items: { name: "string" } })
  expect(arr).toEqual(Type.Array(
    Type.Object({
      name: Type.String()
    })
  ))
})


it("test array schema2", () => {
  const arr = unfoldTypeBoxSchema({ type: "array", items: {} })

  const _compiled = TypeCompiler.Compile(arr)
  expect(_compiled).not.toBeNull()

  expect(arr).toEqual(Type.Array(
    Type.Object({})
  ))
})


it("test anyOf items", () => {
  const schema = unfoldTypeBoxSchema({ name: [ "string", "number" ] })
  expect(schema).toEqual(Type.Object({
    name: Type.Union([Type.String(), Type.Number()])
  }))
})

it("test enum", () => {
  const schema = unfoldTypeBoxSchema({ name: [ "name", "surname" ] })
  expect(schema).toEqual(Type.Object({
    name: Type.Union([Type.Literal("name"), Type.Literal("surname")])
  }))
})

it("test alias", () => {
  registerAlias("file", { src: "string" })
  const schema = unfoldTypeBoxSchema({ file: { type: "file?" } } as any)
  expect(schema).toEqual(Type.Object({
    file: Type.Optional(Type.Object({
      src: Type.String()
    }))
  }))
})

it("optional", () => {
  const schema = unfoldTypeBoxSchema({ name: { type: "string?" } } as any)
  expect(schema).toEqual(Type.Object({
    name: Type.Optional(Type.String())
  }))
})
it.only("optional2", () => {
  const schema = unfoldTypeBoxSchema(unfoldSchema({ name: { type: "string?" } } as any))
  expect(schema).toEqual(Type.Object({
    name: Type.Optional(Type.String())
  }))
})
it("test nullable", () => {
  const schema = unfoldTypeBoxSchema({ name: { type: "string??" } } as any)
  expect(schema).toEqual(Type.Object({
    name: Type.Optional(Type.Union([Type.String(), Type.Null() ]))
  }))
})
it("test nullable2", () => {
  const schema = unfoldTypeBoxSchema(unfoldSchema({ name: { type: "string??" } } as any))
  expect(schema).toEqual(Type.Object({
    name: Type.Optional(Type.Union([Type.String(), Type.Null() ]))
  }))
})