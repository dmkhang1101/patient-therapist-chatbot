import { findBestTherapist } from "./findBestTherapist";
import { scheduleAppointment } from "./scheduleAppointment";

export async function matchAndSchedule(args) {
  return await findBestTherapist({
    problem_description: args.problem_description,
    insurance_provider: args.insurance_provider
  });
}

export async function callScheduleAppointment(args) {
  const patient = {
    full_name: args.patient_name,
    email: args.patient_email,
    preferred_schedule: args.preferred_schedule
  };
  const therapist = {
    therapist_id: args.therapist_id,
    therapist_name: args.therapist_name,
    therapist_email: args.therapist_email
  };
  return await scheduleAppointment(patient, therapist, args.patient_id);
}
