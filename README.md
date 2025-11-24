# simplematter

[![github actions](https://github.com/remcohaszing/simplematter/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/simplematter/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/remcohaszing/simplematter/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/simplematter)
[![npm version](https://img.shields.io/npm/v/simplematter)](https://www.npmjs.com/package/simplematter)
[![npm downloads](https://img.shields.io/npm/dm/simplematter)](https://www.npmjs.com/package/simplematter)

A simple frontmatter parser.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [`simplematter(content[, parsers])`](#simplemattercontent-parsers)
- [Examples](#examples)
  - [Modify YAML frontmatter](#modify-yaml-frontmatter)
  - [Get raw frontmatter](#get-raw-frontmatter)
- [Compatibility](#compatibility)
- [License](#license)

## Installation

```sh
npm install simplematter
```

## Usage

The `simplematter` function parses frontmatter data from a string. It supports both the `---` and
the `+++` fences. The `---` fence is typically used for YAML data, the `+++` fence for TOML.

```js
import { simplematter } from 'simplematter'

const [frontmatter, document] = simplematter(
  `---
title: This could be the document title.
---

Rest of document
`
)

console.log(frontmatter)
console.log(document)
```

## API

### `simplematter(content[, parsers])`

Parse frontmatter data.

#### Arguments

- `content` (`string`) — The string from which to parse frontmatter data.
- `parsers` (`object`, optional) — The parsers to use. It has the following keys:
  - `yaml` — A parser for YAML content. This is used to parse content from the `---` fence. By
    default the [`yaml`](https://eemeli.org/yaml/) package is used.
  - `toml` — A parser for TOML content. This is used to parse content from the `+++` fence. By
    default the [`smol-toml`](https://github.com/squirrelchat/smol-toml) package is used.

## Examples

### Modify YAML frontmatter

You can modify YAML frontmatter data while preserving most of the original YAML using the
[`parseDocument`](https://eemeli.org/yaml/#parsing-documents) function exposed by `yaml`.

```ts
import { simplematter } from 'simplematter'
import { Document, isDocument, parseDocument } from 'yaml'

const [frontmatter, content] = simplematter(
  `---
# This comment is preserved.
title: This could be the document title.
---

Rest of the document.
`,
  { yaml: parseDocument }
)

const yamlDocument = isDocument(frontmatter) ? frontmatter : new Document()
yamlDocument.set('modified', new Date().toISOString().slice(0, 10))

const result = `---\n${frontmatter}---\n\n${content}`

console.log(result)
```

### Get raw frontmatter

You can get the raw frontmatter string by returning the input from your parser function.

```ts
import { simplematter } from 'simplematter'

function identity<Input>(input: Input): Input {
  return input
}

const [frontmatter] = simplematter(
  `---
title: This could be the document title.
---

Rest of the document.
`,
  { toml: identity, yaml: identity }
)

console.log(frontmatter)
```

## Compatibility

This project is compatible with Node.js 22 or greater.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
