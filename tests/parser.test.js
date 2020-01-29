import t from 'tap'
import * as parser from '../src/parser'

t.test('parseLabel', async t => {
  let strings = [
    '"hi"',
    '"A\\times_{C,D} B"',
    '"{hello"world}"',
    '"hel{lo"world}"',
    '"hel{lo"wor}ld"',
    '"{]}"',
    '"{\\]}"',
    '"{\\\\]}"',
    '"{\\\\\\]}"',
    '"{\\}}"',
    '"{\\\\}"',
    '"{\\\\\\}}"',
    '"{\\ \\}}"',
    '"{\\{\\}\\}}"',
    'abcd"',
    '"abcd',
    '"hel{lo"world"',
    '"hel{lo"wo{rld}"'
  ]

  let labels = [
    {match: '"hi"', value: 'hi', wrapped: false},
    {match: '"A\\times_{C,D} B"', value: 'A\\times_{C,D} B', wrapped: false},
    {match: '"{hello"world}"', value: 'hello"world', wrapped: true},
    {match: '"hel{lo"world}"', value: 'hel{lo"world}', wrapped: false},
    {match: '"hel{lo"wor}ld"', value: 'hel{lo"wor}ld', wrapped: false},
    {match: '"{]}"', value: ']', wrapped: true},
    {match: '"{\\]}"', value: '\\]', wrapped: true},
    {match: '"{\\\\]}"', value: '\\\\]', wrapped: true},
    {match: '"{\\\\\\]}"', value: '\\\\\\]', wrapped: true},
    {match: '"{\\}}"', value: '\\}', wrapped: true},
    {match: '"{\\\\}"', value: '\\\\', wrapped: true},
    {match: '"{\\\\\\}}"', value: '\\\\\\}', wrapped: true},
    {match: '"{\\ \\}}"', value: '\\ \\}', wrapped: true},
    {match: '"{\\{\\}\\}}"', value: '\\{\\}\\}', wrapped: true},
    null,
    null,
    null,
    null
  ]

  for (let i = 0; i < strings.length; i++) {
    let label = parser.parseLabel(strings[i] + 'abc')
    t.strictDeepEqual(label, labels[i])
  }
})

t.test('tokenizeArrow', async t => {
  t.test('tokenize basic arrow', async t => {
    let tokens = [
      ...parser.tokenizeArrow(
        '\\arrow[rr, "hi", hook\', bend left, shift left=2]'
      )
    ]
    let tokenTypes = tokens.map(token => token.type)
    let tokenValues = tokens.map(token => token.value)

    t.strictDeepEqual(tokenTypes, [
      'command',
      'argName',
      'label',
      'argName',
      'alt',
      'argName',
      'argName',
      'argValue',
      'end'
    ])
    t.strictDeepEqual(tokenValues, [
      '\\arrow[',
      'rr',
      '"hi"',
      'hook',
      "'",
      'bend left',
      'shift left',
      '=2',
      ']'
    ])
  })

  t.test('tokenize loops', async t => {
    let tokens = [
      ...parser.tokenizeArrow(
        '\\arrow["f"\', loop, distance=2em, in=305, out=235]'
      )
    ]
    let tokenTypes = tokens.map(token => token.type)
    let tokenValues = tokens.map(token => token.value)

    t.strictDeepEqual(tokenTypes, [
      'command',
      'label',
      'alt',
      'argName',
      'argName',
      'argValue',
      'argName',
      'argValue',
      'argName',
      'argValue',
      'end'
    ])
    t.strictDeepEqual(tokenValues, [
      '\\arrow[',
      '"f"',
      "'",
      'loop',
      'distance',
      '=2em',
      'in',
      '=305',
      'out',
      '=235',
      ']'
    ])
  })

  t.test('tokenize invalid token', async t => {
    let tokens = [
      ...parser.tokenizeArrow(
        '\\arrow["f"\', loop, distance=2em, in=, out=235]'
      )
    ]

    let invalidToken = tokens.find(token => token.type == null)

    t.ok(invalidToken != null)
    t.equal(invalidToken.value, '=')
  })
})

t.test('tokenize', async t => {
  let tokens = [
    ...parser.tokenize(
      `% This is a comment
      \\begin{tikzcd}
      A \\ \\arrow[d, "\\overline{g}"'] &  & A\\times B \\arrow[rrdd, "g"]
        \\arrow[rr, "\\pi_2"] \\arrow[ll, "\\pi_1"']
        \\arrow[dd, "\\overline{g}\\times\\mathbf{1}_B" description, dashed] &
        & B\\% \\arrow[d, "\\mathbf{1}_B"] \\\\
      \\{C^B\\} &  &  &  & {B} % This is a comment
        \\\\
      &  & C^B\\times B \\arrow[llu, "\\pi'_1"] \\arrow[rru, "\\pi'_2"']
        \\arrow[rr, "{\\mathrm{ev}_{B,C}}"'] &  & C
      \\end{tikzcd}`
    )
  ]

  let tokenTypes = tokens.map(token => token.type)
  let nodes = tokens
    .filter(token => token.type === 'node')
    .map(token => token.value)

  t.strictDeepEqual(tokenTypes, [
    'begin',
    'node',
    'arrow',
    'align',
    'align',
    'node',
    'arrow',
    'arrow',
    'arrow',
    'arrow',
    'align',
    'align',
    'node',
    'arrow',
    'newrow',
    'node',
    'align',
    'align',
    'align',
    'align',
    'node',
    'newrow',
    'align',
    'align',
    'node',
    'arrow',
    'arrow',
    'arrow',
    'align',
    'align',
    'node',
    'end'
  ])

  t.strictDeepEqual(nodes, [
    'A \\ ',
    'A\\times B',
    'B\\%',
    '\\{C^B\\}',
    '{B}',
    'C^B\\times B',
    'C'
  ])
})
