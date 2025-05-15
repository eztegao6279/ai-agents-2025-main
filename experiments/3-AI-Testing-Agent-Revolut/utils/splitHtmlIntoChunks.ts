import { parse, serialize } from "parse5";
import fs from "fs";
// const CHUNK_SIZE = 8000; // Adjust based on LLM token limit
const CHUNK_SIZE = 20 * 8000; // Adjusted based on GPT-4o's token limit

function cleanHtml(html: string): string {
  return html
    .replace(/\s+/g, " ") // Reduce multiple spaces to a single space
    .replace(/<!--.*?-->/gs, "") // Remove HTML comments
    .replace(/\n/g, " ") // Remove newlines
    .trim();
}

export function splitHtmlIntoChunks(
  html: string,
  chunkSize: number = CHUNK_SIZE
): string[] {
  const document = parse(html);
  const serializedHtml = serialize(document);

  // Remove unnecessary whitespace and comments manually (without using html-minifier-terser)
  const cleanedHtml = cleanHtml(serializedHtml);

  const chunks: string[] = [];
  let currentChunk = "";

  // Regex to avoid breaking HTML tags
  const regex = /<\s*\w+(?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+)))*\s*$/;

  for (let i = 0; i < cleanedHtml.length; i += chunkSize) {
    let chunk = cleanedHtml.slice(i, i + chunkSize);

    // Ensure we don't break an HTML tag
    const lastTag = chunk.match(regex);
    if (lastTag) {
      const remainder = cleanedHtml.slice(i + chunkSize);
      chunk += remainder.slice(0, remainder.indexOf(">") + 1);
    }

    chunks.push(chunk);
  }

  // Wrap each chunk to ensure proper HTML structure
  return chunks.map((chunk) => `<html><body>${chunk}</body></html>`);
}
