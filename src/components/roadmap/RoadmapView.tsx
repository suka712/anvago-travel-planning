import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DayItinerary, Activity } from "@/data/sampleItinerary";
import { RoadmapTemplate, roadmapTemplates } from "@/data/roadmapTemplates";
import DayTimeline from "./DayTimeline";
import MapPreview from "./MapPreview";
import ActivityDetailModal from "./ActivityDetailModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Map, Share2, Heart, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RoadmapView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDay, setCurrentDay] = useState(0);
  const [roadmap, setRoadmap] = useState<RoadmapTemplate | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedRoadmap");
    if (saved) {
      setRoadmap(JSON.parse(saved));
    } else {
      // Default to first template if none selected
      setRoadmap(roadmapTemplates[0]);
    }
  }, []);

  if (!roadmap) return null;

  const itinerary = roadmap.itinerary;
  const totalDays = itinerary.length;

  const handlePrevDay = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1);
  };

  const handleNextDay = () => {
    if (currentDay < totalDays - 1) setCurrentDay(currentDay + 1);
  };

  const handleShare = async () => {
    const shareData = {
      title: `My ${roadmap.name} Roadmap`,
      text: `Check out my ${roadmap.duration} trip plan: ${roadmap.name}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    const updatedItinerary = itinerary.map((day) => ({
      ...day,
      activities: day.activities.filter((a) => a.id !== activityId),
    }));
    const updatedRoadmap = { ...roadmap, itinerary: updatedItinerary };
    setRoadmap(updatedRoadmap);
    localStorage.setItem("selectedRoadmap", JSON.stringify(updatedRoadmap));
    toast({
      title: "Activity removed",
      description: "The activity has been removed from your roadmap",
    });
  };

  const handleUpdateTime = (activityId: string, newTime: string) => {
    const updatedItinerary = itinerary.map((day) => ({
      ...day,
      activities: day.activities.map((a) =>
        a.id === activityId ? { ...a, time: newTime } : a
      ),
    }));
    const updatedRoadmap = { ...roadmap, itinerary: updatedItinerary };
    setRoadmap(updatedRoadmap);
    localStorage.setItem("selectedRoadmap", JSON.stringify(updatedRoadmap));
    toast({
      title: "Time updated",
      description: `Activity time changed to ${newTime}`,
    });
  };

  const handleChangeRoadmap = () => {
    navigate("/select");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border-2 border-foreground rounded-2xl p-4 shadow-brutal-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{roadmap.thumbnail}</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{roadmap.name}</h2>
              <p className="text-sm text-muted-foreground">
                {roadmap.duration} • {totalDays} days of activities
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleChangeRoadmap}
          className="w-full border-2 border-foreground shadow-brutal-sm"
        >
          Change Roadmap
        </Button>
      </div>

      {/* Map Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowMap(!showMap)}
        className="w-full border-2 border-foreground shadow-brutal-sm"
      >
        <Map className="w-4 h-4 mr-2" />
        {showMap ? "Hide Map" : "Show Map Preview"}
      </Button>

      {/* Map Preview */}
      {showMap && <MapPreview activities={itinerary[currentDay].activities} />}

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

        <div className="flex gap-2 overflow-x-auto">
          {itinerary.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`w-8 h-8 rounded-full border-2 border-foreground font-bold text-sm transition-all flex-shrink-0 ${
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
      <DayTimeline
        day={itinerary[currentDay]}
        onActivityClick={setSelectedActivity}
      />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        onDelete={handleDeleteActivity}
        onUpdateTime={handleUpdateTime}
      />
    </div>
  );
};

export default RoadmapView;
