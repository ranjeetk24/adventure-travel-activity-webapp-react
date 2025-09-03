import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import SafeImg from '../components/SafeImg';
import Stars from '../components/Stars';
import Footer from "../components/Footer";

import {
  addActivity,
  getActivities,
  getBookings,
  getPayouts,
  onActivitiesChanged,
  onBookingsChanged,
  onPayoutsChanged,
  seedSampleBookingsAndPayouts,
} from '../services/activityService';

// --------- Helpers ---------
const fmt = new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long' });

function toISODate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseBooking(raw) {
  const dateRaw = raw?.date || raw?.bookingDate || raw?.startDate || raw?.when;
  const date = dateRaw ? new Date(dateRaw) : null;
  return {
    id: raw?.id || `${Math.random().toString(36).slice(2)}`,
    activityId: raw?.activityId || raw?.activity?.id || null,
    activityName: raw?.activityName || raw?.activity?.name || 'Activity',
    customerName: raw?.customerName || raw?.customer || 'Customer',
    quantity: Number(raw?.quantity ?? raw?.qty ?? 1) || 1,
    amount: Number(raw?.amount ?? 0) || 0,
    date,
    dateKey: date ? toISODate(date) : null,
  };
}

function parsePayout(raw) {
  const dateRaw = raw?.date || raw?.payoutDate || raw?.processedAt;
  const date = dateRaw ? new Date(dateRaw) : null;
  return {
    id: raw?.id || `${Math.random().toString(36).slice(2)}`,
    amount: Number(raw?.amount ?? 0) || 0,
    status: raw?.status || 'scheduled',
    date,
  };
}

function sum(nums) { return nums.reduce((a, b) => a + b, 0); }

