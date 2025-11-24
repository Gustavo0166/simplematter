import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

import { simplematter } from 'simplematter'

test('parse yaml', () => {
  const result = simplematter('---\nhello: yaml\n---\nRest of document\n')

  assert.deepEqual(result, [{ hello: 'yaml' }, 'Rest of document\n'])
})

test('parse toml', () => {
  const result = simplematter('+++\nhello = "toml"\n+++\nRest of document\n')

  assert.deepEqual(result, [{ hello: 'toml' }, 'Rest of document\n'])
})

test('CRLF', () => {
  const result = simplematter('---\r\nyaml\r\n---\r\nRest of document\r\n')

  assert.deepEqual(result, ['yaml', 'Rest of document\r\n'])
})

test('missing frontmatter', () => {
  const result = simplematter('Rest of document\n')

  assert.deepEqual(result, [undefined, 'Rest of document\n'])
})

test('bad open fence', () => {
  const result = simplematter('>>>\ninvalid\n>>>\nRest of document\n')

  assert.deepEqual(result, [undefined, '>>>\ninvalid\n>>>\nRest of document\n'])
})

test('open fence with trailing characters', () => {
  const result = simplematter('---invalid\ninvalid\n---\nRest of document\n')

  assert.deepEqual(result, [undefined, '---invalid\ninvalid\n---\nRest of document\n'])
})

test('missing closing fence', () => {
  const result = simplematter('---\nRest of document\n')

  assert.deepEqual(result, [undefined, '---\nRest of document\n'])
})

test('open fence second line', () => {
  const result = simplematter('\n---\nyaml\n---\nRest of document\n')

  assert.deepEqual(result, [undefined, '\n---\nyaml\n---\nRest of document\n'])
})

test('indented open fence', () => {
  const result = simplematter(' ---\nyaml\n---\nRest of document\n')

  assert.deepEqual(result, [undefined, ' ---\nyaml\n---\nRest of document\n'])
})

test('indented closing fence', () => {
  const result = simplematter('---\nyaml\n ---\nRest of document\n')

  assert.deepEqual(result, [undefined, '---\nyaml\n ---\nRest of document\n'])
})

test('4 character closing fence', () => {
  const result = simplematter('---\nyaml\n----\nRest of document\n')

  assert.deepEqual(result, [undefined, '---\nyaml\n----\nRest of document\n'])
})

test('5 character closing fence', () => {
  const result = simplematter('---\nyaml\n-----\nRest of document\n')

  assert.deepEqual(result, [undefined, '---\nyaml\n-----\nRest of document\n'])
})

test('6 character closing fence', () => {
  const result = simplematter('---\nyaml\n------\nRest of document\n')

  assert.deepEqual(result, [undefined, '---\nyaml\n------\nRest of document\n'])
})

test('start trailing document end', () => {
  const result = simplematter('---')

  assert.deepEqual(result, [undefined, '---'])
})

test('end trailing document end', () => {
  const result = simplematter('---\nyaml\n---')

  assert.deepEqual(result, ['yaml', ''])
})

test('trailing space open fence', () => {
  const result = simplematter('---    \nyaml\n---\nRest of document\n')

  assert.deepEqual(result, ['yaml', 'Rest of document\n'])
})

test('trailing space closing fence', () => {
  const result = simplematter('---\nyaml\n---      \nRest of document\n')

  assert.deepEqual(result, ['yaml', 'Rest of document\n'])
})

test('custom yaml parser', () => {
  const parse = mock.fn(() => 'custom parser')
  const result = simplematter('---    \nyaml\n\n---\nRest of document\n', { yaml: parse })

  assert.deepEqual(parse.mock.calls[0].arguments, ['yaml\n\n'])
  assert.deepEqual(result, ['custom parser', 'Rest of document\n'])
})

test('custom toml parser', () => {
  const parse = mock.fn(() => 'custom parser')
  const result = simplematter('+++\ntoml\n\n+++\nRest of document\n', { toml: parse })

  assert.deepEqual(parse.mock.calls[0].arguments, ['toml\n\n'])
  assert.deepEqual(result, ['custom parser', 'Rest of document\n'])
})
