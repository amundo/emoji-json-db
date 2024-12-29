const fetchCldrEmojiAnnotations = async (locale = "en") => {
  const url =
    `https://raw.githubusercontent.com/unicode-org/cldr-json/refs/heads/main/cldr-json/cldr-annotations-full/annotations/${locale}/annotations.json`
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const emojiAnnotations = await fetchCldrEmojiAnnotations()

// the content looks like:

/*
{
  "annotations": {
    "identity": {
      "language": "en"
    },
    "annotations": {
      "🐫": {
        "default": [
          "animal",
          "bactrian",
          "camel",
          "desert",
          "hump",
          "two",
          "two-hump"
        ],
        "tts": [
          "two-hump camel"
        ]
      },

      …
}

We want:

{ emoji: "🐫", name:"two-hump camel", "tags": [ "animal", "bactrian", … ] }
*/

const annotationsData = JSON.parse(
  JSON.stringify(emojiAnnotations)
    .replaceAll(`"default"`, '"tags"')
    .replaceAll(`"tts"`, '"names"'),
)

const transformCldrEmojiAnnotations = (annotationsData) => {
  const { annotations } = annotationsData.annotations //nested like this for some reason

  let emojis = Object.entries(annotations)
    .map(([emoji, { names, tags }]) => ({ emoji, name: names[0], tags }))

  return emojis
}

const emojisWithTagsAndName = transformCldrEmojiAnnotations(annotationsData)

await Deno.writeTextFile(
  "cldr-annotations.json",
  JSON.stringify(emojisWithTagsAndName, null, 2),
)
