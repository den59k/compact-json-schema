import { expect, it } from 'vitest'
import { unfoldSchema } from '../src/main'

it("test string schema", () => {
  const string = unfoldSchema("string")
  expect(string).toEqual({
    type: "string"
  })
})

it("test string schema with params", () => {
  const string = unfoldSchema({ type: "string", minLength: 1, maxLength: 5 })
  expect(string).toEqual({
    type: "string",
    minLength: 1,
    maxLength: 5
  })
})

it("test string schema with enum", () => {
  const string = unfoldSchema({ type: "string", enum: [ "test", "test2" ] })
  expect(string).toEqual({
    type: "string",
    enum: [ "test", "test2" ]
  })
})

it("test boolean schema", () => {
  const boolean = unfoldSchema("boolean")
  expect(boolean).toEqual({
    type: "boolean"
  })
})

it("test number schema", () => {
  const number = unfoldSchema("number")
  expect(number).toEqual({
    type: "number"
  })
})

it("test object schema", () => {
  const object = unfoldSchema({ name: "string" })
  expect(object).toEqual({
    type: "object",
    required: [ "name" ],
    properties: {
      name: {
        type: "string"
      }
    }
  })
})

it("test array schema", () => {
  const arr = unfoldSchema({ type: "array", items: { name: "string" } })
  expect(arr).toEqual({
    type: "array",
    items: {
      type: "object",
      required: [ "name" ],
      properties: {
        name: {
          type: "string"
        }
      }
    }
  })
})

it("test anyOf items", () => {
  const schema = unfoldSchema({ name: [ "string", "integer" ] })
  expect(schema).toEqual({
    type: "object",
    properties: {
      name: {
        oneOf: [
          { type: "string" },
          { type: "integer" }
        ]
      }
    },
    required: [ "name" ]
  })
})

it("test enum", () => {
  const schema = unfoldSchema({ name: [ "name", "surname" ] })
  expect(schema).toEqual({
    type: "object",
    properties: {
      name: { type: "string", enum: [ "name", "surname" ]}
    },
    required: [ "name" ]
  })
})