import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../Components/EventCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { EventApi } from '../api/client.js';

// Helper to parse time string (e.g., "10:30 AM") into hour (0-23)
function getHourFromTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return hour + minute / 60;
}

function StudentDashBoard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();

  // Search & filter state
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [feeType, setFeeType] = useState('all'); // 'all', 'free', 'paid'
  const [timeOfDay, setTimeOfDay] = useState('all'); // 'all', 'morning', 'afternoon', 'evening'

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const eventsRes = await EventApi.list();
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute upcoming events (only future dates)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  // Extract unique venues for filter dropdown
  const venueOptions = useMemo(() => {
    const venues = new Set();
    upcomingEvents.forEach((e) => e.venue && venues.add(e.venue));
    return Array.from(venues).sort();
  }, [upcomingEvents]);

  // Apply all filters and search
  const filteredEvents = useMemo(() => {
    let filtered = upcomingEvents;

    // Search
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.venue?.toLowerCase().includes(term)
      );
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((e) => new Date(e.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => new Date(e.date) <= to);
    }

    // Venue
    if (selectedVenues.length > 0) {
      filtered = filtered.filter((e) => selectedVenues.includes(e.venue));
    }

    // Fee type (assuming events have a `fee` field; if not, ignore this filter)
    if (feeType !== 'all') {
      filtered = filtered.filter((e) => {
        const isFree = !e.fee || e.fee === 0 || e.fee === '0' || e.fee === 'free';
        return feeType === 'free' ? isFree : !isFree;
      });
    }

    // Time of day (based on event.time)
    if (timeOfDay !== 'all') {
      filtered = filtered.filter((e) => {
        const hour = getHourFromTime(e.time);
        if (hour === null) return false;
        if (timeOfDay === 'morning') return hour >= 5 && hour < 12;
        if (timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
        if (timeOfDay === 'evening') return hour >= 17 || hour < 5;
        return true;
      });
    }

    return filtered;
  }, [upcomingEvents, search, dateFrom, dateTo, selectedVenues, feeType, timeOfDay]);

  const handleRegister = (eventId) => {
    if (!isStudent) return;
    navigate(`/student/events/${eventId}/register`);
  };

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedVenues([]);
    setFeeType('all');
    setTimeOfDay('all');
  };

  const toggleVenue = (venue) => {
    setSelectedVenues((prev) =>
      prev.includes(venue) ? prev.filter((v) => v !== venue) : [...prev, venue]
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 sm:mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-2">
            🎉 Upcoming Events
          </h1>
          <p className="text-base sm:text-lg text-amber-700 max-w-2xl mx-auto sm:mx-0">
            Discover and register for the best campus experiences.
          </p>
        </header>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-amber-200 rounded-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            />
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg sm:text-xl">
              🔍
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-md whitespace-nowrap text-sm sm:text-base"
          >
            <span>⚙️</span>
            <span className="font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-amber-800">📅 Date Range</label>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-xs text-center text-amber-600">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Venue Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-amber-800">📍 Venues</label>
              <div className="max-h-32 overflow-y-auto border border-amber-200 rounded-lg p-2">
                {venueOptions.length === 0 ? (
                  <p className="text-xs text-gray-400">No venues available</p>
                ) : (
                  venueOptions.map((venue) => (
                    <label key={venue} className="flex items-center gap-2 text-sm py-1">
                      <input
                        type="checkbox"
                        checked={selectedVenues.includes(venue)}
                        onChange={() => toggleVenue(venue)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="truncate">{venue}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Time of Day */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-amber-800">⏰ Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">Any time</option>
                <option value="morning">Morning (5am – 12pm)</option>
                <option value="afternoon">Afternoon (12pm – 5pm)</option>
                <option value="evening">Evening (5pm – 5am)</option>
              </select>
            </div>

            {/* Fee Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-amber-800">💰 Fee</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-amber-600 hover:text-amber-800 underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-amber-900">
                {filteredEvents.length} event{filteredEvents.length !== 1 && 's'} available
              </h2>
            </div>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white/50 rounded-2xl">
                <p className="text-amber-700 text-base sm:text-lg">No events match your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-amber-600 hover:text-amber-800 underline text-sm sm:text-base"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    user={user}
                    primaryLabel={isStudent ? 'Register Now' : 'View Details'}
                    onPrimaryClick={() => handleRegister(event._id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default StudentDashBoard;