import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import { LandingPage } from "../../pages/Landing/LandingPage";
import { CountryPage } from "../../pages/Country/CountryPage";
import { InteractiveMapPage } from "../../pages/Country/InteractiveMapPage";
import { RegionPage } from "../../pages/Region/RegionPage";
import { TravelTastePage } from "../../pages/TravelTaste/TravelTastePage";
import { ExperienceTastePage } from "../../pages/ExperienceTaste/ExperienceTastePage";
import { DiscoveryContextPage } from "../../pages/DiscoveryContext/DiscoveryContextPage";
import { DiscoveryPage } from "../../pages/Discovery/DiscoveryPage";
import { PlacePage } from "../../pages/Place/PlacePage";
import { AlternativesPage } from "../../pages/Alternatives/AlternativesPage";
import { ItineraryPage } from "../../pages/Itinerary/ItineraryPage";
import { TakeHomePage } from "../../pages/TakeHome/TakeHomePage";
import { CommunityPage } from "../../pages/Community/CommunityPage";
import { ProfilePage } from "../../pages/Profile/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "country",
        element: <CountryPage />,
      },
      {
        path: "country/:countryCode/map",
        element: <InteractiveMapPage />,
      },
      {
        path: "map",
        element: <Navigate to="/country/india/map" replace />,
      },
      {
        path: "region/:regionId",
        element: <RegionPage />,
      },
      {
        path: "travel-taste",
        element: <TravelTastePage />,
      },
      {
        path: "experience-taste",
        element: <ExperienceTastePage />,
      },
      {
        path: "discovery-context",
        element: <DiscoveryContextPage />,
      },
      {
        path: "discovery",
        element: <DiscoveryPage />,
      },
      {
        path: "place/:placeId",
        element: <PlacePage />,
      },
      {
        path: "place/:placeId/alternatives",
        element: <AlternativesPage />,
      },
      {
        path: "alternatives",
        element: <AlternativesPage />,
      },
      {
        path: "itinerary",
        element: <ItineraryPage />,
      },
      {
        path: "take-home",
        element: <TakeHomePage />,
      },
      {
        path: "community",
        element: <CommunityPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
