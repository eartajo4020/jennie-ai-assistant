export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <img
            src="/agent.jpg"
            alt="Jennie Artajo"
            className="w-40 h-40 rounded-full mx-auto mb-6 object-cover"
          />

          <h1 className="text-5xl font-bold mb-3">
            Ask Jennie AI
          </h1>

          <p className="text-lg text-gray-600">
            Real Estate Broker • Hablo Español
          </p>

          <p className="mt-4">
            224-388-2478 • JArtajo@StarckRE.com
          </p>
        </div>

        <div className="border rounded-2xl p-6 shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Ask a Question
          </h2>

          <input
            placeholder="Type your real estate question..."
            className="w-full border rounded-xl p-4 mb-4"
          />

          <button className="bg-black text-white px-6 py-3 rounded-xl">
            Ask Jennie AI
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border p-5 rounded-2xl">
            What homes are available?
          </div>

          <div className="border p-5 rounded-2xl">
            How do I buy my first home?
          </div>

          <div className="border p-5 rounded-2xl">
            What is my home worth?
          </div>

          <div className="border p-5 rounded-2xl">
            Can I schedule a showing?
          </div>
        </div>

      </div>
    </main>
  );
}