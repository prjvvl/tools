# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Copilot, etc.) working
in this repo. Read this before making changes. This is a Trestle site whose
content is tools instead of blog posts. The blog feature itself was removed,
so ignore anything you know about Trestle's Markdown content collection.

## Where things live

- **Tool implementation**: `src/tools/<slug>/`. Everything a tool needs
  (components, helpers, its own worker setup, etc.) lives inside its own
  folder. **A tool's folder may only import from `src/components`, `src/lib`,
  and `src/styles`: never from another tool's folder.** Astro code-splits
  per route, so as long as this rule holds, one tool's bundle, dependencies,
  and runtime state can never leak into another's, no matter how large or
  buggy either one is. This is the whole isolation model. Don't introduce a
  shared `src/tools/shared/` grab-bag or a cross-tool import "just this once."
- **Tool routes**: `src/pages/<slug>/index.astro` (top-level, not nested
  under a `/tools/` path: the repo's own GitHub Pages `base` already puts
  everything under `/tools/`). Keep the page a thin wrapper: `ToolLayout`
  (not `BaseLayout` directly, see below) wrapping the tool's component
  mounted with `client:only="react"`. These are interactive-only tools with
  nothing worth server-rendering, and `client:only` sidesteps hydration-
  mismatch issues from browser-only APIs (canvas, Monaco, etc.). Title and
  description always come from the registry lookup
  (`tools.find((t) => t.slug === "...")!`), never hardcoded locally. Every
  tool page follows this exact shape:
  ```astro
  ---
  import ToolLayout from "../../layouts/ToolLayout.astro";
  import MyTool from "../../tools/my-tool/MyTool";
  import { tools } from "../../tools/registry";

  const tool = tools.find((t) => t.slug === "my-tool")!;
  ---

  <ToolLayout title={tool.title} description={tool.description}>
    <MyTool client:only="react" />
  </ToolLayout>
  ```
- **`src/layouts/ToolLayout.astro`**: every tool page uses this, not
  `BaseLayout` directly. It puts the tool's name in the nav's brand slot
  (via `navTitle`, see `Nav.astro`) instead of rendering a second title
  block above the tool: a page-local "Tool Name / description" header
  right below the global nav reads as two stacked headers, which is worse
  than one. It also renders a visually-hidden (`sr-only`) `<h1>` for
  accessibility/SEO, since a page still needs a real heading even though
  nothing shows one visually. Don't add a visible title/description block
  to an individual tool page to "explain" it. If a tool genuinely needs
  more than its own UI to make sense, that's a sign the UI needs work, not
  that it needs a caption.
- **Tool registry**: `src/tools/registry.ts`. One array, one entry per tool
  (`slug`, `title`, `description`, `icon`). Drives the homepage grid and each
  tool page's own meta description; adding an entry here doesn't create the
  page, and creating the page without an entry here makes it unlisted (works,
  but absent from the homepage grid).
- **Site metadata, nav, feature flags**: `src/site.config.ts`. One file, not
  scattered config.
- **Brand colors, fonts, spacing**: `src/styles/global.css`, inside the
  `@theme` block. This is Tailwind v4's CSS-first config; do not create a
  `tailwind.config.js`, it won't be picked up.
- **Reusable UI**: mostly `src/components/*.astro` (Nav, Footer, Card,
  Button). Reuse these instead of writing new one-off markup for
  common patterns like a card grid or a CTA button. A React island that
  needs the same look (Card.astro and Button.astro can't be imported into
  React) can import the class strings from `src/lib/styles.ts` instead of
  copying Tailwind classes by hand. Two exceptions live in the same folder
  as *React* components (any tool can import them: they're shared UI, not
  tool-specific): `CopyField.tsx` for the "generated value + copy button"
  pattern, and `Select.tsx` for any dropdown. See the tool-building
  conventions below before reaching for either of these or
  `src/lib/styles.ts`.
- **Pages**: `src/pages/*.astro`. File-based routing.
- **Deploy**: `.github/workflows/deploy.yml`. Don't hand-edit unless you're
  deliberately changing the deploy process; it's already wired to GitHub
  Pages.

## Rules

- **Don't hardcode colors, fonts, or spacing values in components.** Use the
  Tailwind utility classes that map to the tokens in `global.css`
  (`bg-brand`, `bg-brand-100`...`bg-brand-900`, `text-fg`, `border-border`,
  `bg-surface`, `rounded-card`, `font-display`, semantic `text-success` /
  `text-error` / `text-warning` / `text-info`, etc.), not raw hex codes or
  arbitrary pixel values. This is what keeps a site visually consistent as
  it grows. Headings (`h1`–`h4`) automatically get `--font-display`
  (Space Grotesk); body text stays on `--font-sans` (Inter); don't override
  this per-component.
- **Never hardcode an internal `href="/..."`.** GitHub Pages without a
  custom domain serves the site at a subpath (`username.github.io/repo/`),
  which Astro's `base` config handles, but plain `<a href="/qr-generator">`
  isn't auto-prefixed. Use `withBase("/qr-generator")` from `src/lib/url.ts`
  for any internal link, or go through `<Button>` / `<Card>` (both already apply it
  automatically for any `href` starting with `/`). External URLs need no
  change. Forgetting this is a silent bug, not a build error: the site
  still builds, links just 404 once deployed without a custom domain.
- **Elevation/hover on interactive surfaces**: use the `hover-elevate` CSS
  class (defined in `global.css`), not ad hoc `hover:shadow-*` utilities.
  `box-shadow` is nearly invisible on a dark background, so `hover-elevate`
  switches to a background/border brightness shift in dark mode instead.
- **Card usage**: only pass `href` to `<Card>` when it's genuinely
  clickable. An `href`-less Card renders as a plain informational block
  (no border/background) rather than a bordered box. Styling every content
  block identically, whether clickable or not, is one of the most common
  "this is a generic template" tells.
