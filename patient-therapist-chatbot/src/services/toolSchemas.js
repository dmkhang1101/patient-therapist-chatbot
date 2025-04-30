export const MATCH_AND_SCHEDULE_TOOL_DEF = {
    type: "function",
    function: {
      name: "match_and_schedule",
      description: "Return the best therapist's ID, name, and email if a match is found. If no therapist is suitable for the patient's concern, return null values.",
      parameters: {
        type: "object",
        properties: {
          therapist_id: { type: "string", nullable: true },
          therapist_name: { type: "string", nullable: true },
          therapist_email: { type: "string", nullable: true }
        },
        required: ["therapist_id", "therapist_name", "therapist_email"],
        additionalProperties: false
      }
    },
    strict: true
  }
  
  export const SCHEDULE_APPOINTMENT_TOOL_DEF = {
    type: "function",
    function: {
      name: "schedule_appointment",
      parameters: {
        type: "object",
        properties: {
          patient_id: { type: "string" },
          patient_name: { type: "string" },
          patient_email: { type: "string" },
          preferred_schedule: { type: "string" },
          therapist_id: { type: "string" },
          therapist_name: { type: "string" },
          therapist_email: { type: "string" }
        },
        required: ["patient_id", "patient_name", "patient_email", "preferred_schedule", "therapist_id", "therapist_name", "therapist_email"]
      }
    }
  };
  