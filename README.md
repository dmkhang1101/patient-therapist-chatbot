# 🧠 Patient-Therapist Chatbot and Admin Dashboard

This project is a simple healthcare intake application that helps patients connect with the right therapist based on their problem description and insurance information.  
It features a chatbot for patients and an admin dashboard for healthcare staff.

---

## ✨ Features

- 🗨️ **Patient Chatbot**: Step-by-step conversational flow to collect patient's:
  - Name
  - Email
  - Phone
  - Insurance provider
  - Problem description
  - Preferred appointment schedule
- 🔎 **AI Matching**: Extracts patient's problem description and therapists' profiles, use OpenAI to match patient with a suitable therapist based on specialty and insurance.
- 📅 **Appointment Recording**: 
  - Automatically creates a Google Calendar event with a Google Meet link.
  - Adds both patient and therapist as attendees.
  - Sends Google Calendar invitations to both parties.
- 🛡️ ***Insurance Matching**: Ensures therapists accept the patient's insurance before matching.
- 📊 **Admin Dashboard**:
  - View list of patient inquiries
  - View list of scheduled appointments
  - Displays patient name, therapist name, meeting time, and meeting link (if available)
- 📬 **Automatic Notifications**:
  - Patients and Therapists receive official Google Calendar invites and reminders.
  - Organizer (admin) sees all appointments directly on their Calendar.

---

## 🚀 Technologies Used

- **React.js** (Vite)
- **Supabase** (PostgreSQL database, API)
- **TailwindCSS** (UI styling)
- **OpenAI API** (Keyword extraction for matching)
- **React Router** (for page navigation)
- **chrono-node + luxon** (Natural language date parsing)

---

## 🛠️ Setup Instructions

1. **Clone the repository**:
```bash
   git clone https://github.com/dmkhang1101/patient-therapist-chatbot.git
   cd patient-therapist-chatbot
```

2. **Install dependencies**:
```bash
   npm install
```

3. **Set up Environment Variables**: 
```bash
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    VITE_OPENAI_API_KEY=your-openai-api-key
    VITE_GOOGLE_CLIENT_ID=your-google-client-id
    VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
    VITE_GOOGLE_REFRESH_TOKEN=your-google-refresh-token
```

4. **Run the app locally**:
Visit in your browser at: http://localhost:5173
```bash
   npm run dev
```

## 🛢️ Database Tables

patients
id (UUID)
full_name
email
phone
problem_description
preferred_schedule
insurance_provider
created_at

therapists
id (UUID)
full_name (string)
email (string)
specialty (string)
insurance_accepted (Array of strings)

appointments
id (UUID)
patient_id (FK)
therapist_id (FK)
appointment_time (text for now)
status (e.g., matched, scheduled)
google_meeting_link (optional)
created_at