- **Any image or embed must set an explicit `width`/`height` or
  `aspect-ratio`.** The browser needs to reserve the right amount of space
  before the file loads. An unsized image is one of the most common causes
  of content jumping around as a page loads. Prefer Astro's `<Image />`
  (`astro:assets`) for local images, which enforces this automatically.
- **Don't edit `astro.config.mjs`'s CNAME logic.** It reads `siteConfig.domain`
  automatically. Set the domain in `site.config.ts`, don't write a CNAME
  file by hand or duplicate the logic elsewhere.
- **A tool's interactive component gets `client:only="react"`, not
  `client:load`.** Every tool here touches a browser-only API (canvas,
  `Blob`/`URL.createObjectURL`, Monaco, etc.) that doesn't exist during
  Astro's server render, so there's nothing correct to hydrate against.
  `client:only` skips server rendering for that island entirely instead of
  producing a hydration mismatch. If a future tool's initial view genuinely
  has server-renderable content (e.g. it reads static data), `client:load`
  is fine for that one, but that's the exception, not the default here.
- **Dark/light theme**: dark is the default palette; light applies only
  when the system explicitly prefers it, or the visitor toggles it via
  `ThemeToggle.astro` (persisted in localStorage, no "system" option in
  the toggle itself). Don't reach for Tailwind's built-in `dark:` variant,
  it only checks `prefers-color-scheme` and ignores the explicit toggle.
  Use the `--color-*` tokens directly (they already respond to both
  triggers) or, for a new light-specific style, follow the pattern in
  `global.css`: duplicate the rule once under
  `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) ... }`
  and once under `:root[data-theme="light"] ...`.
- **Building the contact form or anything else with validation**: validate
  each field on blur (not on every keystroke, that's worse, not better),
  plus a final check on submit that also summarizes remaining errors. Use
  `text-error` / `bg-error-bg` (and the matching `-success`/`-warning`/
  `-info` tokens) for state, not ad hoc colors. They're defined in
  `global.css` specifically so nobody has to invent them per-form. Use
  `<Button loading={...}>` (shows a spinner, disables the button) to
  prevent double-submit during the async request.
- **Building anything that loads content asynchronously** (search results,
  etc.): use a skeleton placeholder shaped like the real content, not a
  spinner. It avoids the layout jumping when the content arrives, same
  reasoning as the image-sizing rule above. A spinner is only correct for a
  single action with no shape to preview (a button's own pending state).
- **Before finishing a change**, run `npm run check` (type-check) and
  `npm run build`. Both must pass with zero errors. The CI workflow runs the
  same two commands on every PR.

## Tool-building conventions

These exist because the first batch of tools was built by several agents in
parallel, each seeing only one prior tool as a reference. Small
inconsistencies crept in (different copy-button feedback, some tools framed
in a card and some not, error banners with no `role="alert"`, etc.). Follow
these so the next tool doesn't repeat that drift.

- **Frame the tool's control surface in a card by default**: outer wrapper
  gets `rounded-card border border-border bg-surface p-6 md:p-8` (inputs
  inside stay `bg-bg`, not `bg-surface`, so they read as fields within the
  card). Skip this only when the tool is genuinely wide/full-bleed content
  (the text editor, the side-by-side diff view). That's a real exception,
  not a default to copy.
- **Copy-to-clipboard on a single generated value** (a password, a UUID, a
  hash digest, etc.): use `<CopyField value={...} />` from
  `src/components/CopyField.tsx`. It already handles the "Copied!" label,
  the 1.5s reset, and `role="status" aria-live="polite"` so screen readers
  hear that new output appeared. Don't hand-roll a `<code>` + button pair
  for this case. A textarea-shaped copy (the whole editor's content, an
  encode/decode output box) doesn't fit `CopyField`; those still just need
  their own `copied` state and a "Copied!" label. The point is *some*
  feedback, not literally zero, which is a real bug some earlier tools had.
- **Error/validation banners**: use `errorBannerClass` from
  `src/lib/styles.ts` and always add `role="alert"` at the usage site (the
  class string can't carry the attribute): `<div className={errorBannerClass} role="alert">`.
  This applies to actual errors (invalid JSON, a bad regex, a malformed
  token); it is not for a tool's permanent capability-check message (e.g.
  "this needs a secure context"), which should still use the same class for
  visual consistency, also with `role="alert"` since it's equally worth
  announcing.
- **A dropdown** (language picker, algorithm choice, etc.) uses
  `<Select>` from `src/components/Select.tsx`, not a raw `<select>`. A
  plain `<select className={selectClass}>` still renders the browser's own
  arrow flush against the padding, which is what "too close to the border"
  actually is: padding doesn't control where a native widget draws its own
  icon. `<Select>` resets `appearance` and draws a real chevron with real
  spacing; `selectClass` itself is now an implementation detail of that
  component, not something to apply directly.
- **A control living inside a dense row** (a list item, a tab) where a
  fully bordered button would be heavier than its surroundings: use
  `buttonVariantClass.ghost`, not a one-off hand-styled button.
- **Empty state, before a result exists**: for a *button-triggered* tool
  (Generate/Compare-style, the output doesn't exist until the user acts),
  show a short muted hint like "Your generated password will appear here."
  For a *live-typing* tool (output updates as you type: JSON Formatter,
  Base64, Word Counter), don't add a hint; the empty input already
  communicates "nothing yet," and a hint there is just noise.
- **Output produced by a button click** (not by typing) should sit in a
  region with `aria-live="polite"` (or use `CopyField`, which already has
  it) so a screen-reader user is told something changed; they can't see
  the new content appear the way a sighted user can.
