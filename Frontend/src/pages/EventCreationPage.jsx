import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { EventApi } from "../api/client.js";

function EventCreationPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    contactNo: "",            // ← NEW: contact number field
    totalSeats: "",
    fee: "",                 
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});        
  const [generalError, setGeneralError] = useState("");

  if (!isAdmin) {
    return (
      <main className="pt-24 px-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-600">Only admins can create events.</p>
      </main>
    );
  }

  // ---------- Validation ----------
  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!form.name.trim()) newErrors.name = "Event name is required";

    // Description
    if (!form.description.trim()) newErrors.description = "Description is required";

    // Date
    if (!form.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.date = "Date cannot be in the past";
    }

    // Time
    if (!form.time) newErrors.time = "Time is required";

    // Venue
    if (!form.venue.trim()) newErrors.venue = "Venue is required";

    // Contact No (NEW)
    if (!form.contactNo.trim()) newErrors.contactNo = "Contact number is required";

    // Total Seats
    if (!form.totalSeats) {
      newErrors.totalSeats = "Total seats is required";
    } else {
      const seats = Number(form.totalSeats);
      if (!Number.isInteger(seats) || seats <= 0)
        newErrors.totalSeats = "Total seats must be a positive integer";
    }

    // Fee
    if (!form.fee && form.fee !== "0") {
      newErrors.fee = "Fee is required (enter 0 for free)";
    } else {
      const fee = parseFloat(form.fee);
      if (isNaN(fee) || fee < 0)
        newErrors.fee = "Fee must be a valid positive number (or 0)";
    }

    return newErrors;
  };

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setGeneralError("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setGeneralError("Image size must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setGeneralError("");

    try {
      const formData = new FormData();

      // Append all form fields (contactNo will be included automatically)
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (image) {
        formData.append("image", image);
      }

      await EventApi.create(formData);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setGeneralError("Could not create event. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ field }) => {
    if (!errors[field]) return null;
    return <p className="text-xs text-red-500 mt-1">{errors[field]}</p>;
  };

  return (
    <main className="pt-24 px-4 pb-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-xl space-y-6"
      >
        <h1 className="text-xl font-semibold mb-2">Create New Event</h1>

        {generalError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{generalError}</p>}

        <div className="space-y-4">
          {/* Event Name */}
          <div>
            <label className="text-xs text-gray-600">
              Event Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="name" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-600">
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="description" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">
                Date *
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </label>
              <FieldError field="date" />
            </div>

            <div>
              <label className="text-xs text-gray-600">
                Time *
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </label>
              <FieldError field="time" />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-xs text-gray-600">
              Venue *
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                  errors.venue ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="venue" />
          </div>

          {/* Contact Number - NEW */}
          <div>
            <label className="text-xs text-gray-600">
              Contact Number *
              <input
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                placeholder="e.g. 08012345678"
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                  errors.contactNo ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="contactNo" />
          </div>

          {/* Total Seats */}
          <div>
            <label className="text-xs text-gray-600">
              Total Seats *
              <input
                type="number"
                name="totalSeats"
                value={form.totalSeats}
                onChange={handleChange}
                min="1"
                step="1"
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                  errors.totalSeats ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="totalSeats" />
          </div>

          {/* Fee */}
          <div>
            <label className="text-xs text-gray-600">
              Fee (₦) * <span className="text-gray-400">(0 for free)</span>
              <input
                type="number"
                name="fee"
                value={form.fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${
                  errors.fee ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            <FieldError field="fee" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs text-gray-600 block">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Max size 5MB</p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img
                src={preview}
                alt="preview"
                className="w-full h-48 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white text-sm py-3 rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </main>
  );
}

export default EventCreationPage;