import type { SelectHTMLAttributes } from "react";
import { selectClass } from "../lib/styles";

/**
 * A native <select>'s default arrow renders flush against the browser's own
 * padding, which reads as "too close to the border" no matter how much
 * padding the element itself has: padding doesn't control where the native
 * widget draws its own icon. Fix: turn the native appearance off and draw a
 * real chevron in its place, positioned with intentional spacing.
 */
export default function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-block">
      <select {...props} className={`appearance-none pr-9 ${selectClass} ${className}`}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
