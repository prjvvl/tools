export const EXAMPLE_MARKDOWN = `# Project Name

A short description of what this project does and who it's for.

## Features

- [x] GitHub-flavored tables
- [x] Task lists
- [ ] Something still in progress

| Feature  | Supported |
| -------- | :-------: |
| Tables   |    ✅     |
| Mermaid  |    ✅     |
| Raw HTML |    🚫     |

## How it works

\`\`\`mermaid
flowchart TD
    A[Write Markdown] --> B{Contains a diagram?}
    B -- Yes --> C[Render with Mermaid]
    B -- No --> D[Render as HTML]
    C --> E[Preview]
    D --> E[Preview]
\`\`\`

> Edit the text on the left and watch this preview update.
`;
