import { useState } from "react";
import { sampleItinerary } from "@/data/sampleItinerary";
import DayTimeline from "./DayTimeline";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";

const RoadmapView = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const totalDays = sampleItinerary.length;

  const handlePrevDay = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1);
  };

  const handleNextDay = () => {
    if (currentDay < totalDays - 1) setCurrentDay(currentDay + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border-2 border-foreground rounded-2xl p-4 shadow-brutal-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary p-2 rounded-lg shadow-brutal-sm">
            <Map className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Your Roadmap</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalDays} days of curated Da Nang experiences
        </p>
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={handlePrevDay}
          disabled={currentDay === 0}
          variant="outline"
          size="sm"
          className="border-2 border-foreground shadow-brutal-sm disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-2">
          {sampleItinerary.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`w-8 h-8 rounded-full border-2 border-foreground font-bold text-sm transition-all ${
                currentDay === index
                  ? "bg-primary text-primary-foreground shadow-brutal-sm"
                  : "bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button
          onClick={handleNextDay}
          disabled={currentDay === totalDays - 1}
          variant="outline"
          size="sm"
          className="border-2 border-foreground shadow-brutal-sm disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline */}
      <DayTimeline day={sampleItinerary[currentDay]} />
    </div>
  );
};

export default RoadmapView;
