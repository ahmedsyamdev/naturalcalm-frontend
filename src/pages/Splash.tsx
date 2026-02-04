import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import splashLogo from "@/assets/N.C-con2.png";
import { getAuthToken } from "@/lib/api/tokens";

const Splash = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const navTimer = setTimeout(() => {
      // Check if user is already logged in
      const token = getAuthToken();
      if (token) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeInText {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .splash-logo {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .splash-text {
            opacity: 0;
            animation: fadeInText 0.6s ease-out 0.4s forwards;
          }
        `}
      </style>
      <div className={`min-h-screen bg-[#7ca78b] flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center">
          <img
            src={splashLogo}
            alt="Naturacalm Logo"
            className="w-28 h-28 object-contain splash-logo"
          />
          <h1 className="text-white text-xl mt-1 tracking-wide splash-text" style={{ fontFamily: "'Quicksand', sans-serif" }}>Naturacalm</h1>
        </div>
      </div>
    </>
  );
};

export default Splash;
