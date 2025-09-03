import React from "react";

/**
 * Footer with dynamic nav links and optional social icons.
 *
 * Props:
 * - links: [{ label, href, current?: boolean }]   // primary footer links
 * - socials: [{ label, href, icon }]              // e.g. icon: 'bi-instagram'
 * - className: string                             // extra classes
 */
export default function Footer({
  links = [
    { label: "Explore", href: "/search" },
    { label: "Suppliers", href: "/supplier" },
  ],
  socials = [], // e.g. [{ label:'Instagram', href:'#', icon:'bi-instagram' }]
  className = "",
}) {
  return (
    <footer className={`bg-dark text-white-50 py-4 mt-auto ${className}`}>
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="small">© {new Date().getFullYear()} Local Activity Platform</div>

        {links?.length > 0 && (
          <nav className="d-flex gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`link-light link-opacity-75-hover ${l.current ? "text-decoration-underline" : ""}`}
                aria-current={l.current ? "page" : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {socials?.length > 0 && (
          <div className="d-flex align-items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                aria-label={s.label}
                className="link-light link-opacity-75-hover fs-5"
                target="_blank"
                rel="noreferrer"
                title={s.label}
              >
                {/* Bootstrap Icons class, e.g. bi-instagram */}
                <i className={`bi ${s.icon}`} />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
