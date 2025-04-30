import { supabase } from "./supabaseClient";
import { MATCH_AND_SCHEDULE_TOOL_DEF } from "./toolSchemas";

export async function findBestTherapist(patient) {
  try {
    const { problem_description, insurance_provider } = patient;

    const { data: therapists, error } = await supabase.from("therapists").select("*");
    if (error || !therapists) throw new Error("Could not load therapists");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `You are a therapy intake assistant.
                Only match patients with therapists if the concern is related to mental health issues (e.g., anxiety, depression, relationships, stress).
                If the patient's concern is unrelated to therapy (e.g., cancer treatment, surgery, medical care), return null values via the match_and_schedule function.`
          },
          {
            role: "user",
            content: `
                Patient's problem description:
                "${problem_description}"

                Insurance Provider:
                "${insurance_provider}"

                Available therapists:
                ${JSON.stringify(therapists, null, 2)}

                Instructions:
                - If a suitable therapist is found, call match_and_schedule with their ID, name, and email.
                - If no therapist fits the patient's issue, return null for all fields.`
          }
        ],
        tools: [MATCH_AND_SCHEDULE_TOOL_DEF],
        tool_choice: "auto"
      })
    });

    const openaiData = await openaiRes.json();

    const toolCalls = openaiData.choices?.[0]?.message?.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      console.error("[findBestTherapist] No tool call found:", openaiData);
      return null;
    }

    const match = JSON.parse(toolCalls[0].function.arguments);

    if (!match.therapist_id || !match.therapist_name || !match.therapist_email) {
      return null;
    }

    return match;
    
  } catch (err) {
    console.error("[findBestTherapist] Error:", err.message);
    return null;
  }
}
