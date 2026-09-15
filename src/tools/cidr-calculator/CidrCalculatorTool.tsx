import { useMemo, useState } from "react";
import CopyField from "../../components/CopyField";
import { errorBannerClass } from "../../lib/styles";
import { parseCidr } from "./cidr";

export default function CidrCalculatorTool() {
  const [input, setInput] = useState("192.168.1.0/24");

  const { result, error } = useMemo(() => parseCidr(input), [input]);

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="cidr-input" className="block text-sm font-medium text-fg">
        CIDR block
      </label>
      <input
        id="cidr-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="192.168.1.0/24"
        spellCheck={false}
        className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
      />

      {error && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6" aria-live="polite">
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Network address</p>
            <CopyField value={result.network} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Broadcast address</p>
            <CopyField value={result.broadcast} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">First usable host</p>
            <CopyField value={result.firstHost} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Last usable host</p>
            <CopyField value={result.lastHost} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-card border border-border bg-bg px-3 py-2">
              <p className="text-xs text-fg-muted">Total addresses</p>
              <p className="font-mono text-sm text-fg">{result.totalAddresses.toLocaleString()}</p>
            </div>
            <div className="rounded-card border border-border bg-bg px-3 py-2">
              <p className="text-xs text-fg-muted">Usable hosts</p>
              <p className="font-mono text-sm text-fg">{result.usableHosts.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
