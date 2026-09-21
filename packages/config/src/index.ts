/**
 * OFFBEAT — Core Shared Configuration Constants
 * Baseline system constants for Phase 0
 */

export const API_VERSION = "v1" as const;
export const API_PREFIX = `/api/${API_VERSION}` as const;

export const DEFAULT_SERVER_PORT = 5000;
export const DEFAULT_CLIENT_PORT = 3000;

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash" as const;
