import { SchemaItem } from "./types"

export const aliases: Record<string, SchemaItem> = {}
export const registerAlias = (key: string, item: SchemaItem) => {
  aliases[key] = item
}