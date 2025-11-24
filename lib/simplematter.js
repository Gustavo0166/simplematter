import { parse as toml } from 'smol-toml'
import { parse as yaml } from 'yaml'

/**
 * @typedef simplematter.Parsers
 * @property {((frontmatter: string) => unknown) | undefined} [toml]
 *   A parser for TOML content. This is used to parse content from the `+++` fence. By default the
 *   [`yaml`](https://eemeli.org/yaml/) package is used.
 * @property {((frontmatter: string) => unknown) | undefined} [yaml]
 *   A parser for YAML content. This is used to parse content from the `---` fence. By default the
 *   [`smol-toml`](https://github.com/squirrelchat/smol-toml) package is used.
 */

const nonWhitespaceRegex = /\S/

/**
 * Check whether the content from a line starting at an index is trailing space.
 *
 * @param {string} content
 *   The content whose characters to check.
 * @param {number} start
 *   The start index of the characters to check.
 * @returns {number}
 *   The index of the newline character that ends the line whitespace, -1 otherwise.
 */
function findTrailingSpaceEnd(content, start) {
  for (let index = start; index < content.length; index += 1) {
    const char = content[index]

    if (char === '\n') {
      return index
    }

    if (nonWhitespaceRegex.test(char)) {
      return -1
    }
  }

  // The fence is the end of the document. There’s no trailing newline.
  return content.length
}

/** @type {Required<simplematter.Parsers>} */
const defaultParsers = {
  toml,
  yaml
}

/**
 * Parse frontmatter data.
 *
 * @param {string} content
 *   The string from which to parse frontmatter data.
 * @param {simplematter.Parsers | undefined} [parsers]
 *   The parsers to use.
 * @returns {[data: unknown, document: string]}
 *   A tuple which consists of the parsed frontmatter data and the rest of the document.
 */
export function simplematter(content, parsers) {
  const openFence = content.slice(0, 3)
  const openSpaceEnd = findTrailingSpaceEnd(content, 3)
  let closeFenceStart = openSpaceEnd + 1

  /** @type {number} */
  let closeSpaceEnd

  if (openSpaceEnd === -1 || (openFence !== '---' && openFence !== '+++')) {
    return [undefined, content]
  }

  do {
    closeFenceStart = content.indexOf(openFence, closeFenceStart + 3)

    // We’ve reached the end of the content, but we didn’t find a closing fence.
    if (closeFenceStart === -1) {
      return [undefined, content]
    }

    closeSpaceEnd = findTrailingSpaceEnd(content, closeFenceStart + 3)
  } while (closeSpaceEnd === -1 || content[closeFenceStart - 1] !== '\n')

  const key = openFence === '+++' ? 'toml' : 'yaml'
  const parser = parsers?.[key] || defaultParsers[key]

  return [
    parser(content.slice(openSpaceEnd + 1, closeFenceStart)),
    content.slice(closeSpaceEnd).trimStart()
  ]
}
