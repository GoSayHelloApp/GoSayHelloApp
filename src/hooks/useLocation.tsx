import { useState, useEffect } from "react";

export const useLocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error fetching location:", error);
                alert("Unable to retrieve your location. Please check your browser settings. error.message: " + error.message);
            }
        );
    }, []);

    return location;
};
