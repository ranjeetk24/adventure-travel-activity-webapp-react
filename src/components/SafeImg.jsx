
import React from "react";

export default function SafeImg({
  src,
  alt,
  width = "100%",
  height = 160,
  className = "",
  fallbackSeed = "activity",
}) {
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/800/450`;
  const safeSrc = src && src.startsWith("http") ? src : fallback;

  return (
    <img
      src={safeSrc}
      alt={alt || ""}
      className={className}
      style={{ width, height, objectFit: "cover" }}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
}
