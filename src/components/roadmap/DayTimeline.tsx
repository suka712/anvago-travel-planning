import { DayItinerary, Activity } from "@/data/sampleItinerary";
import TimelineActivity from "./TimelineActivity";

type DayTimelineProps = {
  day: DayItinerary;
  onActivityClick?: (activity: Activity) => void;
};

const DayTimeline = ({ day, onActivityClick }: DayTimelineProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-foreground bg-secondary border-2 border-foreground rounded-lg px-4 py-2 shadow-brutal-sm inline-block">
        {day.date}
      </h3>
      <div className="mt-4">
        {day.activities.map((activity, index) => (
          <TimelineActivity
            key={activity.id}
            activity={activity}
            isLast={index === day.activities.length - 1}
            onClick={() => onActivityClick?.(activity)}
          />
        ))}
      </div>
    </div>
  );
};

export default DayTimeline;
