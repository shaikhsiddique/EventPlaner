import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { EventApi, RegistrationApi } from "../api/client.js";
import { gsap } from "gsap";

// Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, eventTitle }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.inOut" }
        );
        
        gsap.fromTo(contentRef.current,
          { scale: 0.8, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
      });

      return () => ctx.revert();
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: "power2.in"
    });
    
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={overlayRef} className="absolute inset-0 bg-black bg-opacity-50" />
      
      <div ref={contentRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Delete Event</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          
          <p className="text-center text-gray-700 mb-2">
            Are you sure you want to delete
          </p>
          <p className="text-center font-semibold text-gray-900 mb-6">
            "{eventTitle}"?
          </p>
          <p className="text-center text-sm text-gray-500 mb-6">
            This action cannot be undone. All registrations for this event will also be deleted.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    category: "",
    image: "",
    status: "upcoming"
  });

  const pageRef = useRef(null);
  const formRef = useRef(null);

  // Fetch event data
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }

    async function fetchEventData() {
      try {
        setLoading(true);
        setError("");
        
        // Fetch event details using get() method
        const eventRes = await EventApi.get(id);
        const eventData = eventRes.data;
        setEvent(eventData);
        
        // Format date for input (YYYY-MM-DD)
        const formattedDate = eventData.date 
          ? new Date(eventData.date).toISOString().split('T')[0]
          : "";
        
        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          date: formattedDate,
          time: eventData.time || "",
          location: eventData.location || "",
          capacity: eventData.capacity || "",
          category: eventData.category || "",
          image: eventData.image || "",
          status: eventData.status || "upcoming"
        });

        // Fetch registrations for this event
        try {
          const regRes = await RegistrationApi.getStudentsForEvent(id);
          setRegistrations(regRes.data || []);
        } catch (regErr) {
          console.log("No registrations found or error fetching:", regErr);
          setRegistrations([]); // Set empty array if no registrations
        }
        
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err?.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEventData();
    }
  }, [id, isAdmin, navigate]);

  // GSAP animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out"
      });
      
      gsap.from(formRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Using update() method from EventApi
      await EventApi.update(id, formData);
      setSuccess("Event updated successfully!");
      
      // Update local event data
      setEvent(prev => ({ ...prev, ...formData }));
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err?.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      // Using remove() method from EventApi
      await EventApi.remove(id);
      navigate("/admin", { 
        state: { message: "Event deleted successfully!" } 
      });
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err?.response?.data?.message || "Failed to delete event");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <main className="pt-24 text-center">
        <p className="text-gray-500">Only admins can access this page.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-24 px-6 pb-10 max-w-4xl mx-auto text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-500 mt-2">Loading event details...</p>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="pt-24 px-6 pb-10 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link
          to="/admin"
          className="inline-block mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main ref={pageRef} className="pt-24 px-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold">Edit Event</h1>
          <p className="text-gray-500 text-sm mt-1">Update event details and manage registrations</p>
        </div>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          {deleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Event
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Event Stats */}
      {registrations.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-3">Registration Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-600">Total Registrations</p>
              <p className="text-2xl font-bold text-blue-900">{registrations.length}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Capacity</p>
              <p className="text-2xl font-bold text-blue-900">
                {formData.capacity || "Unlimited"}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Available Spots</p>
              <p className="text-2xl font-bold text-blue-900">
                {formData.capacity 
                  ? Math.max(0, parseInt(formData.capacity) - registrations.length)
                  : "∞"}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Fill Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {formData.capacity && parseInt(formData.capacity) > 0
                  ? `${Math.round((registrations.length / parseInt(formData.capacity)) * 100)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div ref={formRef} className="bg-white border rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your event..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event venue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum attendees"
              />
            </div>
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Conference</option>
                <option value="social">Social Event</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
            
            <Link
              to="/admin"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Registrations List */}
      {registrations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Registered Students ({registrations.length})
          </h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-5 py-3 text-left">Student Name</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">College</th>
                    <th className="px-5 py-3 text-left">Branch</th>
                    <th className="px-5 py-3 text-left">Year</th>
                    <th className="px-5 py-3 text-left">Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r, index) => (
                    <tr key={r._id || index} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">
                        {r.fullName || r.studentName || r.name || "N/A"}
                      </td>
                      <td className="px-5 py-3">{r.email || "N/A"}</td>
                      <td className="px-5 py-3">{r.college || "N/A"}</td>
                      <td className="px-5 py-3">{r.branch || "N/A"}</td>
                      <td className="px-5 py-3">{r.year || "N/A"}</td>
                      <td className="px-5 py-3">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        eventTitle={event?.title}
      />
    </main>
  );
}

export default EventEditPage;