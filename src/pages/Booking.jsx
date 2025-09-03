import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { BookingContext } from "../context/BookingContext";

export default function Booking() {
  const { activities, addBooking } = useContext(BookingContext);
  const [form, setForm] = useState({ activity: "", date: "", time: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.activity || !form.date || !form.time) return;
    addBooking(form);
    setForm({ activity: "", date: "", time: "" });
    alert("Booking created!");
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Book an Activity</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Activity</option>
            {activities.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} - ₹{a.price}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Book
          </button>
        </form>
      </div>
    </div>
  );
}
