import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Select from "../../components/Select";
import CopyField from "../../components/CopyField";
import { buttonVariantClass, errorBannerClass } from "../../lib/styles";
import { CATEGORY_OPTIONS, convert, formatResult, unitsForCategory, type Category } from "./units";

export default function UnitConverterTool() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [fromValue, setFromValue] = useState("1");

  const units = useMemo(() => unitsForCategory(category), [category]);

  // Reset unit selection to the new category's first two units whenever the
  // category changes, since unit ids aren't shared across categories.
  useEffect(() => {
    const list = unitsForCategory(category);
    setFromUnit(list[0].id);
    setToUnit(list[1]?.id ?? list[0].id);
  }, [category]);

  const numericValue = Number.parseFloat(fromValue);
  const invalid = fromValue.trim() !== "" && Number.isNaN(numericValue);

  const result = useMemo(() => {
    if (invalid || fromValue.trim() === "") return "";
    return formatResult(convert(category, numericValue, fromUnit, toUnit));
  }, [category, numericValue, fromUnit, toUnit, invalid, fromValue]);

  function handleSwap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 md:p-8">
      <label htmlFor="uc-category" className="block text-sm font-medium text-fg">
        Category
      </label>
      <Select
        id="uc-category"
        className="mt-2 w-full"
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
      >
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </Select>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label htmlFor="uc-from-unit" className="block text-sm font-medium text-fg">
            From
          </label>
          <Select
            id="uc-from-unit"
            className="mt-2 w-full"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className={`${buttonVariantClass.secondary} mb-0.5 px-2.5`}
          aria-label="Swap units"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </button>

        <div>
          <label htmlFor="uc-to-unit" className="block text-sm font-medium text-fg">
            To
          </label>
          <Select id="uc-to-unit" className="mt-2 w-full" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="uc-value" className="block text-sm font-medium text-fg">
          Value
        </label>
        <input
          id="uc-value"
          type="text"
          inputMode="decimal"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          placeholder="1"
          className="mt-2 min-h-11 w-full rounded-card border border-border bg-bg px-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none"
        />
      </div>

      {invalid && (
        <p className={`mt-4 ${errorBannerClass}`} role="alert">
          Enter a valid number to convert.
        </p>
      )}

      {!invalid && result !== "" && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium text-fg">Result</p>
          <CopyField value={result} />
        </div>
      )}
    </div>
  );
}
