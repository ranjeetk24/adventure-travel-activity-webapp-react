

import { Link } from "react-router-dom";
import Stars from "./Stars";
import SafeImg from "./SafeImg";

export default function ActivityCard({ activity, asLink = false }) {
  const card = (
    <div className="activity-card card appear">
      <SafeImg
        src={activity.imageUrl}
        alt={activity.name}
        className="mb-2 rounded-md object-cover"
        height={160}
        fallbackSeed={`activity-${activity.id}`}
      />
      <h3>{activity.name}</h3>
      <p className="text-sm text-gray-600">
        Category: {activity.category || "General"}
      </p>
      <p className="text-sm text-gray-600 mb-1">₹ {activity.price}</p>
      <Stars value={Number(activity.rating || 0)} size={10} />
    </div>
  );

  if (asLink) {
    return (
      <Link to={`/activity/${activity.id}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
