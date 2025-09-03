
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const BookingContext = createContext(null);

// localStorage keys
const LS = {
  activities: "lap_activities",
  bookings: "lap_bookings",
  payouts: "lap_payouts",
};

const lsGet = (k, fb) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
};
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Seed data (only used if no local data yet)
const DEMO_ACTIVITIES = [
  {
    id: "a1",
    name: "River Rafting Rishikesh",
    category: "Adventure",
    price: 1500,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1520975922284-c0d61b1a636c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "a2",
    name: "Jaipur Heritage Walk",
    category: "Cultural",
    price: 800,
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1582571352032-448f7928eca3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "a3",
    name: "Goa Scuba Try Dive",
    category: "Adventure",
    price: 3500,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1544551763-7ef038aef4c5?q=80&w=1200&auto=format&fit=crop",
  },
];

const DEMO_BOOKINGS = [
  { id: "b1", activity: "River Rafting Rishikesh", date: "2025-09-05", time: "10:00" },
  { id: "b2", activity: "Jaipur Heritage Walk", date: "2025-09-05", time: "08:00" },
  { id: "b3", activity: "Goa Scuba Try Dive",    date: "2025-09-06", time: "12:30" },
];

const DEMO_PAYOUTS = { totalRevenue: 125000, pending: 18000, nextPayoutDate: "2025-09-10" };

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

export function BookingProvider({ children }) {
  const [activities, setActivities] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [payouts, setPayouts] = useState(null);

  // Load from localStorage (or seed)
  useEffect(() => {
    const a = lsGet(LS.activities, null);
    const b = lsGet(LS.bookings, null);
    const p = lsGet(LS.payouts, null);
    setActivities(Array.isArray(a) ? a : DEMO_ACTIVITIES);
    setBookings(Array.isArray(b) ? b : DEMO_BOOKINGS);
    setPayouts(p && typeof p === "object" ? p : DEMO_PAYOUTS);
  }, []);

  // Persist after first load
  useEffect(() => { if (activities) lsSet(LS.activities, activities); }, [activities]);
  useEffect(() => { if (bookings)   lsSet(LS.bookings, bookings);   }, [bookings]);
  useEffect(() => { if (payouts)    lsSet(LS.payouts, payouts);     }, [payouts]);

  const addNewActivity = useCallback((payload) => {
    setActivities(prev0 => {
      const prev = Array.isArray(prev0) ? prev0 : [];
      const exists = prev.some(x =>
        x.name?.trim().toLowerCase() === payload.name?.trim().toLowerCase() &&
        (x.category || "General") === (payload.category || "General") &&
        Number(x.price) === Number(payload.price)
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: uid(),
          name: payload.name?.trim() || "Untitled",
          category: payload.category || "General",
          price: Number(payload.price) || 0,
          rating: Math.max(0, Math.min(5, Number(payload.rating) || 0)),
          imageUrl: payload.imageUrl || "",
        },
      ];
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(LS.activities);
    localStorage.removeItem(LS.bookings);
    localStorage.removeItem(LS.payouts);
    setActivities(DEMO_ACTIVITIES);
    setBookings(DEMO_BOOKINGS);
    setPayouts(DEMO_PAYOUTS);
  }, []);

  const value = useMemo(() => ({
    activities: activities || [], // pages can render even on first tick
    bookings: bookings || [],
    payouts: payouts || {},
    addNewActivity,
    resetAll,
  }), [activities, bookings, payouts, addNewActivity, resetAll]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
