import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on authentication state
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    if (!onboardingComplete) {
      navigate("/auth");
    }
  }, [navigate]);

  return null;
};

export default Index;
