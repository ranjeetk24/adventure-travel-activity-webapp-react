
import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BookingContext } from "../context/BookingContext";
import Stars from "../components/Stars";
import SafeImg from "../components/SafeImg";

export default function ActivityDetail() {
  const { id } = useParams();
  const { activities } = useContext(BookingContext);

  const activity = (activities || []).find((a) => String(a.id) === String(id));

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-6 max-w-3xl mx-auto">
          <p className="text-gray-600">Activity not found.</p>
          <Link to="/search" className="text-blue-600 underline">
            Back to search
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto bg-white shadow rounded-xl">
        <SafeImg
          src={activity.imageUrl}
          alt={activity.name}
          className="rounded-lg mb-4"
          height={260}
          fallbackSeed={`detail-${activity.id}`}
        />
        <h1 className="text-2xl font-bold mb-2">{activity.name}</h1>
        <p className="text-gray-700 mb-2">Price: ₹ {activity.price}</p>
        <Stars value={Number(activity.rating || 0)} size={12} />

        <div className="mt-4 mb-4">
          <strong>Inclusions:</strong>
          <ul className="list-disc list-inside text-gray-600">
            <li>Guide</li>
            <li>Equipment</li>
          </ul>
        </div>

        <Link
          to="/booking"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Book Now
        </Link>
      </main>
    </div>
  );
}
