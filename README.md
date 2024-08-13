# Compact JSON Schema

Write less code without losing functionality. Full type support is also included in flight ✈️

```
import { unfoldSchema } from 'compact-json-schema'

const schema = unfoldSchema({ name: "string", surname: "string?" })
```

Converts to 
```
{
  type: "object",
  properties: {
    name: {
      type: "string"
    },
    surname: {
      type: "string"
    }
  },
  required: [ "name" ]
}
```

## Using

There are 5 basic types, which are typed as a relevant string:

```
"string" | "boolean" | "number" | "integer" | "object" | "array"
```

Each type can also be undefined or nullable:

```
"string?"    // Undefined type
"string??"   // Nullable or undefined type
```

You have two ways to write the schema, full or shorthand:

```ts
const fullSchema = schema({ name: { type: "string" } })
const shortSchema = schema({ name: "string" })
// fullSchema is equal to shortSchema
```

The schema for objects can also be written in two ways:
```ts
const fullSchema = schema({ user: { type: "object", props: { name: "string" } } })
const shortSchema = schema({ user: { name: "string" } })
// fullSchema is equal to shortSchema
```

As you can guess, the full path also allows you to specify the necessary settings for validation, while the short path just uses the defaults.

## Compact form for union types

You can use array of items for shorthand enum or oneOf types:

```ts
const body = schema({ name: [ "file" ], filename: "string" })
const body2 = schema({ name: [ "image" ], size: "number" })

const schema = unfoldSchema([ body, body2 ])
```

Schema converts to
```ts
{
  oneOf: [
    {
      type: "object",
      properties: { 
        name: { type: "string",  const: "file" },
        filename: { type: "string" }
      },
      required: [ "name", "filename" ]
    },
    {
      type: "object",
      properties: { 
        name: { type: "string",  const: "image" },
        size: { type: "number" }
      },
      required: [ "name", "size" ]
    }
  ]
}
```

## What's up with the types?

Example fastify:

```ts
import { schema, sc, SchemaType } from 'compact-json-schema'

const params = schema({ itemId: "number" })
const body = schema({ name: "string", surname: "string?", features: { type: "array", items: "string" } })

fastify.post("/user/:userId", { schema: { params, body } }, async (req) => {
  const { userId } = req.params as SchemaType<typeof params>      // typeof userId === "number"
  const userData = req.body as SchemaType<typeof body>  
  /*
    userData: {
      name: string
      surname: string | undefined
      features: Array<string>
    }
  */
})

```

## About fastify integration

Since this library was intended more for use with the fastify framework, this package has a sc utility that allows you to abbreviate writing `{ schema: { params ... } } in your endpoints.

It works a little tricky, allowing you to write a minimum of code. It is based on the fact that in most cases schemas are needed for "params" and for "body". If you want to change a key, pass it as the last argument to `sc`.

It is applied as follows:

```ts
sc(schema({ userId: "number" })) -> { schema: { params: { type: "object", properties: { userId: { type: "number" } } } }}

sc(schema({ userId: "number" }, "query")) -> { schema: { querystring: { type: "object", properties: { userId: { type: "number" } } } }}

sc(schema({ userId: "number" }, { age: "number" })) -> { 
  schema: { 
    params: { type: "object", properties: { userId: { type: "number" } } },
    body: { type: "object", properties: { age: { type: "number" } } },
  }
}

sc(schema({ userId: "number" }, { age: "number" }), "query") -> { 
  schema: { 
    params: { type: "object", properties: { userId: { type: "number" } } },
    querystring: { type: "object", properties: { age: { type: "number" } } },
  }
}
```

## Fastify Type Provider

Fastify also gives you the option of specifying a TypeProvider so that the schema is applied automatically:

```ts
import { schema, sc, SchemaType, CompactJsonSchemaProvider } from 'compact-json-schema'

const params = schema({ itemId: "number" })
const body = schema({ name: "string", surname: "string?", features: { type: "array", items: "string" } })

const app = fastify().withTypeProvider<CompactJsonSchemaProvider>()

app.post("/user/:userId", sc({ params, body }), async (req) => {
  const { userId } = req.params         // typeof userId === "number"
  const userData = req.body
  /*
    userData: {
      name: string
      surname: string | undefined
      features: Array<string>
    }
  */
})

```