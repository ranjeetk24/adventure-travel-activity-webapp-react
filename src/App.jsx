import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/Search";
import ActivityDetail from "./pages/ActivityDetail";
import Booking from "./pages/Booking";
import SupplierDashboard from "./pages/SupplierDashboard";

export default function App() {
  return (
    <Routes>
    
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/activity/:id" element={<ActivityDetail />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/supplier" element={<SupplierDashboard />} />
    </Routes>
  );
}
