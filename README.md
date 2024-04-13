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
"string" | "boolean" | "number" | "object" | "array"
```

Each type can also be undefined or nullable:

```
"string?"    // Undefined type
"string??"   // Nullable or undefined type
```

You have two ways to write the schema, full or shorthand:

```
const fullSchema = schema({ name: { type: "string" } })
const shortSchema = schema({ name: "string" })
// fullSchema is equal to shortSchema
```

The schema for objects can also be written in two ways:
```
const fullSchema = schema({ user: { type: "object", props: { name: "string" } } })
const shortSchema = schema({ user: { name: "string" } })
// fullSchema is equal to shortSchema
```

As you can guess, the full path also allows you to specify the necessary settings for validation, while the short path just uses the defaults.

## What's up with the types?

Example fastify:

```
import { schema, sc, SchemaType } from 'compact-json-schema'

const params = schema({ itemId: "number" })
const body = schema({ name: "string", surname: "string?", features: { type: "array", items: "string" } })

fastify.post("/user/:userId", sc({ params, body }), async (req) => {
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