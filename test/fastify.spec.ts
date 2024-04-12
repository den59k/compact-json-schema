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