import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { handleToolCalls } from "../services/handleToolCalls";
import { findBestTherapist } from "../services/findBestTherapist"; 
import { scheduleWithAI } from "../services/scheduleWithAI";

const questions = [
  { name: "full_name", text: "👋 Hi there! What's your full name?" },
  { name: "email", text: "📧 What's your email address?" },
  { name: "phone", text: "📞 What's your phone number?" },
  { name: "insurance_provider", text: "🛡️ What insurance provider do you have?" },
  { name: "problem_description", text: "🩺 Can you describe the problem you're facing?" },
  { name: "preferred_schedule", text: "🕒 When would you prefer to schedule an appointment?" }
];

export default function PatientChatbot() {
  const [messages, setMessages] = useState([{ role: "bot", text: questions[0].text }]);
  const [patient, setPatient] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedTherapist, setMatchedTherapist] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [appointmentFinished, setAppointmentFinished] = useState(false);

  // Handle typing a message
  const handleSend = async () => {
    if (!userInput.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: userInput }]);

    const currentField = questions[currentQuestionIndex].name;
    const updatedPatient = { ...patient, [currentField]: userInput };

    setPatient(updatedPatient);
    setUserInput("");
    setLoading(true);

    setTimeout(async () => {
      try {
        if (currentField === "problem_description") {
          await handleProblemDescription(updatedPatient);
        } else if (currentField === "preferred_schedule") {
          await handleScheduling(updatedPatient);
        } else {
          await handleIntakeStep(updatedPatient);
        }
      } catch (err) {
        console.error("[handleSend] Error:", err.message);
        setMessages(prev => [...prev, { role: "bot", text: "⚠️ Unexpected error occurred. Please try again later." }]);
      }
      setLoading(false);
    }, 800);
  };

  // Handle normal intake steps (name, email, phone, insurance)
  const handleIntakeStep = async (updatedPatient) => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setMessages(prev => [...prev, { role: "bot", text: questions[nextIndex].text }]);
  };

  // Handle matching after problem description
  const handleProblemDescription = async (updatedPatient) => {
    const match = await findBestTherapist(updatedPatient);
  
    if (!match || !match.therapist_id) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "❌ Sorry, we couldn't find a therapist that matches your needs. You can try describing your issue differently or come back later."
      }]);
    
      const problemIndex = questions.findIndex(q => q.name === "problem_description");
      setCurrentQuestionIndex(problemIndex);
      setLoading(false);
      return;
    }
  
    setMatchedTherapist(match);
    setMessages(prev => [...prev, {
      role: "bot",
      text: `✅ Matched with ${match.therapist_name}! Let's continue.`
    }]);
  
    const { data: newPatient, error } = await supabase.from("patients").insert([updatedPatient]).select();
    if (error || !newPatient?.length) throw new Error("Patient insert failed");
  
    setPatientId(newPatient[0].id);
  
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setMessages(prev => [...prev, { role: "bot", text: questions[nextIndex].text }]);
  };

  // Handle scheduling after preferred_schedule
  const handleScheduling = async (updatedPatient) => {
    const toolCalls = await scheduleWithAI({
      patient: updatedPatient,
      patientId,
      matchedTherapist
    });
  
    if (!toolCalls?.length) {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Unable to schedule. Please try a different time." }]);
      return;
    }
  
    const results = await handleToolCalls(toolCalls, {
      patient,
      patient_id: patientId
    });
  
    const scheduleResult = results.find(res => res.name === "schedule_appointment")?.result;
  
    if (scheduleResult?.status === "scheduled") {
      setMessages(prev => [...prev, {
        role: "bot",
        text: `✅ Your appointment is confirmed on ${scheduleResult.appointment_time}.\n🔗 Meet Link: ${scheduleResult.meetingLink}`
      }]);
      setAppointmentFinished(true);
    } else if (scheduleResult?.status === "conflict") {
      setMessages(prev => [...prev, {
        role: "bot",
        text: `⚠️ Your therapist is unavailable at that time. Please enter a new preferred time.`
      }]);
    } else {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "❌ Something went wrong. Please provide an appropriate time slot."
      }]);
    }
  };

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-4xl font-bold text-center mb-12">Patient Chatbot</h1>

      <div className="flex flex-col space-y-4 overflow-y-auto h-[500px] p-6 border rounded-xl bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-lg max-w-xs ${msg.role === "bot" ? "bg-gray-200 self-start" : "bg-blue-500 text-white self-end"}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-gray-200 self-start animate-pulse">Typing...</div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          className="border p-2 flex-1 rounded-lg"
          type="text"
          placeholder="Please provide your answer..."
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading || appointmentFinished}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleSend}
          disabled={loading || appointmentFinished}
        >
          Send
        </button>
      </div>
    </div>
  );
}
