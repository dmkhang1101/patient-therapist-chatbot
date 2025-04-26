import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchData() {
        const { data: patientData } = await supabase.from('patients').select('*');
        const { data: appointmentData } = await supabase
            .from('appointments')
            .select(`
                id,
                appointment_time,
                status,
                google_meeting_link,
                patients ( id, full_name ),
                therapists ( id, full_name )
            `);
        setPatients(patientData || []);
        setAppointments(appointmentData || []);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 p-8">
      {/* Centered Page Title */}
      <h1 className="text-4xl font-bold text-center mb-12">
        Admin Dashboard
      </h1>

      {/* Main Content */}
      <div className="w-full max-w-5xl space-y-12">
        {/* Patient Inquiries */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Patient Inquiries</h2>
          <div className="grid gap-6">
            {patients.length > 0 ? (
              patients.map(p => (
                <div key={p.id} className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                  <p><strong>Name:</strong> {p.full_name}</p>
                  <p><strong>Problem:</strong> {p.problem_description}</p>
                  <p><strong>Preferred Schedule:</strong> {p.preferred_schedule}</p>
                  <p><strong>Insurance:</strong> {p.insurance_provider}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No patient inquiries yet.</p>
            )}
          </div>
        </section>

        {/* Appointments */}
        <section>
            <h2 className="text-2xl font-semibold mb-6">Scheduled Appointments</h2>
            <div className="grid gap-6">
                {appointments.length > 0 ? (
                appointments.map(a => (
                    <div key={a.id} className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                    <p><strong>Patient:</strong> {a.patients?.full_name || "Unknown"}</p>
                    <p><strong>Therapist:</strong> {a.therapists?.full_name || "Unknown"}</p>
                    <p><strong>Meeting Time:</strong> {a.appointment_time || "Not set"}</p>
                    <p><strong>Meeting Link:</strong> 
                        {a.google_meeting_link ? (
                        <a href={a.google_meeting_link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                            Join Meeting
                        </a>
                        ) : (
                        " No meeting link yet"
                        )}
                    </p>
                    <p><strong>Status:</strong> {a.status}</p>
                    </div>
                ))
                ) : (
                <p className="text-gray-500">No appointments scheduled yet.</p>
                )}
            </div>
        </section>

      </div>
    </div>
  );
}
