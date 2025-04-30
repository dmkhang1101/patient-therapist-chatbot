import { callScheduleAppointment } from "./toolFunctions";

const toolFunctionMap = {
  schedule_appointment: callScheduleAppointment
};

export async function handleToolCalls(toolCalls) {
  const results = [];

  for (const toolCall of toolCalls) {
    const funcName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || "{}");
    const func = toolFunctionMap[funcName];

    if (!func) {
      console.warn(`⚠️ Unknown tool function: ${funcName}`);
      continue;
    }

    try {
      const result = await func(args);
      results.push({ name: funcName, result });
    } catch (err) {
      results.push({ name: funcName, error: err.message });
    }
  }

  return results;
}
