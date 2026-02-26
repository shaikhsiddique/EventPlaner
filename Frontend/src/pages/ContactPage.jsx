import React from 'react';

function ContactPage() {
  return (
    <main className="pt-24 px-4 pb-10 flex justify-center bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-8 w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold text-blue-900">Contact Us</h1>
        <p className="text-sm text-gray-600">
          Have questions about events or facing issues with registration? Reach out
          to the event coordination team and we&apos;ll get back to you.
        </p>
        <form className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs text-gray-600">
              Name
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Your name"
              />
            </label>
            <label className="text-xs text-gray-600">
              Email
              <input
                type="email"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label className="text-xs text-gray-600">
            Message
            <textarea
              rows={4}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
              placeholder="Tell us how we can help..."
            />
          </label>
          <button
            type="submit"
            className="self-start mt-2 bg-blue-600 text-white text-sm px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}

export default ContactPage;



