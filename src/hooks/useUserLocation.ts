import { useEffect, useState } from "react";

const DEFAULT_LOCATION = { lat: 33.749, lng: -84.388, label: "Atlanta" };
const STORAGE_KEY = "gosayhello:lastUserLocation";
// Saved coords are considered fresh for 30 days
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

interface SavedLocation {
  lat: number;
  lng: number;
  savedAt: number;
}

function readSaved(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLocation>;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return { lat: parsed.lat, lng: parsed.lng, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

function writeSaved(lat: number, lng: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lat, lng, savedAt: Date.now() } satisfies SavedLocation)
    );
  } catch {
    // storage full / disabled — ignore
  }
}

export function useUserLocation(): UserLocation {
  const [coords, setCoords] = useState<UserLocation>(() => {
    const saved = readSaved();
    if (saved) {
      return { lat: saved.lat, lng: saved.lng, label: "your location" };
    }
    return DEFAULT_LOCATION;
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        writeSaved(lat, lng);
        setCoords({ lat, lng, label: "your location" });
      },
      () => {
        // denied / error → keep whatever we started with (saved or default)
      },
      { timeout: 4000, maximumAge: 5 * 60_000 }
    );
  }, []);

  return coords;
}
