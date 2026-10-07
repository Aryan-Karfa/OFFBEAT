import { Router } from "express";
import { memoryController } from "./memory.controller.js";

export const memoryRoutes = Router();

// Memory CRUD, Events, and Settings
memoryRoutes.get("/memory", memoryController.getMemories);
memoryRoutes.delete("/memory", memoryController.clearAllMemories);
memoryRoutes.post("/memory/events", memoryController.recordEvent);
memoryRoutes.get("/memory/settings", memoryController.getSettings);
memoryRoutes.patch("/memory/settings", memoryController.updateSettings);
memoryRoutes.patch("/memory/:memoryId", memoryController.updateMemoryItem);
memoryRoutes.delete("/memory/:memoryId", memoryController.deleteMemoryItem);

// Normalized Personalization Profile
memoryRoutes.get("/personalization", memoryController.getPersonalization);
