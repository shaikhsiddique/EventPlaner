import React from 'react';

function FeedbackPage() {
  return (
    <main className="pt-24 px-4 pb-10 flex justify-center bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-8 w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold text-blue-900">Feedback</h1>
        <p className="text-sm text-gray-600">
          Help us improve the event experience. Share your thoughts about the
          platform or any specific event you attended.
        </p>
        <form className="grid grid-cols-1 gap-4">
          <label className="text-xs text-gray-600">
            Your Name (optional)
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Anonymous"
            />
          </label>
          <label className="text-xs text-gray-600">
            Event (optional)
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Event name"
            />
          </label>
          <label className="text-xs text-gray-600">
            Your Feedback
            <textarea
              rows={4}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
              placeholder="What went well? What can we improve?"
            />
          </label>
          <button
            type="submit"
            className="self-start mt-2 bg-blue-600 text-white text-sm px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        </form>
      </section>
    </main>
  );
}

export default FeedbackPage;



