import { refreshAccessToken } from "./googleAuthClient";
import { parsePreferredSchedule } from "./parseDateTime";
import { supabase } from "./supabaseClient";

export async function scheduleAppointment(patient, therapist, patientId) {
  try {
    const { full_name, email, preferred_schedule } = patient;
    const { therapist_id, therapist_name, therapist_email } = therapist;
    
    console.log(preferred_schedule)
    const { startDateTimeISO, endDateTimeISO } = parsePreferredSchedule(preferred_schedule);
    const accessToken = await refreshAccessToken();

    // 1️⃣ Step 1: Check therapist availability
    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        timeMin: startDateTimeISO,
        timeMax: endDateTimeISO,
        items: [{ id: "dmk110102@gmail.com" }]
      })
    });

    const freeBusyData = await freeBusyRes.json();
    console.log(freeBusyData)

    const therapistBusyTimes = freeBusyData.calendars?.["dmk110102@gmail.com"]?.busy || [];
    console.log(therapistBusyTimes)

    if (therapistBusyTimes.length > 0) {
      // ❌ Therapist is busy during desired time
      return {
        status: "conflict",
        reason: `${therapist_name} is unavailable at your selected time.`,
        appointment_time: startDateTimeISO
      };
    }

    console.log("Creating event with emails:", email, therapist_email);

    // 2️⃣ Step 2: Create event if no conflict
    const calendarRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `Therapy Appointment for ${full_name}`,
        start: { dateTime: startDateTimeISO, timeZone: "America/New_York" },
        end: { dateTime: endDateTimeISO, timeZone: "America/New_York" },
        attendees: [{ email }, { email: therapist_email }],
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      })
    });

    const calendarData = await calendarRes.json();
    if (calendarRes.ok && calendarData?.hangoutLink) {
      console.log("inserting",{
        patient_id: patientId,
        therapist_id,
        appointment_time: startDateTimeISO,
        google_meeting_link: calendarData.hangoutLink,
        status: "matched"
      })
      await supabase.from("appointments").insert([
        {
          patient_id: patientId,
          therapist_id,
          appointment_time: startDateTimeISO,
          google_meeting_link: calendarData.hangoutLink,
          status: "matched"
        }
      ]);

      await supabase.from("patients")
      .update({ preferred_schedule: startDateTimeISO })
      .eq("id", patientId);

      return {
        status: "scheduled",
        meetingLink: calendarData.hangoutLink,
        appointment_time: startDateTimeISO
      };
    }

    console.error("[scheduleAppointment] Unexpected calendar response:", calendarData);
    return {
      status: "error",
      reason: "Unknown error while booking calendar."
    };

  } catch (err) {
    console.error("[scheduleAppointment] Exception:", err.message);
    return { status: "error", reason: err.message };
  }
}