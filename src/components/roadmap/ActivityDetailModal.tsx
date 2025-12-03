import { Activity } from "@/data/sampleItinerary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, UtensilsCrossed, Camera, Compass, Car, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type ActivityDetailModalProps = {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateTime?: (id: string, newTime: string) => void;
};

const categoryDetails = {
  food: {
    icon: UtensilsCrossed,
    label: "Food & Dining",
    tips: ["Try to arrive early for popular spots", "Ask locals for recommendations", "Check if reservations are needed"],
  },
  sightseeing: {
    icon: Camera,
    label: "Sightseeing",
    tips: ["Best light for photos in early morning or late afternoon", "Wear comfortable shoes", "Bring water and sunscreen"],
  },
  activity: {
    icon: Compass,
    label: "Activity",
    tips: ["Book in advance during peak season", "Check weather conditions", "Bring appropriate gear"],
  },
  transport: {
    icon: Car,
    label: "Transportation",
    tips: ["Download offline maps", "Keep contact info handy", "Allow buffer time for delays"],
  },
};

const ActivityDetailModal = ({
  activity,
  open,
  onOpenChange,
  onDelete,
  onUpdateTime,
}: ActivityDetailModalProps) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState("");

  if (!activity) return null;

  const details = categoryDetails[activity.category];
  const Icon = details.icon;

  const handleTimeEdit = () => {
    setEditedTime(activity.time);
    setIsEditingTime(true);
  };

  const handleTimeSave = () => {
    if (onUpdateTime && editedTime) {
      onUpdateTime(activity.id, editedTime);
    }
    setIsEditingTime(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground shadow-brutal max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            {activity.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {isEditingTime ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="w-32 h-8"
                />
                <Button size="sm" onClick={handleTimeSave}>
                  Save
                </Button>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                {activity.time}
                {onUpdateTime && (
                  <button onClick={handleTimeEdit} className="hover:text-primary">
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}
          </div>

          {/* Category */}
          <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm">
            <Icon className="w-4 h-4" />
            {details.label}
          </div>

          {/* Description */}
          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="text-foreground">{activity.description}</p>
          </div>

          {/* Location placeholder */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Da Nang, Vietnam</span>
          </div>

          {/* Tips */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Tips</h4>
            <ul className="space-y-1">
              {details.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Delete button */}
          {onDelete && (
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                onDelete(activity.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Roadmap
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailModal;
