import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import './index.css';
// Layout wrapper
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Enroute Life</Link>
        <nav className="space-x-4">
          <Link to="/search" className="text-gray-600 hover:text-blue-600">Search</Link>
          <Link to="/booking" className="text-gray-600 hover:text-blue-600">My Bookings</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

// Home Page
function Home() {
  const categories = ["Adventure", "Cultural", "Food", "Wellness"];
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Discover Unique Activities</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat} className="p-4 border rounded-xl shadow bg-white text-center">
              {cat}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Search Page
function Search() {
  const [results] = useState([1, 2, 3, 4]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Search Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((id) => (
            <Link
              to={`/activity/${id}`}
              key={id}
              className="p-4 border rounded-xl shadow bg-white hover:shadow-lg"
            >
              <img src={`https://via.placeholder.com/400x200`} alt="activity" className="rounded-lg mb-2" />
              <h2 className="font-bold">Activity {id}</h2>
              <p className="text-sm text-gray-600">₹ {id * 500}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Activity Detail Page
function ActivityDetail() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <img src={`https://via.placeholder.com/600x300`} alt="activity" className="rounded-lg mb-4" />
        <h1 className="text-2xl font-bold mb-2">Activity {id}</h1>
        <p className="text-gray-700 mb-4">Highlights: AI summarized pros and cons will appear here.</p>
        <div className="mb-4">
          <strong>Inclusions:</strong>
          <ul className="list-disc list-inside text-gray-600">
            <li>Guide</li>
            <li>Equipment</li>
          </ul>
        </div>
        <Link to="/booking" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
          Book Now
        </Link>
      </div>
    </Layout>
  );
}

// Booking Page
function Booking() {
  const [bookings] = useState([
    { id: 1, date: "10 April 2025", time: "10:00 AM" },
    { id: 2, date: "12 April 2025", time: "2:00 PM" }
  ]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 border rounded-xl shadow bg-white mb-4">
            <h2 className="font-semibold">Activity {booking.id}</h2>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// Main App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/supplier" element={<Supplier />} />
        <Route path="/search" element={<Search />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </Router>
  );
}

export default App;