import { useMemo, useState } from "react";
import Select from "../../components/Select";
import CopyField from "../../components/CopyField";

type MinuteMode = "every" | "step" | "specific";
type SimpleMode = "every" | "specific";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function CronBuilderTool() {
  const [minuteMode, setMinuteMode] = useState<MinuteMode>("every");
  const [minuteStep, setMinuteStep] = useState(5);
  const [minuteValue, setMinuteValue] = useState(0);

  const [hourMode, setHourMode] = useState<SimpleMode>("every");
  const [hourValue, setHourValue] = useState(0);

  const [domMode, setDomMode] = useState<SimpleMode>("every");
  const [domValue, setDomValue] = useState(1);

  const [monthMode, setMonthMode] = useState<SimpleMode>("every");
  const [monthValue, setMonthValue] = useState(1);

  const [dowMode, setDowMode] = useState<SimpleMode>("every");
  const [dowValue, setDowValue] = useState(1);

  const minuteField =
    minuteMode === "every" ? "*" : minuteMode === "step" ? `*/${minuteStep}` : String(minuteValue);
  const hourField = hourMode === "every" ? "*" : String(hourValue);
  const domField = domMode === "every" ? "*" : String(domValue);
  const monthField = monthMode === "every" ? "*" : String(monthValue);
  const dowField = dowMode === "every" ? "*" : String(dowValue);

  const expression = `${minuteField} ${hourField} ${domField} ${monthField} ${dowField}`;

  const explanation = useMemo(() => {
    let timeClause: string;

    if (minuteMode === "step" && hourMode === "every") {
      timeClause = `Runs every ${minuteStep} minute${minuteStep === 1 ? "" : "s"}`;
    } else if (minuteMode === "every" && hourMode === "every") {
      timeClause = "Runs every minute";
    } else if (minuteMode === "specific" && hourMode === "specific") {
      const hh = String(hourValue).padStart(2, "0");
      const mm = String(minuteValue).padStart(2, "0");
      timeClause = `Runs once a day at ${hh}:${mm}`;
    } else if (minuteMode === "specific" && hourMode === "every") {
      timeClause = `Runs at minute ${minuteValue} of every hour`;
    } else if (minuteMode === "every" && hourMode === "specific") {
      timeClause = `Runs every minute during hour ${hourValue}`;
    } else {
      // minute=step, hour=specific: uncommon combo, describe both parts plainly.
      timeClause = `Runs every ${minuteStep} minute${minuteStep === 1 ? "" : "s"} during hour ${hourValue}`;
    }

    const extras: string[] = [];
    if (domMode === "specific") extras.push(`on day ${domValue} of the month`);
    if (monthMode === "specific") extras.push(`in ${MONTH_NAMES[monthValue - 1]}`);
    if (dowMode === "specific") extras.push(`on ${DOW_NAMES[dowValue]}`);

    if (extras.length === 0) return `${timeClause}.`;
    return `${timeClause}, ${extras.join(", ")}.`;
  }, [minuteMode, minuteStep, minuteValue, hourMode, hourValue, domMode, domValue, monthMode, monthValue, dowMode, dowValue]);

  return (
    <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cron-minute-mode" className="block text-sm font-medium text-fg">
            Minute
          </label>
          <div className="mt-2 flex gap-2">
            <Select
              id="cron-minute-mode"
              value={minuteMode}
              onChange={(e) => setMinuteMode(e.target.value as MinuteMode)}
            >
              <option value="every">Every minute</option>
              <option value="step">Every N minutes</option>
              <option value="specific">Specific minute</option>
            </Select>
            {minuteMode === "step" && (
              <input
                type="number"
                min={1}
                max={59}
                value={minuteStep}
                onChange={(e) => setMinuteStep(clamp(Number(e.target.value) || 1, 1, 59))}
                aria-label="Minute step"
                className="min-h-11 w-20 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
              />
            )}
            {minuteMode === "specific" && (
              <input
                type="number"
                min={0}
                max={59}
                value={minuteValue}
                onChange={(e) => setMinuteValue(clamp(Number(e.target.value) || 0, 0, 59))}
                aria-label="Minute value"
                className="min-h-11 w-20 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cron-hour-mode" className="block text-sm font-medium text-fg">
            Hour
          </label>
          <div className="mt-2 flex gap-2">
            <Select id="cron-hour-mode" value={hourMode} onChange={(e) => setHourMode(e.target.value as SimpleMode)}>
              <option value="every">Every hour</option>
              <option value="specific">Specific hour</option>
            </Select>
            {hourMode === "specific" && (
              <input
                type="number"
                min={0}
                max={23}
                value={hourValue}
                onChange={(e) => setHourValue(clamp(Number(e.target.value) || 0, 0, 23))}
                aria-label="Hour value"
                className="min-h-11 w-20 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cron-dom-mode" className="block text-sm font-medium text-fg">
            Day of month
          </label>
          <div className="mt-2 flex gap-2">
            <Select id="cron-dom-mode" value={domMode} onChange={(e) => setDomMode(e.target.value as SimpleMode)}>
              <option value="every">Every day</option>
              <option value="specific">Specific day</option>
            </Select>
            {domMode === "specific" && (
              <input
                type="number"
                min={1}
                max={31}
                value={domValue}
                onChange={(e) => setDomValue(clamp(Number(e.target.value) || 1, 1, 31))}
                aria-label="Day of month value"
                className="min-h-11 w-20 rounded-card border border-border bg-bg px-3 text-sm text-fg focus:border-brand-300 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cron-month-mode" className="block text-sm font-medium text-fg">
            Month
          </label>
          <div className="mt-2 flex gap-2">
            <Select
              id="cron-month-mode"
              value={monthMode}
              onChange={(e) => setMonthMode(e.target.value as SimpleMode)}
            >
              <option value="every">Every month</option>
              <option value="specific">Specific month</option>
            </Select>
            {monthMode === "specific" && (
              <Select
                aria-label="Month value"
                value={monthValue}
                onChange={(e) => setMonthValue(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cron-dow-mode" className="block text-sm font-medium text-fg">
            Day of week
          </label>
          <div className="mt-2 flex gap-2">
            <Select id="cron-dow-mode" value={dowMode} onChange={(e) => setDowMode(e.target.value as SimpleMode)}>
              <option value="every">Every day</option>
              <option value="specific">Specific day</option>
            </Select>
            {dowMode === "specific" && (
              <Select aria-label="Day of week value" value={dowValue} onChange={(e) => setDowValue(Number(e.target.value))}>
                {DOW_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <p className="mb-2 text-sm font-medium text-fg">Cron expression</p>
        <CopyField value={expression} />
        <p className="mt-4 text-sm text-fg-muted">{explanation}</p>
      </div>
    </div>
  );
}
