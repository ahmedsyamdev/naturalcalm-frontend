import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import splashLogo from "@/assets/N-C-Logo.png";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4091A5] to-[#18373F] flex items-center justify-center">
      <div className="animate-pulse">
        <img 
          src={splashLogo} 
          alt="Naturacalm Logo" 
          className="w-48 h-48 object-contain"
        />
      </div>
    </div>
  );
};

export default Splash;
