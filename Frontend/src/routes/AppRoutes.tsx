import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/Landing/LandingPage";
import { HomePage } from "../pages/Home/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Default Route: Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Main Experience: Home / Dashboard */}
      <Route path="/home" element={<HomePage />} />

      {/* Dashboard alias redirecting to /home */}
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
