import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPAge';
import Navbar from './Components/Navbar';
import StudentDashBoard from './pages/StudentDashBoard.jsx';
import AdminDashboarding from './pages/AdminDashboarding.jsx';
import EventCreationPage from './pages/EventCreationPage.jsx';
import EventRegistrationPage from './pages/EventRegistrationPage.jsx';
import StudentLoginPage from './pages/StudentLoginPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import StudentSignupPage from './pages/StudentSignupPage.jsx';
import AdminSignupPage from './pages/AdminSignupPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import EventEditPage from './pages/EventEditPage.jsx'; // Import the new edit page

function App() {
  return (
    <div className="min-h-screen max-w-screen bg-[#FAFAFA]">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Auth Routes */}
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/signup/student" element={<StudentSignupPage />} />
        <Route path="/signup/admin" element={<AdminSignupPage />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentDashBoard />} />
        <Route
          path="/student/events/:eventId/register"
          element={<EventRegistrationPage />}
        />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboarding />} />
        <Route path="/admin/events/create" element={<EventCreationPage />} />
        <Route path="/admin/events/edit/:id" element={<EventEditPage />} />
      
      </Routes>
    </div>
  );
}

export default App;