// lib/events.ts
import { EventEmitter } from "events";
export const PrefsEvents = new EventEmitter();

// Keep event names centralized
export const EVENTS = {
    HOME_RESORTS_CHANGED: "HOME_RESORTS_CHANGED",
    HOME_QUOTA_RESET: "HOME_QUOTA_RESET",
} as const;
