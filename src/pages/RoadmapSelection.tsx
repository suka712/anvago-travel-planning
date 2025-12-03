import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roadmapTemplates, RoadmapTemplate } from "@/data/roadmapTemplates";
import { Badge } from "@/components/ui/badge";

const RoadmapSelection = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const selectRoadmap = (roadmap: RoadmapTemplate) => {
    localStorage.setItem("selectedRoadmap", JSON.stringify(roadmap));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-brutal-sm">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Anvago</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Choose Your Adventure
          </h2>
          <p className="text-muted-foreground">
            Pick a roadmap that matches your travel style, then customize it to make it yours.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid gap-4">
          {roadmapTemplates.map((roadmap) => (
            <div
              key={roadmap.id}
              className="bg-card border-2 border-foreground rounded-xl p-4 shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer group"
              onClick={() => selectRoadmap(roadmap)}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="text-4xl bg-secondary border-2 border-foreground rounded-lg p-3 shadow-brutal-sm">
                  {roadmap.thumbnail}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {roadmap.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(roadmap.id);
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(roadmap.id)
                            ? "fill-destructive text-destructive"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {roadmap.description}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {roadmap.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {roadmap.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs border border-foreground/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RoadmapSelection;
