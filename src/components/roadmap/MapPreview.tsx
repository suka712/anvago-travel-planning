import { MapPin, ExternalLink } from "lucide-react";
import { Activity } from "@/data/sampleItinerary";
import { Button } from "@/components/ui/button";

type MapPreviewProps = {
  activities: Activity[];
};

const MapPreview = ({ activities }: MapPreviewProps) => {
  // Mock coordinates for Da Nang area activities
  const mockLocations = [
    { x: 45, y: 30 },
    { x: 60, y: 45 },
    { x: 35, y: 55 },
    { x: 70, y: 35 },
    { x: 50, y: 65 },
  ];

  const openInMaps = () => {
    // Open Da Nang in Google Maps
    window.open("https://www.google.com/maps/place/Da+Nang,+Vietnam", "_blank");
  };

  return (
    <div className="bg-card border-2 border-foreground rounded-xl overflow-hidden shadow-brutal">
      {/* Map Container */}
      <div className="relative h-48 bg-gradient-to-br from-secondary to-muted">
        {/* Grid pattern for map effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Mock coastline */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0 40 Q20 35, 40 50 T80 45 T100 55 L100 100 L0 100 Z"
            fill="hsl(var(--primary) / 0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        </svg>

        {/* Activity markers */}
        {activities.slice(0, 5).map((activity, index) => {
          const loc = mockLocations[index];
          return (
            <div
              key={activity.id}
              className="absolute transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <div className="relative group">
                <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg border-2 border-background">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                    {activity.name}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 bg-background text-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold border border-foreground">
                  {index + 1}
                </span>
              </div>
            </div>
          );
        })}

        {/* Da Nang label */}
        <div className="absolute bottom-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-medium text-foreground border border-border">
          📍 Da Nang, Vietnam
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t-2 border-foreground bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-foreground shadow-brutal-sm hover:shadow-brutal"
          onClick={openInMaps}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
};

export default MapPreview;
