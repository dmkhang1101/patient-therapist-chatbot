import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md w-full py-4 px-8 flex justify-center space-x-10 fixed top-0 left-0 z-50">
      <Link
        to="/"
        className={`text-lg font-semibold ${location.pathname === '/' ? 'text-blue-600 underline' : 'text-gray-600 hover:text-blue-600'}`}
      >
        Patient Chatbot
      </Link>
      <Link
        to="/admin"
        className={`text-lg font-semibold ${location.pathname === '/admin' ? 'text-blue-600 underline' : 'text-gray-600 hover:text-blue-600'}`}
      >
        Admin Dashboard
      </Link>
    </nav>
  );
}
