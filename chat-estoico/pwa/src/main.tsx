import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const userId = localStorage.getItem("chatestoico_userId");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/chat" element={userId ? <ChatPage /> : <Navigate to="/onboarding" />} />
        <Route path="*" element={<Navigate to={userId ? "/chat" : "/onboarding"} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
