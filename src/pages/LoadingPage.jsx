import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useBotClient } from "../providers/BotClientProvider";

export default function LoadingPage() {
  const navigate = useNavigate();
  const { botClient, isLoading, error } = useBotClient();

  useEffect(() => {
    // Only navigate to chat when loading is complete AND we have valid botClient data
    if (!isLoading && botClient && botClient.user?.id) {
      navigate("/chat");
    }

    // If loading is complete but there's an error or no user data,
    // stay on loading page indefinitely or handle error
    if (!isLoading && (error || !botClient?.user?.id)) {
      console.error(
        "Failed to load user data:",
        error || "No user ID available"
      );
      // You can choose to stay on loading page or show error
      // For now, we'll stay on loading page and show the loading animation
    }
  }, [isLoading, botClient, error, navigate]);

  return (
    <div className="bg-black flex justify-center items-center w-screen h-screen">
      <motion.img
        src="/logo.svg"
        alt="loading"
        className="blur-sm w-32 h-32"
        animate={{
          opacity: [0.3, 1, 0.3],
          filter: ["blur(4px)", "blur(8px)", "blur(4px)"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </div>
  );
}
