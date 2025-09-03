import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SafeImg from '../components/SafeImg';
import Stars from '../components/Stars';
import { getActivities, getBookings, onActivitiesChanged, onBookingsChanged } from '../services/activityService';
import Footer from '../components/Footer';

// ---------- Utils ----------
function uniqueActivities(list) {
  const seen = new Set();
  const out = [];
  for (const a of Array.isArray(list) ? list : []) {
    const key = a?.id ?? `${a?.name}|${a?.price}`;
    if (!seen.has(key)) { seen.add(key); out.push(a); }
  }
  return out;
}

function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle|ok|err
  const [msg, setMsg] = React.useState('');

  const saveEmail = (em) => {
    try {
      const key = 'lap_newsletter_emails';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      if (!arr.includes(em)) arr.push(em);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const em = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    if (!valid) { setStatus('err'); setMsg('Please enter a valid email.'); return; }
    saveEmail(em);
    setStatus('ok'); setMsg('Thanks! You are subscribed.'); setEmail('');
    setTimeout(() => { setStatus('idle'); setMsg(''); }, 3000);
  };

  return (
    <form className="input-group" onSubmit={onSubmit} noValidate>
      <span className="input-group-text" aria-hidden>@</span>
      <input type="email" className="form-control" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
      <button className="btn btn-primary" type="submit">Subscribe</button>
      {status !== 'idle' && (
        <div className={`form-text ms-2 ${status === 'err' ? 'text-danger' : 'text-success'}`}>{msg}</div>
      )}
    </form>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  // Initial load + live subscriptions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [acts, books] = await Promise.all([getActivities(), getBookings()]);
        if (!mounted) return;
        setActivities(uniqueActivities(acts));
        setBookings(Array.isArray(books) ? books : []);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load activities.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const unsubA = onActivitiesChanged(async () => {
      const data = await getActivities();
      setActivities(uniqueActivities(data));
    });
    const unsubB = onBookingsChanged(async () => {
      const b = await getBookings();
      setBookings(Array.isArray(b) ? b : []);
    });

    return () => { mounted = false; unsubA && unsubA(); unsubB && unsubB(); };
  }, []);

  // Derived data
  const categories = useMemo(() => {
    const map = new Map();
    for (const a of activities) {
      const cat = a?.category;
      if (!cat) continue;
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [activities]);

  const featured = useMemo(() => {
    const copy = [...activities];
    copy.sort((a, b) => (b?.rating ?? 0) - (a?.rating ?? 0));
    return copy.slice(0, 6);
  }, [activities]);

  const trending = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const counts = new Map();
    for (const bk of Array.isArray(bookings) ? bookings : []) {
      const t = bk?.date ? new Date(bk.date).getTime() : (bk?.bookingDate ? new Date(bk.bookingDate).getTime() : null);
      if (t && t >= since) {
        const id = bk.activityId;
        counts.set(id, (counts.get(id) || 0) + (Number(bk.quantity ?? 1) || 1));
      }
    }
    const withCounts = activities.map(a => ({ a, c: counts.get(a.id) || 0 }));
    withCounts.sort((x, y) => y.c - x.c || (y.a?.rating ?? 0) - (x.a?.rating ?? 0));
    return withCounts.slice(0, 6).map(x => x.a);
  }, [activities, bookings]);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <>
      <Navbar />

      {/* Home with video background */}
      <section className="text-white d-flex align-items-center position-relative" style={{ minHeight: '100vh' }} aria-label="About Local Activity Platform">
        <video className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover hero-video" style={{ objectFit: 'cover' }} autoPlay muted loop playsInline preload="metadata" poster="/hero-poster.jpg">
          <source src="/kayaking.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.55)' }} />
        <div className="container py-5 position-relative text-center">
          <h1 className="display-4 fw-bold mb-3">Book unique experiences, run by locals</h1>
          <p className="lead mb-4">We connect curious explorers with independent suppliers — from neighbourhood food walks to hidden-waterway kayaking.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
            <span className="badge text-bg-light text-dark">✨ Curated & local</span>
            <span className="badge text-bg-light text-dark">⚡ Fast booking</span>
            <span className="badge text-bg-light text-dark">🛡️ Secure payouts</span>
            <span className="badge text-bg-light text-dark">📅 Flexible scheduling</span>
          </div>
          <div className="d-flex justify-content-center gap-2">
            <a className="btn btn-primary btn-lg" href="/search">Explore activities</a>
            <a className="btn btn-outline-light btn-lg" href="/supplier">Become a supplier</a>
          </div>
        </div>
      </section>

      {/* Discover band */}
      <section className="py-5 bg-body-tertiary">
        <div className="container text-center">
          <div className="p-4 rounded-3 shadow-sm bg-white">
            <h2 className="h3 fw-semibold mb-2">Discover local activities near you</h2>
            <p className="text-muted mb-3">Search by category, price, or rating — then book in seconds.</p>
            <form className="input-group input-group-lg justify-content-center" onSubmit={onSubmit} role="search" aria-label="Search activities" style={{maxWidth: '700px', margin: '0 auto'}}>
              <span className="input-group-text" aria-hidden>🔎</span>
              <input className="form-control form-control-lg" type="text" placeholder="Try 'kayak', 'food', 'heritage'…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn btn-primary btn-lg" type="submit">Search</button>
            </form>
            <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center">
              {categories.map(([cat]) => (
                <a key={cat} className="btn btn-outline-secondary btn-sm" href={`/search?query=${encodeURIComponent(cat)}`}>{cat}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="p-4 rounded-3 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Featured Experiences</h2>
              <a className="btn btn-outline-secondary btn-sm" href="/search">View all</a>
            </div>
            {loading ? (
              <div className="d-flex align-items-center gap-2">
                <div className="spinner-border" role="status" aria-hidden="true"></div>
                <span>Loading…</span>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">{error}</div>
            ) : featured.length === 0 ? (
              <div className="alert alert-secondary">No activities yet. Add one from the Supplier Dashboard.</div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                {featured.map(a => (
                  <div className="col" key={a?.id ?? `${a?.name}|${a?.price}`}>
                    <div className="card h-100 shadow-sm">
                      <SafeImg src={a?.imageUrl} alt={a?.name} className="card-img-top" />
                      <div className="card-body d-flex flex-column">
                        <h3 className="h6 mb-1 text-truncate" title={a?.name}>{a?.name}</h3>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Stars value={a?.rating ?? 0} size="xs" />
                          {typeof a?.rating === 'number' && (
                            <span className="small text-muted">{a?.rating.toFixed(1)}</span>
                          )}
                        </div>
                        {a?.category && <span className="badge text-bg-light align-self-start mb-2">{a?.category}</span>}
                        <p className="small text-muted flex-grow-1 mb-2">{a?.description || 'No description provided.'}</p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className="fw-bold">₹{Number(a?.price).toLocaleString('en-IN')}</span>
                          <a href={`/activity/${a?.id}`} className="btn btn-primary btn-sm">View</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="p-4 rounded-3 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Trending near you</h2>
              <a className="btn btn-outline-secondary btn-sm" href="/search">Explore</a>
            </div>
            {trending.length === 0 ? (
              <div className="text-muted">No recent bookings yet. Check back soon!</div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                {trending.map(a => (
                  <div className="col" key={a?.id ?? `${a?.name}|${a?.price}`}>
                    <div className="card h-100 shadow-sm">
                      <SafeImg src={a?.imageUrl} alt={a?.name} className="card-img-top" />
                      <div className="card-body d-flex flex-column">
                        <h3 className="h6 mb-1 text-truncate" title={a?.name}>{a?.name}</h3>
                        {a?.category && <span className="badge text-bg-light align-self-start mb-2">{a?.category}</span>}
                        <p className="small text-muted flex-grow-1 mb-2">{a?.description || '—'}</p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className="fw-bold">₹{Number(a?.price).toLocaleString('en-IN')}</span>
                          <a href={`/activity/${a?.id}`} className="btn btn-outline-primary btn-sm">View</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-5 bg-body-tertiary">
        <div className="container text-center">
          <div className="p-4 rounded-3 shadow-sm bg-white">
            <h2 className="h4 mb-3 text-center">Top Categories</h2>
            {categories.length === 0 ? (
              <div className="text-muted">No categories yet.</div>
            ) : (
              <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-3 justify-content-center">
                {categories.map(([cat, count]) => (
                  <div className="col" key={cat}>
                    <a href={`/search?query=${encodeURIComponent(cat)}`} className="text-decoration-none">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column align-items-center">
                          <div className="fw-semibold mb-1">{cat}</div>
                          <div className="small text-muted">{count} {count === 1 ? 'activity' : 'activities'}</div>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-5 bg-body-tertiary">
        <div className="container text-center">
          <div className="p-4 rounded-3 shadow-sm bg-white">
            <h2 className="h5 mb-1">Get new activities in your inbox</h2>
            <p className="text-muted mb-3">We’ll send you occasional updates. No spam.</p>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="p-4 rounded-3 shadow-sm bg-white text-center">
            <h2 className="h5 mb-1">Are you a local supplier?</h2>
            <p className="text-muted mb-3">List your activity and reach more customers today.</p>
            <a className="btn btn-outline-primary" href="/supplier">Open Supplier Dashboard</a>
          </div>
        </div>
      </section>

      <Footer
        links={[
          { label: 'Explore', href: '/search' },
          { label: 'Suppliers', href: '/supplier' },
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
