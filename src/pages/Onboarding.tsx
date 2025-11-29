import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

type OnboardingData = {
  duration: string;
  groupSize: string;
  startTime: string;
  endTime: string;
  interests: string[];
};

const INTERESTS = [
  "Local Food",
  "Culture & History",
  "Adventure",
  "Nightlife",
  "Beach & Nature",
  "Shopping",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    duration: "",
    groupSize: "",
    startTime: "",
    endTime: "",
    interests: [],
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      localStorage.setItem("onboardingComplete", "true");
      navigate("/");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.duration !== "";
      case 2:
        return data.groupSize !== "";
      case 3:
        return data.startTime !== "";
      case 4:
        return data.endTime !== "";
      case 5:
        return data.interests.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-secondary border-b-2 border-foreground">
        <div
          className="h-2 bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Step Indicator */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Question {step} of {totalSteps}
            </p>
          </div>

          {/* Question Content */}
          <div className="bg-card border-2 border-foreground rounded-2xl p-6 shadow-brutal-lg space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  How long are you staying in Da Nang?
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="duration">Number of days</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="e.g., 3"
                    value={data.duration}
                    onChange={(e) =>
                      setData({ ...data, duration: e.target.value })
                    }
                    className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  How many people are you traveling with?
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="groupSize">Number of travelers</Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min="1"
                    placeholder="e.g., 2"
                    value={data.groupSize}
                    onChange={(e) =>
                      setData({ ...data, groupSize: e.target.value })
                    }
                    className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  What time do you prefer to start your day?
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={data.startTime}
                    onChange={(e) =>
                      setData({ ...data, startTime: e.target.value })
                    }
                    className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  What time do you prefer to end your day?
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={data.endTime}
                    onChange={(e) =>
                      setData({ ...data, endTime: e.target.value })
                    }
                    className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  What are you interested in?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select all that apply
                </p>
                <div className="space-y-3">
                  {INTERESTS.map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      <Checkbox
                        id={interest}
                        checked={data.interests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                      />
                      <Label
                        htmlFor={interest}
                        className="flex-1 cursor-pointer"
                      >
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-2 border-foreground shadow-brutal hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 border-2 border-foreground shadow-brutal hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === totalSteps ? "Finish" : "Next"}
              {step < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
