import {
  ArrowLeftRight,
  Binary,
  Braces,
  Calculator,
  CalendarClock,
  CaseSensitive,
  Clock,
  Code,
  CodeXml,
  Contrast,
  FileCode,
  FilePen,
  FileText,
  Gauge,
  GitCompare,
  GitBranch,
  Globe,
  Hash,
  IdCard,
  Image,
  Key,
  KeyRound,
  KeySquare,
  Link2,
  ListOrdered,
  Lock,
  LockKeyhole,
  Network,
  Paintbrush,
  Palette,
  QrCode,
  Regex,
  Repeat,
  Ruler,
  Shuffle,
  ShieldCheck,
  Table,
  Type,
  WholeWord,
} from "@lucide/astro";

/**
 * Fixed set of homepage sections. Order here is the order sections render
 * in on the homepage. A tool's `category` must be one of these ids.
 */
export const categories = [
  { id: "text", label: "Text" },
  { id: "encoding", label: "Encoding & Data" },
  { id: "generators", label: "Generators" },
  { id: "security", label: "Security & Crypto" },
  { id: "converters", label: "Converters" },
  { id: "design", label: "Design" },
  { id: "network", label: "Web & Network" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

/**
 * Single source of truth for which tools exist. Drives both the homepage
 * grid and each tool page's own meta description. A tool's slug is also its
 * route: adding an entry here does not create the page, you still need
 * src/pages/<slug>/index.astro. This only makes it discoverable.
 */
export const tools = [
  {
    slug: "qr-generator",
    title: "QR Code Generator",
    description: "Turn any text or URL into a QR code and download it as a PNG.",
    icon: QrCode,
    category: "generators",
  },
  {
    slug: "text-editor",
    title: "Text Editor",
    description: "Write and compare text or code online, with multi-language support and a diff mode.",
    icon: FileCode,
    category: "text",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Pretty-print, minify, and validate JSON, right in your browser.",
    icon: Braces,
    category: "encoding",
  },
  {
    slug: "base64",
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 back to text, with full Unicode support.",
    icon: Binary,
    category: "encoding",
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate one or many random UUID v4s and copy them instantly.",
    icon: IdCard,
    category: "generators",
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate strong, random passwords with custom length and character rules.",
    icon: KeyRound,
    category: "security",
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    description: "Test a regular expression against sample text with live match highlighting and capture groups.",
    icon: Regex,
    category: "text",
  },
  {
    slug: "text-diff",
    title: "Text Diff Checker",
    description: "Compare two blocks of text and see exactly what was added or removed, line by line.",
    icon: GitCompare,
    category: "text",
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode a JWT's header and payload. No signature verification, and nothing leaves your browser.",
    icon: ShieldCheck,
    category: "security",
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "Compute a SHA-1/256/384/512 digest of any text, entirely in your browser.",
    icon: Hash,
    category: "security",
  },
  {
    slug: "case-converter",
    title: "Case Converter",
    description: "Convert text between camelCase, snake_case, kebab-case, Title Case, and more.",
    icon: CaseSensitive,
    category: "text",
  },
  {
    slug: "word-counter",
    title: "Word & Character Counter",
    description: "Count words, characters, sentences, and paragraphs, with estimated reading time.",
    icon: WholeWord,
    category: "text",
  },
  {
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates, in seconds or milliseconds.",
    icon: Clock,
    category: "converters",
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert colors between hex, RGB, and HSL, with a live preview and color picker.",
    icon: Palette,
    category: "design",
  },
  {
    slug: "markdown-preview",
    title: "Markdown Preview",
    description: "Preview GitHub-flavored Markdown and Mermaid diagrams live, right in your browser.",
    icon: FileText,
    category: "text",
  },

  // --- Encoding & Data ---
  {
    slug: "url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode text for use in a URL, or decode a URL-encoded string back to plain text.",
    icon: Link2,
    category: "encoding",
  },
  {
    slug: "html-entities",
    title: "HTML Entity Encoder/Decoder",
    description: "Encode special characters as HTML entities, or decode entities back to plain text.",
    icon: CodeXml,
    category: "encoding",
  },
  {
    slug: "yaml-json-converter",
    title: "YAML ⇄ JSON Converter",
    description: "Convert between YAML and JSON, in either direction.",
    icon: Repeat,
    category: "encoding",
  },
  {
    slug: "csv-json-converter",
    title: "CSV ⇄ JSON Converter",
    description: "Convert between CSV and a JSON array of objects, in either direction.",
    icon: Table,
    category: "encoding",
  },
  {
    slug: "xml-formatter",
    title: "XML Formatter",
    description: "Pretty-print, minify, and validate XML, right in your browser.",
    icon: Code,
    category: "encoding",
  },
  {
    slug: "base-converter",
    title: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal.",
    icon: Calculator,
    category: "encoding",
  },

  // --- Generators ---
  {
    slug: "ulid-generator",
    title: "ULID Generator",
    description: "Generate one or many sortable, timestamp-based ULIDs and copy them instantly.",
    icon: ListOrdered,
    category: "generators",
  },
  {
    slug: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text by paragraphs, sentences, or words.",
    icon: Type,
    category: "generators",
  },
  {
    slug: "gitignore-generator",
    title: "gitignore Generator",
    description: "Build a .gitignore file by picking the languages and tools your project uses.",
    icon: GitBranch,
    category: "generators",
  },
  {
    slug: "cron-builder",
    title: "Cron Expression Builder",
    description: "Build a cron expression with a simple form and see it explained in plain English.",
    icon: CalendarClock,
    category: "generators",
  },
  {
    slug: "token-generator",
    title: "Random Token Generator",
    description: "Generate cryptographically random tokens and API keys with a custom length and character set.",
    icon: KeySquare,
    category: "generators",
  },

  // --- Design ---
  {
    slug: "css-gradient-generator",
    title: "CSS Gradient Generator",
    description: "Design a linear or radial CSS gradient with a live preview and copyable code.",
    icon: Paintbrush,
    category: "design",
  },
  {
    slug: "contrast-checker",
    title: "Contrast Checker",
    description: "Check whether a foreground/background color pair meets WCAG AA/AAA contrast requirements.",
    icon: Contrast,
    category: "design",
  },

  // --- Security & Crypto ---
  {
    slug: "hmac-generator",
    title: "HMAC Generator",
    description: "Compute an HMAC digest of a message with a secret key, using SHA-1/256/384/512.",
    icon: Lock,
    category: "security",
  },
  {
    slug: "aes-encryption",
    title: "AES Encrypt/Decrypt",
    description: "Encrypt or decrypt text with AES-GCM using a passphrase, entirely in your browser.",
    icon: LockKeyhole,
    category: "security",
  },
  {
    slug: "rsa-keygen",
    title: "RSA Key Pair Generator",
    description: "Generate an RSA public/private key pair in PEM format, right in your browser.",
    icon: Key,
    category: "security",
  },
  {
    slug: "password-strength",
    title: "Password Strength Analyzer",
    description: "Check how strong a password is and see concrete suggestions to improve it.",
    icon: Gauge,
    category: "security",
  },
  {
    slug: "jwt-encoder",
    title: "JWT Encoder",
    description: "Build and sign a JWT with a custom header, payload, and HMAC secret.",
    icon: FilePen,
    category: "security",
  },
  {
    slug: "bip39-generator",
    title: "BIP39 Mnemonic Generator",
    description: "Generate a random BIP39 recovery phrase of 12 or 24 words.",
    icon: Shuffle,
    category: "security",
  },

  // --- Converters ---
  {
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Convert between units of length, weight, temperature, and digital storage.",
    icon: Ruler,
    category: "converters",
  },
  {
    slug: "markdown-html-converter",
    title: "Markdown ⇄ HTML Converter",
    description: "Convert Markdown source to HTML, or HTML back to Markdown.",
    icon: ArrowLeftRight,
    category: "converters",
  },
  {
    slug: "image-converter",
    title: "Image Format Converter",
    description: "Convert an image between PNG, JPEG, and WebP, right in your browser.",
    icon: Image,
    category: "converters",
  },

  // --- Web & Network ---
  {
    slug: "cidr-calculator",
    title: "CIDR / Subnet Calculator",
    description: "Break down a CIDR block into its network range, broadcast address, and usable host count.",
    icon: Network,
    category: "network",
  },
  {
    slug: "user-agent-parser",
    title: "User-Agent Parser",
    description: "Parse a User-Agent string into browser, engine, OS, and device details.",
    icon: Globe,
    category: "network",
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
  icon: unknown;
  category: CategoryId;
}>;
