import {
  Binary,
  Braces,
  CaseSensitive,
  Clock,
  FileCode,
  GitCompare,
  Hash,
  IdCard,
  KeyRound,
  Palette,
  QrCode,
  Regex,
  ShieldCheck,
  WholeWord,
} from "@lucide/astro";

/**
 * Single source of truth for which tools exist. Drives both the homepage
 * grid and each tool page's own meta description. A tool's slug is also its
 * route: adding an entry here does not create the page; you still need
 * src/pages/<slug>/index.astro. This only makes it discoverable.
 */
export const tools = [
  {
    slug: "qr-generator",
    title: "QR Code Generator",
    description: "Turn any text or URL into a QR code and download it as a PNG.",
    icon: QrCode,
  },
  {
    slug: "text-editor",
    title: "Text Editor",
    description: "Write and compare text or code online, with multi-language support and a diff mode.",
    icon: FileCode,
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Pretty-print, minify, and validate JSON, right in your browser.",
    icon: Braces,
  },
  {
    slug: "base64",
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 back to text, with full Unicode support.",
    icon: Binary,
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate one or many random UUID v4s and copy them instantly.",
    icon: IdCard,
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate strong, random passwords with custom length and character rules.",
    icon: KeyRound,
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    description: "Test a regular expression against sample text with live match highlighting and capture groups.",
    icon: Regex,
  },
  {
    slug: "text-diff",
    title: "Text Diff Checker",
    description: "Compare two blocks of text and see exactly what was added or removed, line by line.",
    icon: GitCompare,
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode a JWT's header and payload. No signature verification, and nothing leaves your browser.",
    icon: ShieldCheck,
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "Compute a SHA-1/256/384/512 digest of any text, entirely in your browser.",
    icon: Hash,
  },
  {
    slug: "case-converter",
    title: "Case Converter",
    description: "Convert text between camelCase, snake_case, kebab-case, Title Case, and more.",
    icon: CaseSensitive,
  },
  {
    slug: "word-counter",
    title: "Word & Character Counter",
    description: "Count words, characters, sentences, and paragraphs, with estimated reading time.",
    icon: WholeWord,
  },
  {
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates, in seconds or milliseconds.",
    icon: Clock,
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert colors between hex, RGB, and HSL, with a live preview and color picker.",
    icon: Palette,
  },
] as const;
