import * as chrono from "chrono-node";
import { DateTime } from "luxon";

export function parsePreferredSchedule(preferredText) {
    const parsedResult = chrono.parseDate(preferredText, new Date(), { forwardDate: true });
  
    if (!parsedResult) {
      throw new Error("Could not parse preferred schedule text.");
    }
  
    const startDateTime = DateTime.fromJSDate(parsedResult, { zone: "America/New_York" });
    const endDateTime = startDateTime.plus({ minutes: 30 });
  
    return {
      startDateTimeISO: startDateTime.toISO(),
      endDateTimeISO: endDateTime.toISO()
    };
}