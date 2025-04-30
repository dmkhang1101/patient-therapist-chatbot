import { SCHEDULE_APPOINTMENT_TOOL_DEF } from "./toolSchemas";

export async function scheduleWithAI({ patient, patientId, matchedTherapist }) {
  const payload = {
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: "You are a therapy assistant scheduling an appointment with a matched therapist."
      },
      {
        role: "user",
        content: `Patient name: ${patient.full_name}
                Patient email: ${patient.email}
                Patient ID: ${patientId}
                Preferred time: ${patient.preferred_schedule}
                Therapist name: ${matchedTherapist.therapist_name}
                Therapist email: ${matchedTherapist.therapist_email}
                Therapist ID: ${matchedTherapist.therapist_id}`
      }
    ],
    tools: [SCHEDULE_APPOINTMENT_TOOL_DEF],
    tool_choice: "auto"
  };

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await openaiRes.json();
  const toolCalls = data.choices?.[0]?.message?.tool_calls;

  return toolCalls || [];
}
