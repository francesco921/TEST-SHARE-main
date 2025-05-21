import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-wide">Thynk Unlimited</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Developing<br />Market Size
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            A thoughtful combination of design and function to support your everyday movement.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.hrascendpress.online/upload"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded shadow hover:bg-blue-700"
            >
              Upload a Quiz
            </a>
            <a
              href="https://www.hrascendpress.online/quizzes"
              className="bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded shadow hover:bg-gray-400"
            >
              Start a Quiz
            </a>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <Image
            src="/preview-phone.png"
            alt="Book Preview"
            width={600}
            height={900}
            className="w-[600px] h-auto rounded-xl shadow-lg"
          />
        </div>
      </main>
    </div>
  );
}
