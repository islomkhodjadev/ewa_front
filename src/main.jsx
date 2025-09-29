// main.jsx or index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Fixed import
import { StrictMode } from "react";
import { init, miniApp } from "@telegram-apps/sdk-react";
import App from "./App";
import "./index.css"; // <-- import Tailwind here

import { BotClientProvider } from "./providers/BotClientProvider";
const initializeTelegramSDK = async () => {
  try {
    await init();

    if (miniApp.ready.isAvailable()) {
      await miniApp.ready();
    }
  } catch (error) {
    console.log(error);
  }
};

initializeTelegramSDK();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <BotClientProvider>
      <App />
    </BotClientProvider>
  </BrowserRouter>
);
