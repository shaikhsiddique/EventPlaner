import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { RegistrationApi } from '../api/client.js';

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];
const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Other'];

function EventRegistrationPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isStudent } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    year: '',
    teamSize: '1',
    paymentReference: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isStudent) {
    return (
      <main className="pt-24 px-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-600">
          Only students can register for events.
        </p>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await RegistrationApi.registerForEvent(eventId, form);
      navigate('/student');
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-24 px-4 pb-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-xl space-y-6"
      >
        <h1 className="text-xl font-semibold mb-2">Event Registration</h1>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <section>
          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">
                Full Name *
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Phone Number *
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">
                College Name *
                <input
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Branch/Major *
                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Year of Study *
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Event Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">
                Team Size
                <select
                  name="teamSize"
                  value={form.teamSize}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  {['1', '2', '3', '4', '5'].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Payment Details
          </h2>
          <div>
            <label className="text-xs text-gray-600">
              Payment Reference ID
              <input
                name="paymentReference"
                value={form.paymentReference}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white text-sm py-3 rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {submitting ? 'Submitting...' : 'Complete Registration'}
        </button>
      </form>
    </main>
  );
}

export default EventRegistrationPage;


