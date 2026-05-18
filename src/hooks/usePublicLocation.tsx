import { useEffect, useState } from "react";

/** Atlanta, GA — default when geolocation is unavailable (matches API samples) */
export const DEFAULT_PUBLIC_LOCATION = {
  latitude: 33.749,
  longitude: -84.388,
};

export function usePublicLocation() {
  const [location, setLocation] = useState(DEFAULT_PUBLIC_LOCATION);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsUsingFallback(false);
      },
      () => {
        setIsUsingFallback(true);
      }
    );
  }, []);

  return { ...location, isUsingFallback };
}
