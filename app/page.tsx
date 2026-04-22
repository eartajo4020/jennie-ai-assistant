export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4">Jennie AI Assistant</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get help with home buying, selling, listings, neighborhoods,
            showings, and next steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">What I can help with</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Available listings</li>
              <li>• Buying a home</li>
              <li>• Selling process</li>
              <li>• Neighborhood questions</li>
              <li>• Booking a showing</li>
            </ul>
          </div>

          <div className="border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Contact Jennie</h2>
            <p className="text-gray-700 mb-4">
              Want direct help? Reach out and Jennie will get back to you.
            </p>
            <a
              href="mailto:youremail@example.com"
              className="inline-block rounded-xl bg-black text-white px-5 py-3"
            >
              Email Jennie
            </a>
          </div>
        </div>

        <div className="border rounded-2xl p-8 shadow-sm text-center">
          <h2 className="text-3xl font-semibold mb-4">AI Chat Coming Soon</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page will soon include a live AI assistant visitors can chat with
            for quick real estate questions.
          </p>
        </div>
      </section>
    </main>
  );
}