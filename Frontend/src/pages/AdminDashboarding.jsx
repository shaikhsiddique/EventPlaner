import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { EventApi, RegistrationApi } from "../api/client.js";
import { gsap } from "gsap";
import 'remixicon/fonts/remixicon.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------- Certificate Modal ----------
function CertificateModal({ isOpen, onClose, student, event, onGenerate }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [status, setStatus] = useState('participant');
  const [customPosition, setCustomPosition] = useState('');

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

  const handleGenerate = () => {
    const finalStatus = status === 'custom' ? customPosition : status;
    onGenerate(student, event, finalStatus);
    handleClose();
  };

  if (!isOpen || !student || !event) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div ref={overlayRef} className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div ref={contentRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Generate Certificate</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Generate certificate for <span className="font-semibold">{student.fullName || student.name}</span>
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status / Position</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="winner">Winner (1st Place)</option>
                <option value="second">Second Place</option>
                <option value="third">Third Place</option>
                <option value="participant">Participant</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
            {status === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Title</label>
                <input
                  type="text"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  placeholder="e.g. 'Best Performer'"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Generate PDF
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Event Details Modal (updated) ----------
function EventDetailsModal({ event, onClose, registrations, loading }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
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
  }, []);

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

  // Download registrations as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Registrations for ${event.title}`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Total: ${registrations.length}`, 14, 24);
    
    const tableColumn = ["Name", "Email", "College", "Branch", "Year", "Registered On"];
    const tableRows = registrations.map(r => [
      r.fullName || r.studentName || r.name,
      r.email,
      r.college || '-',
      r.branch || '-',
      r.year || '-',
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    doc.save(`registrations_${event.title}.pdf`);
  };

  // Generate certificate PDF for a student
  const generateCertificate = (student, event, position) => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');
    
    // Border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(10);
    doc.rect(20, 20, width - 40, height - 40);

    // Title
    doc.setFontSize(40);
    doc.setTextColor(37, 99, 235);
    doc.text('CERTIFICATE', width / 2, 120, { align: 'center' });

    // Award text
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('This is proudly presented to', width / 2, 200, { align: 'center' });

    // Student name
    doc.setFontSize(36);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(student.fullName || student.name, width / 2, 280, { align: 'center' });

    // Event details
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text(`For participating in "${event.title}"`, width / 2, 340, { align: 'center' });

    // Position/Status
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.setFont(undefined, 'bold');
    const statusText = position.charAt(0).toUpperCase() + position.slice(1);
    doc.text(statusText, width / 2, 400, { align: 'center' });

    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, width / 2, 480, { align: 'center' });

    // Signature line
    doc.setLineWidth(1);
    doc.line(150, 520, 350, 520);
    doc.text('Authorized Signature', 250, 540, { align: 'center' });

    doc.save(`certificate_${student.fullName || student.name}.pdf`);
  };

  if (!event) return null;

  // Calculate seat stats
  const totalSeats = event.totalSeats ? parseInt(event.totalSeats) : null;
  const registeredCount = registrations.length;
  const fillPercent = totalSeats ? Math.min(100, Math.round((registeredCount / totalSeats) * 100)) : 0;
  const seatsLeft = totalSeats ? Math.max(0, totalSeats - registeredCount) : '∞';

  return (
    <>
      <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div ref={overlayRef} className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        <div ref={contentRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{event.name || event.title}</h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 line-clamp-2">
                  {event.description || "No description provided"}
                </p>
              </div>
              <button onClick={handleClose} className="text-white hover:text-blue-200 transition-colors ml-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Event Details + Progress Bar */}
            <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 text-xs sm:text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time || 'Time TBD'}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{event.venue || 'Venue TBD'}</span>
              </div>
            </div>

            {/* Progress Bar & Download Button */}
            <div className="mt-4 flex items-center gap-4">
              {totalSeats && (
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Seats filled: {registeredCount} / {totalSeats}</span>
                    <span>{fillPercent}%</span>
                  </div>
                  <div className="w-full bg-blue-300 rounded-full h-2.5">
                    <div
                      className="bg-yellow-300 h-2.5 rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">{seatsLeft} seats left</p>
                </div>
              )}
              <button
                onClick={downloadPDF}
                disabled={registrations.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-file-pdf-line mr-1"></i> Download PDF
              </button>
            </div>
          </div>

          {/* Table of Students */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-500 mt-2">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700">No Registrations Yet</h3>
                <p className="text-gray-500 mt-1">Students haven't registered for this event.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[900px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 sm:px-5 py-3 text-left">Student Name</th>
                      <th className="px-3 sm:px-5 py-3 text-left">Email</th>
                      <th className="px-3 sm:px-5 py-3 text-left">College</th>
                      <th className="px-3 sm:px-5 py-3 text-left">Branch</th>
                      <th className="px-3 sm:px-5 py-3 text-left">Year</th>
                      <th className="px-3 sm:px-5 py-3 text-left">Registered On</th>
                      <th className="px-3 sm:px-5 py-3 text-left">Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r, index) => (
                      <tr key={r._id || index} className="border-t hover:bg-gray-50">
                        <td className="px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                          {r.fullName || r.studentName || r.name}
                        </td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">{r.email}</td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">{r.college || '-'}</td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">{r.branch || '-'}</td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">{r.year || '-'}</td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(r);
                              setCertModalOpen(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                          >
                            <i className="ri-award-line"></i> Generate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        student={selectedStudent}
        event={event}
        onGenerate={generateCertificate}
      />
    </>
  );
}

// ---------- Main AdminDashboarding Component ----------
function AdminDashboarding() {
  const { isAdmin, user } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await EventApi.list();
        setEvents(res.data || []);
      } catch (err) {
        setError("Unable to load events");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [isAdmin]);

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setModalLoading(true);

    try {
      const res = await RegistrationApi.getStudentsForEvent(event._id);
      setRegistrations(res.data || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setRegistrations([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeleteLoading(true);
      await EventApi.remove(eventId);
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return events;
    const term = search.toLowerCase();
    return events.filter((event) => {
      return (
        event.name?.toLowerCase().includes(term) ||
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term)
      );
    });
  }, [events, search]);

  if (!isAdmin) {
    return (
      <main className="pt-24 text-center">
        <p className="text-gray-500">Only admins can view this page.</p>
      </main>
    );
  }

  return (
    <main className="pt-24 px-4 sm:px-6 pb-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Hello, {user?.name || user?.fullName || "Admin"} 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Manage your events and view student registrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link
            to="/admin/events/create"
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + Create Event
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-2">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">No events found</h3>
          <p className="text-gray-500 mt-1">
            {search ? "Try a different search term" : "Create your first event to get started"}
          </p>
          {!search && (
            <Link to="/admin/events/create" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((event) => {
            // We don't have registrations count per event here unless we fetch separately,
            // but we can optionally add a small seat indicator using event.totalSeats only.
            // For now, we'll just show a progress bar if totalSeats exists (without count).
            // Better: we could fetch counts per event, but that would be extra calls.
            // We'll keep it simple: the progress bar will be shown in the modal.
            return (
              <div
                key={event._id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleEventClick(event)}
              >
                {/* Image */}
                <div className="h-[30vh] bg-gray-200 relative overflow-hidden">
                  {event.image ? (
                    <img src={event.image} alt={event.name || event.title} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Link
                      to={`/admin/events/edit/${event._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors group"
                      title="Edit event"
                    >
                      <i className="ri-pencil-line text-green-500 text-lg group-hover:scale-110 transition-transform"></i>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(event._id, event.name || event.title, e)}
                      disabled={deleteLoading}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors group"
                      title="Delete event"
                    >
                      <i className="ri-delete-bin-7-line text-red-500 text-lg group-hover:scale-110 transition-transform"></i>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{event.name || event.title}</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.venue || 'Venue TBD'}</span>
                    </div>
                    {event.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mt-2">{event.description}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-500">Click to view registrations</span>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowModal(false)}
          registrations={registrations}
          loading={modalLoading}
        />
      )}
    </main>
  );
}

export default AdminDashboarding;