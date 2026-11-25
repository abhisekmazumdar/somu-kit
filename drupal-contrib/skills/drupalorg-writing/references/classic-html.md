# Classic Drupal.org HTML

For classic (non-migrated) issue queues only. Markup rules from https://www.drupal.org/filter/tips.

## Paragraphs and line breaks
- Plain blank lines create paragraph breaks — no `<p>` tags needed.
- A single newline inside a paragraph is treated as a space, not a `<br>`.
- Use `<br>` only when you need a forced line break inside a paragraph.

## Code
- Wrap inline code with `<code>your_code()</code>`.
- Wrap multi-line code blocks with `<pre><code>` ... `</code></pre>`.
- PHP code using `<?php ?>` gets automatic syntax highlighting.
- Do NOT use Markdown fenced code blocks (triple backticks) — they are not rendered on Drupal.org.

## Text emphasis and structure
Standard HTML tags render: `<strong>`, `<em>`, `<del>`/`<s>`, `<u>`, `<blockquote>`, `<sup>`, `<sub>`.
Headings are `<h2>` through `<h6>` — no `<h1>`.

## Lists
```html
<ul>
  <li>Unordered item</li>
</ul>

<ol>
  <li>Ordered item</li>
</ol>

<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

## Links
- URLs and email addresses are auto-linked — you can paste them bare.
- For labelled links use: `<a href="https://example.com">link text</a>`

## Issue cross-references
- `[#1234]` auto-links to issue #1234 with its title appended automatically.
- `[#1234-2]` links to comment #2 on issue #1234.
- `[#1234@]` also prints the user the issue is assigned to.
- Issue status is shown on hover automatically — no extra markup needed.

## Tables
Use standard HTML table markup: `<table>`, `<tr>`, `<th>`, `<td>`.

## Images
- Only images hosted on drupal.org may be embedded with `<img>` tags.
- External image URLs are replaced with an error icon — never suggest them.
