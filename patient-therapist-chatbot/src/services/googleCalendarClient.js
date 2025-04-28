export async function createGoogleMeetEvent(patientName, patientEmail, therapistName, therapistEmail, startDateTimeISO, endDateTimeISO) {
    const accessToken = import.meta.env.VITE_GOOGLE_ACCESS_TOKEN;
  
    const eventPayload = {
      summary: `Therapy Appointment: ${patientName} & ${therapistName}`,
      description: "Scheduled via Patient Chatbot",
      start: {
        dateTime: startDateTimeISO,
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endDateTimeISO,
        timeZone: "America/New_York",
      },
      attendees: [
        { email: patientEmail },
        { email: therapistEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 15),
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    };
  
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload)
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create event: ${errorData.error.message}`);
    }
  
    const eventData = await response.json();
    return eventData.hangoutLink;
  }
  