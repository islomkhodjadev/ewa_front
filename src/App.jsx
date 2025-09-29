import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import StartPage from "./pages/StartPage";
import LoadingPage from "./pages/LoadingPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
