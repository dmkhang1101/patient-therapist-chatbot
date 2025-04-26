import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { extractKeywords } from "../services/openAIClient";

const questions = [
  { name: "full_name", text: "👋 Hi there! What's your full name?" },
  { name: "email", text: "📧 What's your email address?" },
  { name: "phone", text: "📞 What's your phone number?" },
  { name: "problem_description", text: "🩺 Can you describe the problem you're facing?" },
  { name: "preferred_schedule", text: "🕒 When would you prefer to schedule an appointment?" },
  { name: "insurance_provider", text: "🛡️ What insurance provider do you have?" },
];

export default function PatientChatbot() {
  const [messages, setMessages] = useState([{ role: 'bot', text: "Welcome to our therapy schedule assistant! 👋 Hi there! What's your full name?" }]);
  const [patient, setPatient] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedTherapist, setMatchedTherapist] = useState(null);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Save user message
    setMessages(prev => [...prev, { role: 'user', text: userInput }]);
    
    const currentField = questions[currentQuestionIndex].name;
    setPatient(prev => ({ ...prev, [currentField]: userInput }));

    setLoading(true);
    setUserInput("");

    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setMessages(prev => [...prev, { role: 'bot', text: questions[currentQuestionIndex + 1].text }]);
      } else {
        // End of questions, now process matching
        try {
          const completedPatient = {
            ...patient,
            [questions[currentQuestionIndex].name]: userInput
          };
        
          const { data: newPatient, error } = await supabase
            .from('patients')
            .insert([completedPatient])
            .select();
        
          if (error) throw error;

          const keywords = await extractKeywords(patient.problem_description);
          const { data: therapists } = await supabase.from('therapists').select('*');

          const bestMatch = therapists.find(t => {
            // Normalize all specialties and keywords to lowercase
            const therapistSpecialties = t.specialty.map(s => s.toLowerCase());
            const normalizedKeywords = keywords.map(k => k.toLowerCase());
          
            // Check if there is any overlap
            const specialtyMatch = normalizedKeywords.some(keyword =>
              therapistSpecialties.some(specialty => specialty.includes(keyword) || keyword.includes(specialty))
            );
          
            // Normalize insurance names
            const therapistInsurances = t.insurance_accepted.map(i => i.toLowerCase());
            const patientInsurance = (patient.insurance_provider || "").toLowerCase();
          
            const insuranceMatch = therapistInsurances.some(ins => ins.includes(patientInsurance) || patientInsurance.includes(ins));
          
            return specialtyMatch && insuranceMatch;
          });

          setMatchedTherapist(bestMatch);

          if (bestMatch) {
            setMessages(prev => [
              ...prev,
              { role: 'bot', text: `✅ Thanks ${patient.full_name}! We found a therapist for you: ${bestMatch.full_name}, specialized in ${bestMatch.specialty.join(', ')}.` }
            ]);
            // Create appointment record
            const { error: appointmentError } = await supabase.from('appointments').insert([
              {
                patient_id: newPatient[0].id,   // the patient you just inserted
                therapist_id: bestMatch.id,     // the matched therapist
                appointment_time: null,         // no specific time yet
                status: 'matched',              // custom status: "matched"
                google_meeting_link: null       // no calendar link yet
              }
            ]);

            setMessages(prev => [
              ...prev,
              { role: 'bot', text: `✅ The appointment is successfully booked.` }
            ]);

            if (appointmentError) {
              console.error('Failed to create appointment:', appointmentError.message);
            }
          } else {
            setMessages(prev => [
              ...prev,
              { role: 'bot', text: `😔 Thanks ${patient.full_name}. Unfortunately, we couldn't find a perfect match yet. We'll get back to you soon!` }
            ]);
          }
        } catch (err) {
          console.error(err.message);
          setMessages(prev => [...prev, { role: 'bot', text: "⚠️ Something went wrong. Please try again later." }]);
        }
      }
      setLoading(false);
    }, 1000); // Fake "thinking" delay
  };

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto space-y-4">
      {/* Centered Page Title */}
      <h1 className="text-4xl font-bold text-center mb-12">
        Patient Chatbot
      </h1>
      <div className="flex flex-col space-y-4 overflow-y-auto h-[500px] p-6 border rounded-xl bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-lg max-w-xs ${msg.role === 'bot' ? 'bg-gray-200 self-start' : 'bg-blue-500 text-white self-end'}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-gray-200 self-start animate-pulse">
            Typing...
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          className="border p-2 flex-1 rounded-lg"
          type="text"
          placeholder="Please provide your answer..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          disabled={loading || matchedTherapist}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleSend}
          disabled={loading || matchedTherapist}
        >
          Send
        </button>
      </div>
    </div>
  );
}
