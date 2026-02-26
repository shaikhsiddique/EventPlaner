import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Single auth context
import { gsap } from "gsap";

function LandingPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isStudent } = useAuth(); // Get user and role info from single context

  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.2,
      });
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.35,
      });
      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        delay: 0.5,
      });
    });
    return () => ctx.revert();
  }, []);

  const goAdmin = () => {
    navigate("/login/admin");
  };

  const goStudent = () => {
    navigate("/login/student");
  };

  const goToDashboard = () => {
    if (isAdmin) {
      navigate("/admin");
    } else if (isStudent) {
      navigate("/student");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="landing-page min-h-[calc(100vh-65px)] w-screen flex items-center justify-center relative bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <section ref={heroRef} className="hero-section overflow-hidden">
        <div className="hero-content flex flex-col items-center justify-center text-center max-w-3xl">

          {user && (
            <div className="mb-4">
              <p className="text-blue-700 font-semibold text-lg">
                Welcome back, {user.name || user.email}!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: {isAdmin ? 'Administrator' : 'Student'}
              </p>
            </div>
          )}

          <h1
            ref={titleRef}
            className="hero-title text-5xl md:text-6xl my-6 font-semibold text-blue-900"
          >
            Smart Event Management
          </h1>

          <p
            ref={subtitleRef}
            className="hero-subtitle text-lg md:text-2xl text-gray-600"
          >
            Streamline your campus events with our intelligent management system.
            <br />
            Create, manage, and participate in events effortlessly.
          </p>

          <div
            ref={buttonsRef}
            className="hero-actions flex my-6 gap-6 flex-wrap justify-center"
          >
            {!user ? (
              // Show login buttons when not logged in
              <>
                <button
                  className="flex px-6 py-3 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors"
                  onClick={goAdmin}
                >
                  Admin Login
                </button>

                <button
                  className="flex px-6 py-3 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  onClick={goStudent}
                >
                  Student Login
                </button>
              </>
            ) : (
              // Show dashboard button when logged in
              <button
                className="flex px-6 py-3 rounded-full bg-green-600 text-white shadow hover:bg-green-700 transition-colors"
                onClick={goToDashboard}
              >
                Go to Dashboard
              </button>
            )}
          </div>

          {user && (
            <p className="text-sm text-gray-400 mt-4">
              You're logged in. Visit your dashboard to manage events.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;