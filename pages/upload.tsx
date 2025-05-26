import { useState, useEffect } from "react";
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

  const [visibleSlots, setVisibleSlots] = useState<string[]>([]);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchVisibility = async () => {
      const { data, error } = await supabase.from("quiz_visibility").select("*");
      if (!error && data) {
        const visible = data.filter((row) => row.is_visible).map((row) => row.slot_id);
        setVisibleSlots(visible);
      }
    };
    fetchVisibility();
  }, []);

  const toggleSlotVisibility = (slot: string) => {
    const updated = visibleSlots.includes(slot)
      ? visibleSlots.filter((s) => s !== slot)
      : [...visibleSlots, slot];
    setVisibleSlots(updated);
  };

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

      const { error: insertError } = await supabase.from("quizzes").insert([{ id, data: quiz }]);
      if (insertError) {
        console.error(insertError);
        setError("Failed to save quiz to Supabase.");
        return;
      }

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
                setNoTimer(true);
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

        <hr className="my-8" />
        <h2 className="text-xl font-bold mb-4">Manage Static Slots</h2>

        {/* VISIBILI */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Select visible slots for /quizzes page:</p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                const all = [...Array(15)].map((_, i) => `quiz${i + 1}`);
                const allSelected = all.every((slot) => visibleSlots.includes(slot));
                const updated = allSelected ? [] : all;
                setVisibleSlots(updated);
              }}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            >
              Select All
            </button>
            <button
              onClick={async () => {
                try {
                  await supabase.from("quiz_visibility").delete().neq("slot_id", "");
                  const inserts = [...Array(15)].map((_, i) => {
                    const slot = `quiz${i + 1}`;
                    return {
                      slot_id: slot,
                      is_visible: visibleSlots.includes(slot),
                    };
                  });
                  const { error } = await supabase.from("quiz_visibility").upsert(inserts);
                  if (error) {
                    console.error("Supabase upsert error:", error);
                    alert("❌ Errore nel salvataggio su Supabase"+ error.message);
                  } else {
                    alert("✅ Visibilità salvata correttamente");
                  }
                } catch (e) {
                  console.error(e);
                  alert("❌ Errore imprevisto");
                }
              }}
              className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700 text-sm"
            >
              Apply
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[...Array(15)].map((_, i) => {
              const slot = `quiz${i + 1}`;
              return (
                <label key={slot} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visibleSlots.includes(slot)}
                    onChange={() => toggleSlotVisibility(slot)}
                  />
                  <span>{slot.toUpperCase()}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* DELETE MULTIPLO */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Delete selected slots from Supabase:</p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                const all = [...Array(15)].map((_, i) => `quiz${i + 1}`);
                const allSelected = all.every((slot) => selectedForDelete.includes(slot));
                const updated = allSelected ? [] : all;
                setSelectedForDelete(updated);
              }}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            >
              Select All
            </button>
            <button
              onClick={async () => {
                for (const slot of selectedForDelete) {
                  await supabase.from("quizzes").delete().eq("id", slot);
                }
                alert(`✅ Deleted: ${selectedForDelete.join(", ")}`);
                setSelectedForDelete([]);
              }}
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[...Array(15)].map((_, i) => {
              const slot = `quiz${i + 1}`;
              return (
                <label key={slot} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedForDelete.includes(slot)}
                    onChange={(e) =>
                      setSelectedForDelete((prev) =>
                        e.target.checked
                          ? [...prev, slot]
                          : prev.filter((s) => s !== slot)
                      )
                    }
                  />
                  <span>{slot.toUpperCase()}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* LINK QR PAGE */}
        <div className="mt-10 text-center">
          <a
            href="/qr"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm"
          >
            View QR Codes for Static Slots
          </a>
        </div>
      </div>
    </div>
  );
}
