import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { findBestTherapist } from "../services/findBestTherapist";
import { scheduleAppointment } from "../services/scheduleAppointment";

const questions = [
  { name: "full_name", text: "👋 Hi there! What's your full name?" },
  { name: "email", text: "📧 What's your email address?" },
  { name: "phone", text: "📞 What's your phone number?" },
  { name: "insurance_provider", text: "🛡️ What insurance provider do you have?" }, // moved here ✅
  { name: "problem_description", text: "🩺 Can you describe the problem you're facing?" },
  { name: "preferred_schedule", text: "🕒 When would you prefer to schedule an appointment?" }
];

export default function PatientChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome to our therapy schedule assistant! 👋 Hi there! What's your full name?" },
  ]);
  const [patient, setPatient] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedTherapist, setMatchedTherapist] = useState(null); // not true/false — store therapist object
  const [appointmentFinished, setAppointmentFinished] = useState(false); // ✅ new flag

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Show user message
    setMessages(prev => [...prev, { role: "user", text: userInput }]);

    const currentField = questions[currentQuestionIndex].name;
    const nextIndex = currentQuestionIndex + 1;

    // Save field
    const updatedPatient = { ...patient, [currentField]: userInput };
    setPatient(updatedPatient);

    setLoading(true);
    setUserInput("");

    setTimeout(async () => {
      try {
        // 🧠 Match therapist immediately after problem description
        if (currentField === "problem_description") {
          const match = await findBestTherapist(updatedPatient);

          if (!match) {
            setMessages(prev => [
              ...prev,
              { role: "bot", text: "❌ Sorry, we couldn't find a therapist that matches your needs. Please try again later." }
            ]);
            setLoading(false);
            return;
          }

          setMatchedTherapist(match);
          setMessages(prev => [
            ...prev,
            { role: "bot", text: `✅ Found a therapist for you: ${match.therapist_name}. Let's finish scheduling.` }
          ]);
        }

        // 🧾 Ask next question if needed
        if (nextIndex < questions.length) {
          setCurrentQuestionIndex(nextIndex);
          setMessages(prev => [
            ...prev,
            { role: "bot", text: questions[nextIndex].text }
          ]);
          setLoading(false);
          return;
        }

        // 🧾 Final step: Save to DB and schedule
        const { data: newPatient, error } = await supabase
          .from("patients")
          .insert([updatedPatient])
          .select();

        if (error || !newPatient?.length) throw new Error("Patient insert failed");

        const patientId = newPatient[0].id;

        setMessages(prev => [
          ...prev,
          { role: "bot", text: "📅 Scheduling your appointment..." }
        ]);

        const result = await scheduleAppointment(updatedPatient, matchedTherapist, patientId);

        if (result.status === "scheduled") {
          setMessages(prev => [
            ...prev,
            {
              role: "bot",
              text: `✅ Your appointment with ${matchedTherapist.therapist_name} is confirmed on ${result.appointment_time}.\n🔗 Meet Link: ${result.meetingLink}`
            }
          ]);
          setAppointmentFinished(true); // ✅ Disable input here!
        } else if (result.status === "conflict") {
          setMessages(prev => [
            ...prev,
            { role: "bot", text: `⚠️ ${matchedTherapist.therapist_name} is unavailable at that time. Please try another time.` }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { role: "bot", text: `❌ Something went wrong while booking. Please try again later.` }
          ]);
        }

      } catch (err) {
        console.error("[handleSend] Error:", err.message);
        setMessages(prev => [
          ...prev,
          { role: "bot", text: "⚠️ Unexpected error occurred. Please try again later." }
        ]);
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-4xl font-bold text-center mb-12">Patient Chatbot</h1>

      <div className="flex flex-col space-y-4 overflow-y-auto h-[500px] p-6 border rounded-xl bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-xs ${
              msg.role === "bot"
                ? "bg-gray-200 self-start"
                : "bg-blue-500 text-white self-end"
            }`}
          >
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
          disabled={loading || appointmentFinished} // ✅ only disable after appointment
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
