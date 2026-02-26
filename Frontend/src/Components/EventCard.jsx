import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { RegistrationApi } from '../api/client.js';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function EventCard({ event, onPrimaryClick, primaryLabel = 'Register' }) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loadingReg, setLoadingReg] = useState(false);

  const title = event.name || event.title || 'Untitled Event';
  const description = event.description || 'No description provided';
  const date = event.date;
  const time = event.time;
  const venue = event.venue || event.location;
  const image = event.image;
  const fee = event.fee;
  const contactNo = event.contactNo;
  const totalSeats = event.totalSeats;

  const isEventSoon = (() => {
    if (!date) return false;
    const eventDate = new Date(date);
    const now = new Date();
    const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  })();

  const isPast = date && new Date(date) < new Date();

  const checkRegistration = useCallback(async (signal) => {
    const userId = user?.id || user?._id;
    const eventId = event?._id;

    if (!userId || !eventId) {
      setIsRegistered(false);
      return;
    }

    setLoadingReg(true);
    try {
      const res = await RegistrationApi.getStudentsForEvent(eventId, { signal });

      // Extract registrations array from various possible API response shapes
      let registrations = [];
      if (Array.isArray(res.data)) {
        registrations = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        registrations = res.data.data;
      } else if (res.data?.students && Array.isArray(res.data.students)) {
        registrations = res.data.students;
      } else if (res.data?.registrations && Array.isArray(res.data.registrations)) {
        registrations = res.data.registrations;
      } else {
        console.warn('Unexpected API response structure', res.data);
      }

      // Update registered count
      setRegisteredCount(registrations.length);

      // Check if current user is registered
      const found = registrations.some(reg => {
        const studentId = reg.studentId || reg.student?._id || reg.student?.id || reg.userId || reg.user?._id || reg.user?.id;
        return studentId?.toString() === userId.toString();
      });

      setIsRegistered(found);
    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        console.error('Failed to fetch registrations', error);
      }
      setIsRegistered(false);
      setRegisteredCount(0);
    } finally {
      setLoadingReg(false);
    }
  }, [event?._id, user?.id, user?._id]);

  useEffect(() => {
    const abortController = new AbortController();
    checkRegistration(abortController.signal);
    return () => abortController.abort();
  }, [checkRegistration]);

  // Button styling
  let buttonClasses = "mt-2 w-full text-sm py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ";
  let buttonLabel = primaryLabel;
  let disabled = false;

  if (loadingReg) {
    buttonClasses += "bg-gray-400 text-white cursor-wait";
    buttonLabel = "Checking...";
    disabled = true;
  } else if (isPast) {
    buttonClasses += "bg-gray-300 text-gray-600 cursor-not-allowed";
    buttonLabel = "Event Ended";
    disabled = true;
  } else if (isRegistered) {
    buttonClasses += "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500";
    buttonLabel = "Registered ✓";
  } else if (isEventSoon) {
    buttonClasses += "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
  } else {
    buttonClasses += "bg-amber-700 hover:bg-amber-800 text-amber-50 focus:ring-amber-500";
  }

  return (
    <article className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="h-40 bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-amber-100 text-opacity-80 text-6xl font-light">📅</div>
        )}
        {/* Seat count badge (if totalSeats exists) */}
        {totalSeats && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="bg-amber-900 text-amber-100 text-xs px-2 py-1 rounded-full shadow">
              {registeredCount} / {totalSeats} seats
            </span>
          </div>
        )}
        {/* If totalSeats not provided, still show registered count optionally */}
        {!totalSeats && registeredCount > 0 && (
          <span className="absolute top-2 right-2 bg-amber-900 text-amber-100 text-xs px-2 py-1 rounded-full shadow">
            {registeredCount} registered
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base text-amber-900 line-clamp-2">{title}</h3>
          {!isRegistered && isEventSoon && !isPast && !loadingReg && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Soon!</span>
          )}
        </div>

        <p className="text-sm text-amber-700 line-clamp-2">{description}</p>

        <div className="space-y-2 text-sm text-amber-800">
          {date && (
            <div className="flex items-center gap-2">
              <span className="text-amber-600" role="img" aria-label="calendar">📅</span>
              <span>{formatDate(date)}</span>
            </div>
          )}
          {time && (
            <div className="flex items-center gap-2">
              <span className="text-amber-600" role="img" aria-label="time">⏰</span>
              <span>{time}</span>
            </div>
          )}
          {venue && (
            <div className="flex items-center gap-2">
              <span className="text-amber-600" role="img" aria-label="location">📍</span>
              <span className="truncate">{venue}</span>
            </div>
          )}
          {contactNo && (
            <div className="flex items-center gap-2 ">
              <span className="text-green-700" role="img" aria-label="time">📞</span>
              <span>{contactNo}</span>
            </div>
          )}
          {fee && (
            <div className="flex items-center gap-2 px-2">
              <span className="text-amber-600" role="img" aria-label="time">₹</span>
              <span>{fee}</span>
            </div>
          )}
        </div>

        <button
          onClick={disabled ? undefined : onPrimaryClick}
          disabled={disabled}
          className={buttonClasses}
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

export default EventCard;