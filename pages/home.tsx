export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to HR Ascend Press</h1>
        <p className="text-lg mb-8">
          Upload, manage, and deliver professional quizzes with ease.
        </p>
        <a
          href="/upload"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700"
        >
          Go to Upload Page
        </a>
      </div>
    </div>
  );
}
