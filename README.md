# Tools

A growing collection of small, free, frontend-only tools, deployed as one
GitHub Pages site. Live at https://prjvvl.github.io/tools/.

Built on [Trestle](https://github.com/prjvvl/trestle) (Astro + React islands +
Tailwind CSS v4), so every tool shares the same nav, footer, design tokens,
and deploy pipeline without sharing any runtime code with each other.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:4321/tools/`.

## Adding a new tool

1. Implementation goes in `src/tools/<slug>/`: components, helpers, anything
   the tool needs. It may only import from `src/components`, `src/lib`, and
   `src/styles`, never from another tool's folder. Astro code-splits per
   route, so a tool that never imports another tool's code can't leak into
   its bundle or its runtime, no matter how heavy either one is.
2. Add the route: `src/pages/<slug>/index.astro`, wrapping the tool's
   interactive component in `ToolLayout` and mounting it with
   `client:only="react"`.
3. Register it in `src/tools/registry.ts` (slug, title, description, icon).
   That's what puts it on the homepage grid and fills in its own page's SEO
   meta; nothing else reads this file.
4. Reach for the shared pieces before hand-rolling anything: `CopyField`
   for a "generated value + copy button" pattern, `Select` for any
   dropdown, `errorBannerClass`/`selectClass` from `lib/styles.ts` for
   everything else.
5. Run `npm run check && npm run build` before considering it done.

See `AGENTS.md` for the full rule set (design tokens, internal links, dark
mode, tool-building conventions, etc.) inherited from Trestle plus the
tool-specific ones above.

## Project structure

```
src/
  tools/<slug>/     Each tool's own implementation, isolated by convention
  pages/<slug>/     Thin route wrapper per tool (URL = /tools/<slug>)
  tools/registry.ts Tool metadata: drives the homepage grid + page SEO
  components/       Nav, Footer, Card, Button, CopyField, Select: shared UI
  layouts/          BaseLayout.astro (page shell), ToolLayout.astro (tool pages)
  site.config.ts    Site metadata, nav
  styles/           global.css: Tailwind v4 + design tokens
```

## Deploying

Push to `main`: GitHub Actions builds and publishes to GitHub Pages
automatically. First-time setup: in the repo's **Settings → Pages**, set the
source to **GitHub Actions**.

## License

MIT, see `LICENSE`.
