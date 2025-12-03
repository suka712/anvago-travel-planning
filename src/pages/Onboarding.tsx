import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  OnboardingData,
  INTERESTS,
  FOOD_PREFERENCES,
  TRANSPORT_MODES,
  MOBILITY_OPTIONS,
  BUDGET_OPTIONS,
} from "@/types/onboarding";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    duration: "",
    groupSize: "",
    startTime: "",
    endTime: "",
    interests: [],
    budget: "",
    foodPreferences: [],
    transportMode: "",
    mobility: "",
  });

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("onboardingData", JSON.stringify(data));
      navigate("/select");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (key: "interests" | "foodPreferences", item: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.duration !== "";
      case 2: return data.groupSize !== "";
      case 3: return data.startTime !== "";
      case 4: return data.endTime !== "";
      case 5: return data.interests.length > 0;
      case 6: return data.budget !== "";
      case 7: return data.foodPreferences.length > 0;
      case 8: return data.transportMode !== "";
      case 9: return data.mobility !== "";
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
                onChange={(e) => setData({ ...data, duration: e.target.value })}
                className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              How many people are traveling?
            </h2>
            <div className="space-y-2">
              <Label htmlFor="groupSize">Number of travelers</Label>
              <Input
                id="groupSize"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={data.groupSize}
                onChange={(e) => setData({ ...data, groupSize: e.target.value })}
                className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
              />
            </div>
          </div>
        );

      case 3:
        return (
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
                onChange={(e) => setData({ ...data, startTime: e.target.value })}
                className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
              />
            </div>
          </div>
        );

      case 4:
        return (
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
                onChange={(e) => setData({ ...data, endTime: e.target.value })}
                className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              What are you interested in?
            </h2>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            <div className="space-y-3">
              {INTERESTS.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => toggleArrayItem("interests", interest)}
                >
                  <Checkbox
                    id={interest}
                    checked={data.interests.includes(interest)}
                    onCheckedChange={() => toggleArrayItem("interests", interest)}
                  />
                  <Label htmlFor={interest} className="flex-1 cursor-pointer">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              What's your daily budget?
            </h2>
            <RadioGroup
              value={data.budget}
              onValueChange={(value) => setData({ ...data, budget: value })}
              className="space-y-3"
            >
              {BUDGET_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => setData({ ...data, budget: option.value })}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Any food preferences?
            </h2>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            <div className="space-y-3">
              {FOOD_PREFERENCES.map((pref) => (
                <div
                  key={pref}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => toggleArrayItem("foodPreferences", pref)}
                >
                  <Checkbox
                    id={pref}
                    checked={data.foodPreferences.includes(pref)}
                    onCheckedChange={() => toggleArrayItem("foodPreferences", pref)}
                  />
                  <Label htmlFor={pref} className="flex-1 cursor-pointer">
                    {pref}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              How do you prefer to get around?
            </h2>
            <RadioGroup
              value={data.transportMode}
              onValueChange={(value) => setData({ ...data, transportMode: value })}
              className="space-y-3"
            >
              {TRANSPORT_MODES.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => setData({ ...data, transportMode: option.value })}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Any mobility considerations?
            </h2>
            <RadioGroup
              value={data.mobility}
              onValueChange={(value) => setData({ ...data, mobility: value })}
              className="space-y-3"
            >
              {MOBILITY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-foreground bg-background hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => setData({ ...data, mobility: option.value })}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
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
            {renderStep()}
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
