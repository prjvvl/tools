/**
 * Single source of truth for site metadata and navigation. Brand colors and
 * fonts live in src/styles/global.css (the @theme block). Tailwind v4's
 * config is CSS-first, so tokens stay there, not here.
 */
export const siteConfig = {
  name: "Tools",
  description: "A growing collection of small, free, frontend-only tools. No sign-up, no server, no tracking.",

  /** Set this to your custom domain (e.g. "example.com") to enable one.
   *  Leave empty to use the default <user>.github.io/<repo> URL.
   *  Whatever is set here is written to dist/CNAME on every build automatically. */
  domain: "",

  /** Fallback base URL used when `domain` is empty. Update the path to match your repo name. */
  url: "https://prjvvl.github.io/tools",

  /** Set once the repo actually exists and is pushed. */
  social: {
    github: "",
    twitter: "",
    linkedin: "",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ],
} as const;
