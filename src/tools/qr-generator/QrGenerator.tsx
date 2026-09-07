import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { buttonVariantClass } from "../../lib/styles";

export default function QrGenerator() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (input.trim()) setQrValue(input.trim());
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="qr-input" className="block text-sm font-medium text-fg">
        Text or URL
      </label>
      <input
        id="qr-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        placeholder="https://example.com or any text..."
        className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!input.trim()}
        className={`mt-4 w-full ${buttonVariantClass.primary} disabled:pointer-events-none disabled:opacity-60`}
      >
        Generate QR Code
      </button>

      {qrValue && (
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-border pt-6">
          <div ref={qrRef} className="rounded-card bg-white p-4">
            <QRCodeCanvas value={qrValue} size={224} level="H" marginSize={2} fgColor="#0a2540" bgColor="#ffffff" />
          </div>
          <button type="button" onClick={handleDownload} className={`w-full ${buttonVariantClass.secondary}`}>
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}
