# 🧠 Patient-Therapist Chatbot and Admin Dashboard

This project is a simple healthcare intake application that helps patients connect with the right therapist based on their problem description and insurance information.  
It features a chatbot for patients and an admin dashboard for healthcare staff.

---

## ✨ Features

- 🗨️ **Patient Chatbot**: Step-by-step conversational flow to collect patient's:
  - Name
  - Email
  - Phone
  - Problem description
  - Preferred appointment schedule
  - Insurance provider
- 🔎 **AI Matching**: Extracts keywords from the patient's problem description using OpenAI and matches with a suitable therapist based on specialty and insurance.
- 📅 **Appointment Recording**: After matching, creates an appointment entry in the database (no Google Calendar integration yet).
- 📊 **Admin Dashboard**:
  - View list of patient inquiries
  - View list of scheduled appointments
  - Displays patient name, therapist name, meeting time, and meeting link (if available)

---

## 🚀 Technologies Used

- **React.js** (Vite)
- **Supabase** (PostgreSQL database, API)
- **TailwindCSS** (UI styling)
- **OpenAI API** (Keyword extraction for matching)
- **React Router** (for page navigation)

---

## 🛠️ Setup Instructions

1. **Clone the repository**:
```bash
   git clone https://github.com/dmkhang1101/patient-therapist-chatbot.git
   cd your-project-folder
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
full_name
specialty (Array of strings)
insurance_accepted (Array of strings)
google_calendar_id (optional)

appointments
id (UUID)
patient_id (FK)
therapist_id (FK)
appointment_time (text for now)
status (e.g., matched, scheduled)
google_meeting_link (optional)
created_at

## 📚 How Matching Works
Patient submits problem description.
OpenAI extracts important keywords.
The app matches therapists based on:
Overlapping specialties (flexible matching)
Accepted insurance
If a match is found:
Appointment is recorded into the database
A success message is shown to the patient.