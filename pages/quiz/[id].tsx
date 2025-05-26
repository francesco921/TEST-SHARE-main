import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { jsPDF } from "jspdf";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function QuizPage() {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // ✅ Protezione: redirect a /unlock se non hai token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("quizAccess");
      if (token !== "true") {
        window.location.href = "/unlock";
      }
    }
  }, []);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("data")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const parsed = data.data as QuizQuestion[];
      setQuiz(parsed);
      setAnswers(Array(parsed.length).fill(""));
      setLoading(false);
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    const { timer } = router.query;
    if (!quiz.length || submitted) return;

    if (typeof timer === "string" && timer !== "NONE") {
      const minutes = parseInt(timer);
      if (!isNaN(minutes) && minutes > 0) {
        setTimeLeft(minutes * 60);
      }
    }
  }, [quiz, router.query, submitted]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft === 0) {
      handleFinish();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value: string) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  const handleFinish = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const lineHeight = 7;
    const maxLineWidth = 180;
    let y = 20;

    pdf.setFont("helvetica");
    pdf.setFontSize(12);

    pdf.text("Quiz Results", margin, y);
    y += lineHeight;
    pdf.text(`Correct: ${score} / ${quiz.length}`, margin, y);
    y += lineHeight * 2;

    quiz.forEach((q, i) => {
      const question = `${i + 1}. ${q.question}`;
      const userAns = answers[i] || "—";
      const correctLetter = q.correctAnswer;
      const correctText = q.options["ABCD".indexOf(correctLetter)];
      const userText = q.options["ABCD".indexOf(userAns)] || "—";
      const isCorrect = userAns === correctLetter;

      const resultLine = isCorrect
        ? "Result: Correct"
        : `Result: Wrong (correct: ${correctLetter}) ${correctText}`;

      const lines = pdf.splitTextToSize(question, maxLineWidth);
      if (y + lines.length * lineHeight > 280) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(lines, margin, y);
      y += lines.length * lineHeight;

      pdf.setFont("helvetica", "normal");
      pdf.text(`Your answer: ${userAns}) ${userText}`, margin, y);
      y += lineHeight;
      pdf.text(resultLine, margin, y);
      y += lineHeight * 1.5;
    });

    pdf.save("quiz-results.pdf");
  };

  const goTo = (i: number) => setCurrentIndex(i);
  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, quiz.length - 1));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  if (loading) return <p className="p-8">Loading...</p>;
  if (notFound) return <p className="p-8 text-red-600">Quiz not found.</p>;

  const current = quiz[currentIndex];
  const selected = answers[currentIndex];

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-white text-gray-900">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            Download PDF
          </button>
        </div>

        <div id="quiz-result">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            You answered correctly {score} out of {quiz.length} questions
          </h2>
          <p className="text-gray-600 mb-6">
            Correct: {score} — Wrong: {quiz.length - score}
          </p>

          {quiz.map((q, i) => {
            const userAns = answers[i];
            const correctLetter = q.correctAnswer;
            const correctText = q.options["ABCD".indexOf(correctLetter)];
            const userText = q.options["ABCD".indexOf(userAns)] || "—";
            const isCorrect = userAns === correctLetter;
            return (
              <div key={i} className="mb-4 border-b pb-4">
                <p className="font-semibold mb-1">
                  {i + 1}. {q.question}
                </p>
                <p>
                  Your answer: <strong>{userAns || "—"}) {userText}</strong> —{" "}
                  {isCorrect ? (
                    <span className="text-green-600">correct</span>
                  ) : (
                    <span className="text-red-600">
                      wrong (correct: {correctLetter}) {correctText}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <div className="overflow-x-auto border-b bg-white px-4 py-3 space-x-2 flex">
        {quiz.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`text-sm px-3 py-1 rounded border whitespace-nowrap ${
              i === currentIndex
                ? "bg-blue-100 border-blue-500 font-semibold"
                : answers[i]
                ? "bg-green-50 border-green-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
        {timeLeft !== null && (
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <span role="img" aria-label="timer">⏱</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-lg sm:text-xl font-bold mb-6">
            Question {currentIndex + 1} of {quiz.length}
          </h1>

          <h2 className="text-base sm:text-lg font-semibold mb-6">{current.question}</h2>

          <div className="space-y-3 mb-10">
            {current.options.map((opt, i) => {
              const letter = "ABCD"[i];
              return (
                <label
                  key={letter}
                  className={`block border rounded-lg px-4 py-3 cursor-pointer transition ${
                    selected === letter
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name={`q-${currentIndex}`}
                    value={letter}
                    checked={selected === letter}
                    onChange={() => handleChange(letter)}
                  />
                  <span className="font-semibold mr-2">{letter})</span> {opt}
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={prev}
              className="bg-white border px-4 py-2 rounded text-sm disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Finish Quiz
            </button>
            <button
              onClick={next}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              disabled={currentIndex === quiz.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
