import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = '448074327906-ksjagc4f3k45fhi33b4762tvdebvl1tm.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBbVkK5_QX7Y8sFqG4aEp5OGDGNcqRW2Co';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const useGoogleCalendar = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        function start() {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                scope: SCOPES,
            }).then(() => {
                setIsInitialized(true);
            });
        }

        gapi.load('client:auth2', start);
    }, []);

    const addEventToCalendar = async (eventDetails: any) => {
        if (!isInitialized) return;

        try {
            await gapi.auth2.getAuthInstance().signIn();

            const event = {
                summary: eventDetails.name,
                location: eventDetails.address_1,
                description: eventDetails.description,
                start: {
                    dateTime: `${eventDetails.start_date}T${eventDetails.start_time}:00`,
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: `${eventDetails.end_date}T${eventDetails.end_time}:00`,
                    timeZone: 'America/New_York',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 10 },
                    ],
                },
            };

            // Check for conflicting events
            const timeMin = new Date(`${eventDetails.start_date}T${eventDetails.start_time}:00`).toISOString();
            const timeMax = new Date(`${eventDetails.end_date}T${eventDetails.end_time}:00`).toISOString();

            const response = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin,
                timeMax: timeMax,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.result.items;
            if (events && events.length > 0) {
                console.log('Conflicting events found:', events);
                return { success: false, message: 'Conflicting events found' };
            }

            // Add the event to the calendar
            const request = gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            const result = await request.execute();
            return { success: true, message: 'Event added to calendar', htmlLink: result.htmlLink };
        } catch (error) {
            console.error('Error adding event to calendar:', error);
            return { success: false, message: 'Error adding event to calendar' };
        }
    };

    return { addEventToCalendar };
};

export default useGoogleCalendar;