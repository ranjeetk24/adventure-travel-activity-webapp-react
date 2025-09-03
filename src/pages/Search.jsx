import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getActivities, onActivitiesChanged } from '../services/activityService';
import Stars from '../components/Stars';
import SafeImg from '../components/SafeImg';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

// Utility: dedupe activities by stable id; fallback to name+price combo
function uniqueActivities(list) {
  const seen = new Set();
  const out = [];
  for (const a of list || []) {
    const key = a.id ?? `${a.name}|${a.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  }
  return out;
}

const SORTS = {
  relevance: { label: 'Relevance', cmp: null },
  priceAsc: { label: 'Price: Low to High', cmp: (a, b) => a.price - b.price },
  priceDesc: { label: 'Price: High to Low', cmp: (a, b) => b.price - a.price },
  nameAsc: { label: 'Name: A → Z', cmp: (a, b) => a.name.localeCompare(b.name) },
  nameDesc: { label: 'Name: Z → A', cmp: (a, b) => b.name.localeCompare(a.name) },
  ratingDesc: { label: 'Rating: High to Low', cmp: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) },
};

export default function Search() {
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [sortKey, setSortKey] = useState('relevance');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);

  // Numeric input temps for commit-on-blur/Enter
  const [tempMin, setTempMin] = useState('0');
  const [tempMax, setTempMax] = useState('10000');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const resultsTopRef = useRef(null);

  // Load data and listen for same-tab changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getActivities();
        if (!isMounted) return;
        const deduped = uniqueActivities(data);
        setAllActivities(deduped);
        // derive sensible default price bounds
        const prices = deduped.map(a => Number(a.price) || 0);
        const minP = prices.length ? Math.min(...prices) : 0;
        const maxP = prices.length ? Math.max(...prices) : 10000;
        setPriceMin(minP);
        setPriceMax(maxP);
        setTempMin(String(minP));
        setTempMax(String(maxP));
      } catch (e) {
        console.error(e);
        if (isMounted) setError('Failed to load activities.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    const unsub = onActivitiesChanged(async () => {
      const data = await getActivities();
      setAllActivities(uniqueActivities(data));
    });
    return () => {
      isMounted = false;
      unsub && unsub();
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    allActivities.forEach(a => a.category && set.add(a.category));
    return Array.from(set).sort();
  }, [allActivities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const catActive = selectedCats.size > 0;

    let list = allActivities.filter(a => {
      const inQuery = !q || (
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
      const inCat = !catActive || selectedCats.has(a.category);
      const inPrice = (Number(a.price) || 0) >= priceMin && (Number(a.price) || 0) <= priceMax;
      return inQuery && inCat && inPrice;
    });

    const sorter = SORTS[sortKey]?.cmp;
    if (sorter) list = [...list].sort(sorter);
    return list;
  }, [allActivities, query, selectedCats, sortKey, priceMin, priceMax]);

  // Reset to page 1 when filters/sort change
  useEffect(() => { setPage(1); }, [query, selectedCats, sortKey, priceMin, priceMax]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  // Scroll to results top when page changes
  useEffect(() => {
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, pageSize]);

  // Handlers
  const toggleCat = (cat) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const commitMin = () => {
    const v = Number(tempMin);
    if (!Number.isNaN(v)) {
      const clamped = Math.max(0, Math.min(v, priceMax));
      setPriceMin(clamped);
      setTempMin(String(clamped));
    }
  };
  const commitMax = () => {
    const v = Number(tempMax);
    if (!Number.isNaN(v)) {
      const clamped = Math.max(priceMin, v);
      setPriceMax(clamped);
      setTempMax(String(clamped));
    }
  };

  const Pagination = () => (
    <nav aria-label="Search results pages" className="d-flex justify-content-center my-3">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(1)} aria-label="First">«</button>
        </li>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous">‹</button>
        </li>
        {Array.from({ length: totalPages }).slice(Math.max(0, currentPage - 3), currentPage + 2).map((_, i) => {
          const pageNum = i + 1 + Math.max(0, currentPage - 3);
          if (pageNum > totalPages) return null;
          return (
            <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
            </li>
          );
        })}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next">›</button>
        </li>
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(totalPages)} aria-label="Last">»</button>
        </li>
      </ul>
    </nav>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border" role="status" aria-hidden="true"></div>
            <span>Loading activities…</span>
          </div>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center mb-3">
          <h1 className="h4 mb-0">Search Activities</h1>
          <div className="d-flex gap-2 align-items-center">
            <label htmlFor="sort" className="form-label mb-0 me-2">Sort</label>
            <select id="sort" className="form-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <label htmlFor="pageSize" className="form-label mb-0 ms-3 me-2">Page size</label>
            <select id="pageSize" className="form-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[6,9,12,18,24].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters */}
          <aside className="col-12 col-md-3">
            <div className="card shadow-sm position-sticky" style={{ top: '1rem' }}>
              <div className="card-body">
                {/* Keyword */}
                <div className="mb-3">
                  <label htmlFor="q" className="form-label">Keyword</label>
                  <div className="input-group">
                    <span className="input-group-text" id="q-icon" aria-hidden>🔎</span>
                    <input
                      id="q"
                      type="text"
                      className="form-control"
                      placeholder="Search by name, description, category…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-describedby="q-icon"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label mb-0">Categories</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedCats(new Set())}
                      disabled={selectedCats.size === 0}
                    >Clear</button>
                  </div>
                  <div className="mt-2" role="group" aria-label="Category filters">
                    {categories.length === 0 && <div className="text-muted small">No categories</div>}
                    {categories.map(cat => (
                      <div className="form-check" key={cat}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`cat-${cat}`}
                          checked={selectedCats.has(cat)}
                          onChange={() => toggleCat(cat)}
                        />
                        <label className="form-check-label" htmlFor={`cat-${cat}`}>{cat}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="form-label">Price range</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      onBlur={commitMin}
                      onKeyDown={(e) => e.key === 'Enter' && commitMin()}
                      aria-label="Minimum price"
                    />
                    <span className="text-muted">to</span>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      onBlur={commitMax}
                      onKeyDown={(e) => e.key === 'Enter' && commitMax()}
                      aria-label="Maximum price"
                    />
                  </div>

                  {/* Sliders (commit immediately) */}
                  <div className="mt-3">
                    <label htmlFor="minRange" className="form-label">Min: {priceMin}</label>
                    <input
                      id="minRange"
                      type="range"
                      className="form-range"
                      min="0"
                      max={priceMax}
                      value={priceMin}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setPriceMin(Math.min(v, priceMax));
                        setTempMin(String(Math.min(v, priceMax)));
                      }}
                    />
                    <label htmlFor="maxRange" className="form-label">Max: {priceMax}</label>
                    <input
                      id="maxRange"
                      type="range"
                      className="form-range"
                      min={priceMin}
                      max={Math.max(priceMax, priceMin)}
                      value={priceMax}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const clamped = Math.max(v, priceMin);
                        setPriceMax(clamped);
                        setTempMax(String(clamped));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="col-12 col-md-9">
            <div ref={resultsTopRef} />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="text-muted small">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setQuery('');
                  setSelectedCats(new Set());
                  const prices = allActivities.map(a => Number(a.price) || 0);
                  const minP = prices.length ? Math.min(...prices) : 0;
                  const maxP = prices.length ? Math.max(...prices) : 10000;
                  setPriceMin(minP); setPriceMax(maxP);
                  setTempMin(String(minP)); setTempMax(String(maxP));
                  setSortKey('relevance');
                }}
              >Reset all</button>
            </div>

            {filtered.length === 0 ? (
              <div className="alert alert-warning" role="alert">
                No activities match your filters. Try broadening your search.
              </div>
            ) : (
              <>
                <Pagination />
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                  {pageItems.map(a => (
                    <div className="col" key={a.id ?? `${a.name}|${a.price}`}>
                      <div className="card h-100 shadow-sm">
                        <SafeImg src={a.imageUrl} alt={a.name} className="card-img-top" />
                        <div className="card-body d-flex flex-column">
                          <h2 className="h6 mb-1 text-truncate" title={a.name}>{a.name}</h2>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Stars value={a.rating ?? 0} size="xs" />
                            {typeof a.rating === 'number' && (
                              <span className="small text-muted">{a.rating.toFixed(1)}</span>
                            )}
                          </div>
                          {a.category && <span className="badge text-bg-light align-self-start mb-2">{a.category}</span>}
                          <p className="small text-muted flex-grow-1 mb-2">{a.description || 'No description provided.'}</p>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="fw-bold">₹{Number(a.price).toLocaleString('en-IN')}</span>
                            <a href={`/activity/${a.id}`} className="btn btn-primary btn-sm">View</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination />
              </>
            )}
          </section>
        </div>
      </div>

      {/* Floating back-to-top */}
      <button
        type="button"
        className="btn btn-primary position-fixed"
        style={{ right: '1rem', bottom: '1rem' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        title="Back to top"
      >↑</button>
      <Footer
      links={[
           
            { label: "Suppliers", href: "/supplier" },
            { label: "Home", href: "/" },
          ]}
          socials={[
{ label: 'Facebook', href: 'https://facebook.com', icon: 'bi-facebook' },
{ label: 'Instagram', href: 'https://instagram.com', icon: 'bi-instagram' },
{ label: 'X', href: 'https://x.com', icon: 'bi-twitter-x' },
]}
      />
    </>
  );
}
