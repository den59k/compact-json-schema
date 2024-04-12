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