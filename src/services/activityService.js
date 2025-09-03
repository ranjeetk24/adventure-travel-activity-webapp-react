// services/activityService.js
// Robust localStorage-backed mock API with dedupe + change events + sample data seeding/regeneration

const ACT_KEY = 'lap_activities';
const BOOK_KEY = 'lap_bookings';
const PAYOUT_KEY = 'lap_payouts';

const picsum = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/400`;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dispatchChange(name) {
  window.dispatchEvent(new CustomEvent(name));
}

function normalizeActivity(a) {
  return {
    id: a.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: String(a.name || '').trim(),
    description: a.description ? String(a.description) : '',
    category: a.category ? String(a.category) : '',
    price: Number(a.price) || 0,
    rating: typeof a.rating === 'number' ? a.rating : 0,
    imageUrl: a.imageUrl && a.imageUrl.trim() ? a.imageUrl : picsum(a.name || 'activity'),
  };
}

function uniqueByIdOrSignature(list) {
  const seen = new Set();
  const out = [];
  for (const a of list) {
    const key = a.id ?? `${a.name}|${a.price}`;
    if (!seen.has(key)) { seen.add(key); out.push(a); }
  }
  return out;
}

// ---- Public API: Activities ----
export async function getActivities() {
  return seedIfEmpty();
}

export async function addActivity(activity) {
  const all = load(ACT_KEY, []);
  const normalized = normalizeActivity(activity);
  const exists = all.some(a => (a.id && normalized.id && a.id === normalized.id) || (a.name === normalized.name && a.price === normalized.price));
  const next = exists ? all : uniqueByIdOrSignature([normalized, ...all]);
  save(ACT_KEY, next);
  dispatchChange('activities:changed');
  return normalized;
}

// ---- Public API: Bookings ----
export async function getBookings() { return load(BOOK_KEY, []); }
export async function addBooking(booking) {
  const all = load(BOOK_KEY, []);
  const normalized = {
    id: booking.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    activityId: booking.activityId ?? null,
    activityName: booking.activityName ?? 'Activity',
    customerName: booking.customerName ?? 'Customer',
    quantity: Number(booking.quantity ?? 1) || 1,
    amount: Number(booking.amount ?? 0) || 0,
    date: booking.date ? new Date(booking.date).toISOString() : new Date().toISOString(),
  };
  const next = [normalized, ...all];
  save(BOOK_KEY, next);
  dispatchChange('bookings:changed');
  return normalized;
}

// ---- Public API: Payouts ----
export async function getPayouts() { return load(PAYOUT_KEY, []); }
export async function addPayout(payout) {
  const all = load(PAYOUT_KEY, []);
  const normalized = {
    id: payout.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount: Number(payout.amount ?? 0) || 0,
    status: payout.status ?? 'scheduled',
    date: payout.date ? new Date(payout.date).toISOString() : new Date().toISOString(),
  };
  const next = [normalized, ...all];
  save(PAYOUT_KEY, next);
  dispatchChange('payouts:changed');
  return normalized;
}

// ---- Clear helpers ----
export async function clearBookings() { save(BOOK_KEY, []); dispatchChange('bookings:changed'); }
export async function clearPayouts() { save(PAYOUT_KEY, []); dispatchChange('payouts:changed'); }

// ---- Subscribe helpers ----
export function onActivitiesChanged(handler) { const fn = () => handler(); window.addEventListener('activities:changed', fn); return () => window.removeEventListener('activities:changed', fn); }
export function onBookingsChanged(handler) { const fn = () => handler(); window.addEventListener('bookings:changed', fn); return () => window.removeEventListener('bookings:changed', fn); }
export function onPayoutsChanged(handler) { const fn = () => handler(); window.addEventListener('payouts:changed', fn); return () => window.removeEventListener('payouts:changed', fn); }

// ---- Seeding helpers ----
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export async function seedSampleBookingsAndPayouts({ bookings = 8, payouts = 3, replace = false } = {}) {
  // Ensure activities exist to link to
  const acts = await getActivities();
  const actsSafe = acts.length ? acts : seedIfEmpty();

  const today = new Date();
  const mkDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  const customers = ['A. Sharma', 'R. Iyer', 'K. Singh', 'P. Gupta', 'N. Rao', 'S. Das'];

  // Seed bookings
  let allBookings = replace ? [] : load(BOOK_KEY, []);
  for (let i = 0; i < bookings; i++) {
    const act = randomChoice(actsSafe);
    const qty = 1 + Math.floor(Math.random() * 4);
    const when = mkDate(-7 + Math.floor(Math.random() * 21)); // within -7..+13 days
    allBookings.unshift({
      id: `${Date.now()}_${i}_b`,
      activityId: act.id,
      activityName: act.name,
      customerName: randomChoice(customers),
      quantity: qty,
      amount: qty * (Number(act.price) || 0),
      date: when,
    });
  }
  save(BOOK_KEY, allBookings);
  dispatchChange('bookings:changed');

  // Seed payouts
  let allPayouts = replace ? [] : load(PAYOUT_KEY, []);
  const statuses = ['paid', 'pending', 'scheduled'];
  for (let i = 0; i < payouts; i++) {
    const amt = 2000 + Math.floor(Math.random() * 8000);
    const when = mkDate(-14 + Math.floor(Math.random() * 28));
    allPayouts.unshift({ id: `${Date.now()}_${i}_p`, amount: amt, status: randomChoice(statuses), date: when });
  }
  save(PAYOUT_KEY, allPayouts);
  dispatchChange('payouts:changed');
}

// ---- Initial seed for activities ----
function seedIfEmpty() {
  let items = load(ACT_KEY, []);
  if (items.length > 0) return items;
  items = [
    {
      id: 'ex_1',
      name: 'Old Delhi Food Walk',
      description: 'Guided tasting tour through Chandni Chowk with street eats.',
      category: 'Food',
      price: 1200,
      rating: 4.6,
      imageUrl: picsum('delhi-food-walk'),
    },
    {
      id: 'ex_2',
      name: 'Goa Kayaking Sunset',
      description: 'Leisurely paddle through calm backwaters at golden hour.',
      category: 'Water Sports',
      price: 1800,
      rating: 4.4,
      imageUrl: picsum('goa-kayak-sunset'),
    },
    {
      id: 'ex_3',
      name: 'Hampi Heritage Cycle Tour',
      description: 'Morning cycle past ruins and boulder hills with guide.',
      category: 'Sightseeing',
      price: 1500,
      rating: 4.7,
      imageUrl: picsum('hampi-cycle'),
    },
  ];
  save(ACT_KEY, items);
  return items;
}
