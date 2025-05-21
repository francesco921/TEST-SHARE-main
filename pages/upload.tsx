import { useState } from "react";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabase";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const PASSWORD = "Filippino1";

export default function UploadPage() {
  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");

  const [link, setLink] = useState("");
  const [quizUrl, setQuizUrl] = useState("");
  const [error, setError] = useState("");

  const [useDynamic, setUseDynamic] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState("quiz1");

  const [noTimer, setNoTimer] = useState(true);
  const [timerValue, setTimerValue] = useState("");

  const handleLogin = () => {
    if (password.trim() === PASSWORD) {
      setAccess(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

      if (rows.length < 2) {
        setError("Empty or badly formatted file.");
        return;
      }

      const quiz: QuizQuestion[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 6) continue;
        const [q, a, b, c, d, correct] = row;
        quiz.push({
          question: q.trim(),
          options: [a, b, c, d].map((x) => x.trim()),
          correctAnswer: correct.trim().toUpperCase(),
        });
      }

      if (quiz.length === 0) {
        setError("No valid questions found.");
        return;
      }

      const id = useDynamic ? uuidv4().slice(0, 6) : selectedSlot;

      if (!useDynamic) {
        await supabase.from("quizzes").delete().eq("id", id);
      }

      const { error: insertError } = await supabase.from("quizzes").insert([
        {
          id,
          data: quiz,
        },
      ]);

      if (insertError) {
        console.error(insertError);
        setError("Failed to save quiz to Supabase.");
        return;
      }

      // Timer only added to URL if dynamic link is used
      const urlBase = `${window.location.origin}/quiz/${id}`;
      const urlFinal =
        useDynamic && !noTimer
          ? `${urlBase}?timer=${encodeURIComponent(timerValue.trim())}`
          : urlBase;

      setLink(`/quiz/${id}`);
      setQuizUrl(urlFinal);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to process file.");
    }
  };

  if (!access) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Protected Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Upload Excel Quiz</h1>

        <div className="mb-6">
          <label className="flex items-center mb-2 text-sm space-x-2">
            <input
              type="checkbox"
              checked={useDynamic}
              onChange={() => {
                setUseDynamic(!useDynamic);
                setNoTimer(true); // Reset timer state if switching mode
              }}
            />
            <span>Use dynamic/random link</span>
          </label>

          <select
            disabled={useDynamic}
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {[...Array(15)].map((_, i) => (
              <option key={i} value={`quiz${i + 1}`}>
                QUIZ {i + 1}
              </option>
            ))}
          </select>
        </div>

        {useDynamic && (
          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={noTimer}
                onChange={() => setNoTimer(!noTimer)}
              />
              <span>No timer</span>
            </label>

            <input
              type="number"
              value={timerValue}
              onChange={(e) => setTimerValue(e.target.value)}
              disabled={noTimer}
              placeholder="Time in minutes"
              min="1"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        )}

        <input
          type="file"
          accept=".xlsx"
          onChange={handleFile}
          className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        {link && (
          <div className="mt-8 text-center">
            <p className="text-green-700 font-medium mb-2">✅ Quiz link generated:</p>
            <a
              href={quizUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {quizUrl}
            </a>
            <div className="mt-4 flex justify-center">
              <QRCodeCanvas value={quizUrl} size={180} />
            </div>
          </div>
        )}

        {error && <p className="mt-6 text-red-600 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}
