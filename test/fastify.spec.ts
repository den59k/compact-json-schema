import { expect, it } from "vitest";
import { schema } from "../src/main";
import { sc } from "../src/fastify";

it("simple fastify test", async () => {

  const params = schema({ fileId: "string" })
  const body = schema({ name: "string", size: "number?" })

  expect(sc({ params, body })).toEqual({
    schema: {
      params: {
        type: "object",
        properties: {
          fileId: { type: "string" }
        },
        required: [ "fileId" ]
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          size: { type: "number" }
        },
        required: [ "name" ]
      }
    }
  })
})

it("very compact schema", async () => {
  const params = schema({ fileId: "string" })
  expect(sc(params)).toEqual({
    schema: {
      params: {
        type: "object",
        properties: {
          fileId: { type: "string" }
        },
        required: [ "fileId" ]
      }
    }
  })
})

it("very compact schema with params and body", async () => {
  const params = schema({ fileId: "string" })
  const body = schema({ name: "string" })
  expect(sc(params, body)).toEqual({
    schema: {
      params: {
        type: "object",
        properties: {
          fileId: { type: "string" }
        },
        required: [ "fileId" ]
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: [ "name" ]
      }
    }
  })
})

it("very compact schema with params and query", async () => {
  const params = schema({ fileId: "string" })
  const body = schema({ name: "string" })
  expect(sc(params, body, "query")).toEqual({
    schema: {
      params: {
        type: "object",
        properties: {
          fileId: { type: "string" }
        },
        required: [ "fileId" ]
      },
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: [ "name" ]
      }
    }
  })
})

it("very compact schema with body", async () => {
  const body = schema({ name: "string" })
  expect(sc(body, "body")).toEqual({
    schema: {
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: [ "name" ]
      }
    }
  })
})

it("very compact schema with body v2", async () => {
  const body = schema({ name: "string" })
  expect(sc(null, body)).toEqual({
    schema: {
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: [ "name" ]
      }
    }
  })
})