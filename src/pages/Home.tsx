import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut } from "lucide-react";
import RoadmapView from "@/components/roadmap/RoadmapView";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("onboardingComplete");
    localStorage.removeItem("onboardingData");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card sticky top-0 z-10">
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
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <RoadmapView />
      </main>
    </div>
  );
};

export default Home;
