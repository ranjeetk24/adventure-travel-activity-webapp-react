
import React from "react";

/**
 * Skeleton placeholder for activity tiles.
 * Props:
 *  - variant: "default" | "compact" | "search"
 */
export default function SkeletonCard({ variant = "default" }) {
  const height =
    variant === "compact" ? 140 : variant === "search" ? 180 : 160;

  const wrapper = [
    "activity-card card",
    variant === "compact" ? "p-3" : "p-4",
  ].join(" ");

  return (
    <div className={wrapper} aria-hidden="true">
      <div
        className="skeleton skeleton-img mb-2 rounded-md"
        style={{ height }}
      />
      <div className="skeleton skeleton-text h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton skeleton-text h-3 w-1/2 mb-2 rounded" />
      <div className="skeleton skeleton-text h-3 w-1/3 mb-3 rounded" />
      <div className="flex gap-1">
        <div className="skeleton h-3 w-3 rounded" />
        <div className="skeleton h-3 w-3 rounded" />
        <div className="skeleton h-3 w-3 rounded" />
        <div className="skeleton h-3 w-3 rounded" />
        <div className="skeleton h-3 w-3 rounded" />
      </div>
    </div>
  );
}
