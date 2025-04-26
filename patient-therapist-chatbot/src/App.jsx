import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientChatbot from "./components/PatientChatbot";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />

        {/* Content with padding-top to make space for fixed navbar */}
        <div className="flex-1 flex justify-center items-center pt-24 px-4">
          <div className="w-full max-w-4xl">
            <Routes>
              <Route path="/" element={<PatientChatbot />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;