import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  parseInitDataQuery,
  retrieveRawInitData,
} from "@telegram-apps/sdk-react";

const BotClientContext = createContext(null);

export function BotClientProvider({ children }) {
  const [botClient, setBotClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        let rawInitData = retrieveRawInitData();
        let userData;

        // If we have fresh init data, use it and store it
        if (rawInitData) {
          userData = parseInitDataQuery(rawInitData);
          // Store in localStorage for page reloads
          localStorage.setItem("telegram_init_data", rawInitData);
          localStorage.setItem("telegram_user_data", JSON.stringify(userData));
        }
        // If no fresh data but we have stored data, use that
        else if (localStorage.getItem("telegram_init_data")) {
          const storedInitData = localStorage.getItem("telegram_init_data");
          const storedUserData = localStorage.getItem("telegram_user_data");

          if (storedInitData && storedUserData) {
            userData = JSON.parse(storedUserData);
            console.log("Using stored Telegram user data");
          }
        }

        if (!userData) {
          throw new Error("No init data available");
        }

        if (mountedRef.current) {
          setBotClient(userData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load user data", err);
        if (mountedRef.current) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value = {
    botClient,
    setBotClient,
    isLoading,
    error,
  };

  return (
    <BotClientContext.Provider value={value}>
      {children}
    </BotClientContext.Provider>
  );
}

// ... rest of your context code

// Custom hook with proper error handling
export function useBotClient() {
  const context = useContext(BotClientContext);

  if (context === null) {
    throw new Error("useBotClient must be used within a BotClientProvider");
  }

  return context;
}

// Optional: Hook for specific user data
export function useBotUser() {
  const { botClient, isLoading, error } = useBotClient();

  return {
    user: botClient?.user || null,
    authDate: botClient?.authDate || null,
    hash: botClient?.hash || null,
    isLoading,
    error,
  };
}
