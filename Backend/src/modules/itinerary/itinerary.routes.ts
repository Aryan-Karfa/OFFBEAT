import { Router } from "express";
import { itineraryController } from "./itinerary.controller.js";

export const itineraryRoutes: Router = Router();

itineraryRoutes.post("/", itineraryController.createItinerary);
itineraryRoutes.get("/:itineraryId", itineraryController.getItinerary);
