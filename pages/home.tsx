import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#f0fcff] text-gray-900">
      <header className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon1.png"
            alt="HR Ascend Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <h1 className="text-2xl font-bold tracking-wide text-gray-800">
            HR Ascend Press
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col-reverse md:flex-row items-center justify-between gap-16">
        <div className="max-w-xl w-full text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 text-gray-900">
            Excel in your<br />
            SHRM CP/SCP Exams
          </h2>

          <p className="text-lg text-gray-700 mb-8">
            Unlock advanced strategies to pass on your first attempt with confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.hrascendpress.online/quizzes"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Start a Quiz
            </a>
            <a
              href="https://whop.com/shrm/"
              className="bg-white text-blue-600 border border-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition"
            >
              24/7 Support
            </a>
          </div>
        </div>

        <div className="w-full max-w-md md:max-w-lg flex justify-center">
          <Image
            src="/preview-phone.png"
            alt="Book Preview"
            width={600}
            height={900}
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </main>
    </div>
  );
}
