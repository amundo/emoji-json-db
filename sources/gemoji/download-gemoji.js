// URL for the gemoji reference file
const EMOJI_REFERENCE_URL =
  "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json" // Using GitHub Gemoji as a reference

// Function to fetch and parse the emoji reference file
async function fetchEmojiReference() {
  try {
    const response = await fetch(EMOJI_REFERENCE_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch emoji reference: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching emoji reference:", error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log("Fetching emoji reference...")
    const emojis = await fetchEmojiReference()
    console.log("Emoji reference fetched successfully")

    await Deno.writeTextFile("gemoji.json", JSON.stringify(emojis, null, 2))
  } catch (error) {
    console.error("Process failed:", error)
  }
}

// Execute the main function
main()