export default function SupplierDashboard() {
  // --- Form state ---
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- Data ---
  const [activities, setActivities] = useState([]);
  const [bookingsRaw, setBookingsRaw] = useState([]);
  const [payoutsRaw, setPayoutsRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived normalized data
  const bookings = useMemo(() => bookingsRaw.map(parseBooking).filter(b => b.date), [bookingsRaw]);
  const payouts = useMemo(() => payoutsRaw.map(parsePayout), [payoutsRaw]);

  // --- Pagination for activities grid ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const gridTopRef = useRef(null);

  // --- Calendar state ---
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = useState(toISODate(new Date()));

  // ----- Effects: initial load & subscriptions -----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, b, p] = await Promise.all([
          getActivities(),
          getBookings(),
          getPayouts(),
        ]);
        if (!mounted) return;
        setActivities(Array.isArray(a) ? a : []);
        setBookingsRaw(Array.isArray(b) ? b : []);
        setPayoutsRaw(Array.isArray(p) ? p : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const unsubActs = onActivitiesChanged(async () => {
      const a = await getActivities();
      setActivities(Array.isArray(a) ? a : []);
    });
    const unsubBooks = onBookingsChanged(async () => {
      const b = await getBookings();
      setBookingsRaw(Array.isArray(b) ? b : []);
    });
    const unsubPays = onPayoutsChanged(async () => {
      const p = await getPayouts();
      setPayoutsRaw(Array.isArray(p) ? p : []);
    });
    return () => { mounted = false; unsubActs && unsubActs(); unsubBooks && unsubBooks(); unsubPays && unsubPays(); };
  }, []);

  const categories = useMemo(() => {
    const s = new Set();
    activities.forEach(a => a.category && s.add(a.category));
    return Array.from(s).sort();
  }, [activities]);

  // --- Pagination derived ---
  const totalPages = Math.max(1, Math.ceil(activities.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = activities.slice(start, end);

  useEffect(() => { setPage(1); }, [activities.length, pageSize]);
  useEffect(() => {
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage, pageSize]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!category.trim()) e.category = 'Category is required';
    const pr = Number(price);
    if (Number.isNaN(pr) || pr <= 0) e.price = 'Enter a valid price';
    const rt = rating === '' ? null : Number(rating);
    if (rt !== null && (Number.isNaN(rt) || rt < 0 || rt > 5)) e.rating = 'Rating must be 0–5';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setName(''); setCategory(''); setPrice(''); setRating(''); setImageUrl(''); setDescription('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addActivity({ name, category, price: Number(price), rating: rating === '' ? 0 : Number(rating), imageUrl, description });
      setMessage('Activity saved');
      resetForm();
    } catch (err) {
      setMessage('Failed to save activity');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const Pagination = () => (
    <nav aria-label="Activities pages" className="d-flex justify-content-center my-3">
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

  // ---- Calendar derived data ----
  const bookingsByDay = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      if (!b.dateKey) continue;
      const arr = map.get(b.dateKey) || [];
      arr.push(b);
      map.set(b.dateKey, arr);
    }
    return map;
  }, [bookings]);

  function nextMonth(date, delta) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + delta);
    d.setDate(1);
    return d;
  }

  const monthGrid = useMemo(() => {
    // Build 6 weeks * 7 days grid starting from Sunday of the first week
    const first = new Date(calMonth);
    first.setDate(1);
    const firstDay = first.getDay(); // 0=Sun
    const start = new Date(first);
    start.setDate(first.getDate() - firstDay);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const inMonth = d.getMonth() === calMonth.getMonth();
      const key = toISODate(d);
      const dayBookings = bookingsByDay.get(key) || [];
      cells.push({ date: d, inMonth, key, dayBookings });
    }
    return cells;
  }, [calMonth, bookingsByDay]);

  // ---- Payouts derived ----
  const totalPayout = useMemo(() => sum(payouts.map(p => p.amount)), [payouts]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border" role="status" aria-hidden="true"></div>
            <span>Loading…</span>
          </div>
            
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h4 mb-3">Supplier Dashboard</h1>

        <div className="row g-4">
          {/* Form */}
          <div className="col-12 col-xl-4">
            <div className="card shadow-sm position-sticky" style={{ top: '1rem' }}>
              <div className="card-body">
                <h2 className="h6">Add / Update Activity</h2>
                {message && <div className="alert alert-info py-2 my-2">{message}</div>}
                <form onSubmit={onSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={name} onChange={e => setName(e.target.value)} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="category">Category</label>
                    <input id="category" className={`form-control ${errors.category ? 'is-invalid' : ''}`} value={category} onChange={e => setCategory(e.target.value)} list="categoryList" />
                    <datalist id="categoryList">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="price">Price (₹)</label>
                    <input id="price" type="number" min="0" className={`form-control ${errors.price ? 'is-invalid' : ''}`} value={price} onChange={e => setPrice(e.target.value)} />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="rating">Rating (0–5)</label>
                    <input id="rating" type="number" step="0.1" min="0" max="5" className={`form-control ${errors.rating ? 'is-invalid' : ''}`} value={rating} onChange={e => setRating(e.target.value)} />
                    {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="imageUrl">Image URL</label>
                    <input id="imageUrl" className="form-control" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Optional; fallback used if empty" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea id="description" className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="d-grid">
                    <button disabled={saving} className="btn btn-primary" type="submit">
                      {saving ? 'Saving…' : 'Save Activity'}
                    </button>
                  </div>

<div className="d-grid">
  <button
    type="button"
    onClick={() => {
      localStorage.clear();
      window.location.reload(); // refresh so state resets
    }}
    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700"
  >
    Clear Local Storage
  </button>
</div>
                </form>
              </div>
            </div>
            
          </div>

          {/* Right column: Activities grid + Calendar + Payouts */}
          <div className="col-12 col-xl-8">
            {/* Activities Grid with pagination */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h6 mb-0">Your Activities</h2>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="pageSize" className="form-label mb-0">Page size</label>
                <select id="pageSize" className="form-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  {[4,8,12,16,24].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div ref={gridTopRef} />
            <Pagination />
            {activities.length === 0 ? (
              <div className="alert alert-secondary">No activities yet. Add your first one using the form.</div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 mb-3">
                {pageItems.map(a => (
                  <div className="col" key={a.id}>
                    <div className="card h-100 shadow-sm">
                      <SafeImg src={a.imageUrl} alt={a.name} className="card-img-top" />
                      <div className="card-body d-flex flex-column">
                        <h3 className="h6 mb-1 text-truncate" title={a.name}>{a.name}</h3>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge text-bg-light">{a.category || 'Uncategorized'}</span>
                          <Stars value={a.rating ?? 0} size="xs" />
                          {typeof a.rating === 'number' && <span className="small text-muted">{a.rating.toFixed(1)}</span>}
                        </div>
                        <p className="small text-muted flex-grow-1 mb-2">{a.description || '—'}</p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className="fw-bold">₹{Number(a.price).toLocaleString('en-IN')}</span>
                          <a href={`/activity/${a.id}`} className="btn btn-outline-primary btn-sm">View</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination />

            {/* Booking Calendar */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 mb-0">Bookings Calendar</h2>
                  <div className="d-flex align-items-center gap-2">
                    <div className="btn-group me-2" role="group" aria-label="Change month">
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setCalMonth(m => nextMonth(m, -1))}>‹ Prev</button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setCalMonth(() => { const n = new Date(); n.setDate(1); return n; })}>Today</button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setCalMonth(m => nextMonth(m, 1))}>Next ›</button>
                    </div>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={async () => { await seedSampleBookingsAndPayouts({ bookings: 10, payouts: 0, replace: false }); }}
                      >Add sample bookings</button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={async () => { await seedSampleBookingsAndPayouts({ bookings: 10, payouts: 0, replace: true }); }}
                      >Regenerate bookings</button>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-semibold">{fmtMonth.format(calMonth)}</div>
                  <div className="small text-muted">Click a date to view bookings</div>
                </div>

                {/* Calendar table for perfect alignment */}
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                          <th key={d} className="small fw-semibold">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const weeks = [];
                        for (let i = 0; i < monthGrid.length; i += 7) weeks.push(monthGrid.slice(i, i + 7));
                        const todayKey = toISODate(new Date());
                        return weeks.map((week, wi) => (
                          <tr key={wi}>
                            {week.map((cell) => (
                              <td
                                key={cell.key}
                                className={`${cell.inMonth ? '' : 'text-muted bg-light'} ${selectedDateKey === cell.key ? 'table-primary' : ''} ${todayKey === cell.key ? 'border border-primary' : ''}`}
                                style={{ width: '14.28%', minWidth: 90, minHeight: 80 }}
                              >
                                <button
                                  className={`btn btn-sm w-100 ${selectedDateKey === cell.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => setSelectedDateKey(cell.key)}
                                >
                                  <div className="fw-semibold">{cell.date.getDate()}</div>
                                  {cell.dayBookings.length > 0 && (
                                    <span className="badge text-bg-success">{cell.dayBookings.length}</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Selected day bookings list */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">{selectedDateKey}</div>
                    <div className="small text-muted">{bookingsByDay.get(selectedDateKey)?.length || 0} booking(s)</div>
                  </div>
                  <div className="list-group mt-2">
                    {(bookingsByDay.get(selectedDateKey) || []).map(b => (
                      <div key={b.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{b.activityName}</div>
                          <div className="small text-muted">{b.customerName} • {b.quantity} pax</div>
                        </div>
                        <div className="fw-semibold">₹{b.amount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                    {(!bookingsByDay.get(selectedDateKey) || bookingsByDay.get(selectedDateKey).length === 0) && (
                      <div className="list-group-item text-muted">No bookings on this date.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payouts */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 mb-0">Payouts</h2>
                  <div className="d-flex align-items-center gap-2">
                    <div className="small text-muted">Total: <span className="fw-semibold">₹{totalPayout.toLocaleString('en-IN')}</span></div>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={async () => { await seedSampleBookingsAndPayouts({ bookings: 0, payouts: 3, replace: false }); }}
                      >Add sample payouts</button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={async () => { await seedSampleBookingsAndPayouts({ bookings: 0, payouts: 3, replace: true }); }}
                      >Regenerate payouts</button>
                    </div>
                  </div>
                </div>
                {payouts.length === 0 ? (
                  <div className="alert alert-secondary mb-0">No payouts yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th className="text-end">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map(p => (
                          <tr key={p.id}>
                            <td>{p.date ? fmt.format(p.date) : '—'}</td>
                            <td>
                              <span className={`badge ${p.status === 'paid' ? 'text-bg-success' : p.status === 'pending' ? 'text-bg-warning' : 'text-bg-secondary'}`}>{p.status}</span>
                            </td>
                            <td className="text-end">{p.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Simple summaries */}
        <div className="row g-3 mt-4">
          <div className="col-12 col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-muted small">Total Activities</div>
                <div className="h4 mb-0">{activities.length}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-muted small">Bookings</div>
                <div className="h4 mb-0">{bookings.length}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-muted small">Payouts</div>
                <div className="h4 mb-0">{payouts.length}</div>
              </div>
            </div>
          </div>
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
         
            { label: "Explore", href: "/search" },
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
