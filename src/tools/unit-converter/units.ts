export type Category = "length" | "weight" | "temperature" | "digital";

export interface UnitDef {
  id: string;
  label: string;
  /** Multiplier to convert this unit into the category's base unit. Not used for temperature. */
  toBase: number;
}

export const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: "length", label: "Length" },
  { id: "weight", label: "Weight" },
  { id: "temperature", label: "Temperature" },
  { id: "digital", label: "Digital Storage" },
];

// Base unit: meters.
export const LENGTH_UNITS: UnitDef[] = [
  { id: "mm", label: "Millimeters (mm)", toBase: 0.001 },
  { id: "cm", label: "Centimeters (cm)", toBase: 0.01 },
  { id: "m", label: "Meters (m)", toBase: 1 },
  { id: "km", label: "Kilometers (km)", toBase: 1000 },
  { id: "in", label: "Inches (in)", toBase: 0.0254 },
  { id: "ft", label: "Feet (ft)", toBase: 0.3048 },
  { id: "yd", label: "Yards (yd)", toBase: 0.9144 },
  { id: "mi", label: "Miles (mi)", toBase: 1609.344 },
];

// Base unit: kilograms.
export const WEIGHT_UNITS: UnitDef[] = [
  { id: "mg", label: "Milligrams (mg)", toBase: 0.000001 },
  { id: "g", label: "Grams (g)", toBase: 0.001 },
  { id: "kg", label: "Kilograms (kg)", toBase: 1 },
  { id: "t", label: "Tonnes (t)", toBase: 1000 },
  { id: "oz", label: "Ounces (oz)", toBase: 0.028349523125 },
  { id: "lb", label: "Pounds (lb)", toBase: 0.45359237 },
];

// Base unit: bytes.
export const DIGITAL_UNITS: UnitDef[] = [
  { id: "bit", label: "Bits (b)", toBase: 0.125 },
  { id: "byte", label: "Bytes (B)", toBase: 1 },
  { id: "kb", label: "Kilobytes (KB)", toBase: 1024 },
  { id: "mb", label: "Megabytes (MB)", toBase: 1024 ** 2 },
  { id: "gb", label: "Gigabytes (GB)", toBase: 1024 ** 3 },
  { id: "tb", label: "Terabytes (TB)", toBase: 1024 ** 4 },
];

export const TEMPERATURE_UNITS: UnitDef[] = [
  { id: "c", label: "Celsius (°C)", toBase: 0 },
  { id: "f", label: "Fahrenheit (°F)", toBase: 0 },
  { id: "k", label: "Kelvin (K)", toBase: 0 },
];

export function unitsForCategory(category: Category): UnitDef[] {
  switch (category) {
    case "length":
      return LENGTH_UNITS;
    case "weight":
      return WEIGHT_UNITS;
    case "digital":
      return DIGITAL_UNITS;
    case "temperature":
      return TEMPERATURE_UNITS;
  }
}

function celsiusToUnit(celsius: number, unit: string): number {
  switch (unit) {
    case "c":
      return celsius;
    case "f":
      return (celsius * 9) / 5 + 32;
    case "k":
      return celsius + 273.15;
    default:
      return NaN;
  }
}

function unitToCelsius(value: number, unit: string): number {
  switch (unit) {
    case "c":
      return value;
    case "f":
      return ((value - 32) * 5) / 9;
    case "k":
      return value - 273.15;
    default:
      return NaN;
  }
}

export function convert(category: Category, value: number, fromUnit: string, toUnit: string): number {
  if (category === "temperature") {
    return celsiusToUnit(unitToCelsius(value, fromUnit), toUnit);
  }
  const units = unitsForCategory(category);
  const from = units.find((u) => u.id === fromUnit);
  const to = units.find((u) => u.id === toUnit);
  if (!from || !to) return NaN;
  return (value * from.toBase) / to.toBase;
}

/** Trims floating point noise while keeping enough precision to be useful. */
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-9) return value.toExponential(6).replace(/\.?0+e/, "e");
  const precision = abs >= 1 ? 10 : 12;
  return Number.parseFloat(value.toPrecision(precision)).toString();
}
