import React from "react";

/**
 * Display-only star rating (no halves)
 * Props:
 *  - value: number (0–5)
 *  - size: number (px) -> default 12
 *  - showValue: boolean -> default false
 *  - className: string
 */
export default function Stars({ value = 0, size = 12, showValue = false, className = "" }) {
  const valNum = Number(value) || 0;
  const full = Math.max(0, Math.min(5, Math.round(valNum)));
  const empty = 5 - full;

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} color="#EAB308" />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={size} color="#D1D5DB" />
      ))}
      {showValue && (
        <span style={{ fontSize: Math.max(10, Math.floor(size * 0.9)), color: "#4B5563" }}>
          {valNum.toFixed(1)}
        </span>
      )}
    </span>
  );
}

function Star({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        fill={color}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.967 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 0 0 .95-.69l1.17-3.292z"
      />
    </svg>
  );
}
