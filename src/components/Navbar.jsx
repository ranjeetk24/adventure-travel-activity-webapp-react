import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";


/**
 * Enhanced Navbar
 * - Fixed top, transparent over Home hero, solid on scroll/other pages
 * - Active link highlighting via NavLink
 * - Quick search (desktop), navigates to /search?query=...
 * - Login dropdown (Sign In / Sign Up)
 * - Dark-mode toggle using Bootstrap 5.3 data-bs-theme
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("lap_theme") || "light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("lap_theme", theme);
  }, [theme]);

  const navClass = useMemo(() => {
    const base = "navbar navbar-expand-lg fixed-top py-2";
    if (isHome && !scrolled) return `${base} navbar-dark bg-transparent`;
    return `${base} navbar-light bg-white shadow-sm`;
  }, [isHome, scrolled]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?query=${encodeURIComponent(q)}` : "/search");
    setQuery("");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      {/* Small global style: add top padding when navbar is solid (not overlaying the hero) */}
      <style>{`
        .navbar-brand { font-weight: 700; letter-spacing: 0.2px; }
        .lap-nav-spacer { height: 56px; }
        @media (min-width: 992px) { .lap-nav-spacer { height: 64px; } }
      `}</style>

      <nav className={navClass} role="navigation" aria-label="Primary">
        <div className="container">
         <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
  <img
  src="/logo.svg"
  alt="LAP logo"
  className="rounded-circle"
  width={32}
  height={32}
/>
  {/* Text visible only on lg+ screens */}
  <span className="fw-bold d-none d-lg-inline">LAP</span>
</NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Explore</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/supplier" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Suppliers</NavLink>
              </li>
            </ul>

            {/* Quick Search (desktop) */}
            <form className="d-none d-lg-flex" role="search" onSubmit={onSearch}>
              <div className="input-group input-group-sm">
                <span className="input-group-text">🔎</span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search activities"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={toggleTheme} title="Toggle theme">
                <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`}></i>
              </button>
              <div className="dropdown">
                <button className="btn btn-primary btn-sm dropdown-toggle" type="button" id="loginMenu" data-bs-toggle="dropdown" aria-expanded="false">
                  Login
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="loginMenu">
                  <li><a className="dropdown-item" href="/login">Sign In</a></li>
                  <li><a className="dropdown-item" href="/signup">Sign Up</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer so content isn't hidden under the fixed navbar when it's solid */}
      {!(isHome && !scrolled) && <div className="lap-nav-spacer" aria-hidden></div>}
    </>
  );
}
