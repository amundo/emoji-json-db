const sources = {
  "unicode": "sources/unicode.org/unicode-org-emoji-test.json",
  "gemoji": "sources/gemoji/gemoji.json",
  "cldr": "sources/cldr/cldr-annotations.json",
}

const readSources = async () => {
  const sourceData = {}
  for await (const [source, path] of Object.entries(sources)) {
    const json = Deno.readTextFileSync(path)
    const data = JSON.parse(json)
    sourceData[source] = data
  }
  return sourceData
}

const sourceData = await readSources()

const trimEmoji = (emoji) => {
  const fields = ["unicodeVersion", "sources", "description", "ios_version"]

  for (const field of fields) {
    delete emoji[field]
  }

  return emoji
}

// Function to filter unnecessary emojis
const shouldIncludeEmoji = (emoji) => {
  if (emoji.group === "Component" || emoji.subgroup === "skin-tone") {
    return false
  }
  if (emoji.status === "component") return false
  if (emoji.status && emoji.status !== "fully-qualified") return false
  if (emoji.emoji.includes("\u200D")) return false // Exclude ZWJ sequences
  return true
}

// Merge fields across multiple sources for the same emoji
const mergeEmojiFields = (emojisGroup) => {
  return emojisGroup.reduce((merged, emoji) => {
    return {
      ...merged,
      ...emoji, // Merge fields
      sources: Array.from(
        new Set([...(merged.sources || []), ...(emoji.sources || [])]),
      ), // Combine sources
    }
  }, {})
}

// Deduplicate emojis by their base representation
const deduplicateEmojis = (emojis) => {
  const groupedEmojis = Object.groupBy(emojis, (emoji) => emoji.emoji)
  return Object.values(groupedEmojis).map(mergeEmojiFields)
}

// Process and filter emojis
const emojis = Object.entries(sourceData).reduce((emojis, [source, data]) => {
  data.forEach((emoji) => {
    emoji.sources = [source]
  })
  emojis.push(...data.filter(shouldIncludeEmoji))
  return emojis
}, [])

// Deduplicate emojis and merge fields
const uniqueEmojis = deduplicateEmojis(emojis)

const simplifiedEmojis = uniqueEmojis.map((emoji) => trimEmoji(emoji))

// Metadata for the final JSON file
const metadata = {
    "sources": [
      "unicode",
      "gemoji",
      "cldr"
    ],
    "description": "A simple emoji database with tags and other useful information",
    "github": "https://github.com/amundo/emoji-json-db",
    "fields": [
      {
        "name": "emoji",
        "type": "String",
        "description": "The emoji character"
      },
      {
        "name": "unicodeVersion",
        "type": "String",
        "description": "The Unicode version when the emoji was added"
      },
      {
        "name": "name",
        "type": "String",
        "description": "The name of the emoji"
      },
      {
        "name": "group",
        "type": "String",
        "description": "The group of the emoji"
      },
      {
        "name": "subgroup",
        "type": "String",
        "description": "The subgroup of the emoji"
      },
      {
        "name": "sources",
        "type": "Array",
        "description": "The sources of the emoji"
      }
    ],
    "lastModified": "2024-12-29T01:20:52.525Z"
  }


// Combine metadata and emojis into a final JSON object
const emojiDb = {
  metadata,
  emojis: simplifiedEmojis,
}

// Save the reduced dataset
Deno.writeTextFileSync("emoji-db.json", JSON.stringify(emojiDb, null, 2))

console.log("Write file: emoji-db.json\n")

