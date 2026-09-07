import { useMemo, useState } from "react";

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 1;
}

function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

function readingTime(wordCount: number): string {
  if (wordCount === 0) return "0 min";
  const minutes = wordCount / 200;
  return minutes < 1 ? "< 1 min" : `${Math.round(minutes)} min`;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = countWords(text);
    return [
      { label: "Words", value: words },
      { label: "Characters (with spaces)", value: text.length },
      { label: "Characters (no spaces)", value: text.replace(/\s/g, "").length },
      { label: "Sentences", value: countSentences(text) },
      { label: "Paragraphs", value: countParagraphs(text) },
      { label: "Reading time", value: readingTime(words) },
    ];
  }, [text]);

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
        rows={10}
        className="w-full resize-y rounded-card border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <p className="text-sm text-fg-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
