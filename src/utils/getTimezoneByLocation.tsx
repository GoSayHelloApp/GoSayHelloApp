export default async function getTimeZone(lat: number, lng: number) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API;
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            console.log(`Time Zone ID: ${data.timeZoneId}`);
            console.log(`Time Zone Name: ${data.timeZoneName}`);
            return data.timeZoneId;
        } else {
            console.error("Error fetching timezone:", data.status);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

