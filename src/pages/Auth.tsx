import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - just navigate to onboarding
    if (isLogin) {
      // Mock: check if user exists, for MVP we just navigate
      navigate("/");
    } else {
      // Mock signup - navigate to onboarding
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-4 rounded-2xl shadow-brutal">
              <MapPin className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Anvago</h1>
          <p className="text-muted-foreground">Explore Da Nang with confidence</p>
        </div>

        {/* Auth Form */}
        <div className="bg-card border-2 border-foreground rounded-2xl p-6 shadow-brutal-lg">
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  isLogin
                    ? "bg-primary text-primary-foreground shadow-brutal-sm"
                    : "text-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !isLogin
                    ? "bg-primary text-primary-foreground shadow-brutal-sm"
                    : "text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-foreground shadow-brutal-sm focus:shadow-brutal"
                />
              </div>

              <Button
                type="submit"
                className="w-full border-2 border-foreground shadow-brutal hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to Anvago's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
