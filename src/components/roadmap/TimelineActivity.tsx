import { Activity } from "@/data/sampleItinerary";
import { Utensils, Camera, Compass, Car } from "lucide-react";

const categoryIcons = {
  food: Utensils,
  sightseeing: Camera,
  activity: Compass,
  transport: Car,
};

const categoryColors = {
  food: "bg-orange-100 text-orange-600 border-orange-300",
  sightseeing: "bg-blue-100 text-blue-600 border-blue-300",
  activity: "bg-green-100 text-green-600 border-green-300",
  transport: "bg-purple-100 text-purple-600 border-purple-300",
};

type TimelineActivityProps = {
  activity: Activity;
  isLast: boolean;
};

const TimelineActivity = ({ activity, isLast }: TimelineActivityProps) => {
  const Icon = categoryIcons[activity.category];

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center ${categoryColors[activity.category]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-foreground/30 min-h-[40px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-brutal-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-primary">
              {activity.time}
            </span>
          </div>
          <h4 className="font-bold text-foreground">{activity.name}</h4>
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineActivity;
