import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, Sparkles } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("onboardingComplete");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg shadow-brutal-sm">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Anvago</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-card border-2 border-foreground rounded-2xl p-6 shadow-brutal-lg">
            <div className="flex items-start gap-4">
              <div className="bg-primary p-3 rounded-xl shadow-brutal-sm">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Your Itinerary is Being Prepared!
                </h2>
                <p className="text-muted-foreground">
                  Our AI is creating a personalized roadmap for your Da Nang adventure.
                  You'll receive authentic recommendations and real-time navigation
                  support.
                </p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              What's Coming Next
            </h3>
            <div className="grid gap-4">
              {[
                {
                  title: "Personalized Roadmaps",
                  description:
                    "Custom micro-itineraries based on your preferences and schedule",
                },
                {
                  title: "Community Recommendations",
                  description:
                    "Authentic local spots recommended by travelers like you",
                },
                {
                  title: "Real-time Navigation",
                  description:
                    "Turn-by-turn guidance to help you explore with confidence",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-secondary border-2 border-foreground rounded-xl p-4 shadow-brutal-sm"
                >
                  <h4 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary border-2 border-foreground rounded-2xl p-6 shadow-brutal-lg text-center">
            <h3 className="text-xl font-bold text-primary-foreground mb-2">
              Stay Tuned!
            </h3>
            <p className="text-primary-foreground/90 text-sm">
              We're finalizing your personalized travel experience. Check back soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
