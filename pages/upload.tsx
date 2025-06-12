import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
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

  const [projects, setProjects] = useState<{ id: number; name: string; domain: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newDomain, setNewDomain] = useState("");

  const [selectedSlot, setSelectedSlot] = useState("quiz1");
  const [timerValue, setTimerValue] = useState("");
  const [quizUrl, setQuizUrl] = useState("");
  const [error, setError] = useState("");

  const [visibleSlots, setVisibleSlots] = useState<string[]>([]);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from("projects").select("id, name, domain");
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchVisibility = async () => {
      if (!selectedProjectId) return;
      const { data } = await supabase
        .from("quiz_visibility")
        .select("slot_id, is_visible")
        .eq("project_id", selectedProjectId);
      if (data) {
        const visible = data.filter((r) => r.is_visible).map((r) => r.slot_id);
        setVisibleSlots(visible);
      }
    };
    fetchVisibility();
  }, [selectedProjectId]);

  const handleLogin = () => {
    if (password.trim() === PASSWORD) setAccess(true);
    else alert("Incorrect password");
  };

  const handleAddProject = async () => {
    if (!newDomain.trim()) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ domain: newDomain.trim(), name: newDomain.trim() })
      .select()
      .single();
    if (data && !error) {
      setProjects((prev) => [...prev, data]);
      setSelectedProjectId(data.id);
      setNewDomain("");
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

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

      await supabase.from("quizzes").delete().eq("slug", selectedSlot).eq("project_id", selectedProjectId);
      const { error: insertError } = await supabase.from("quizzes").insert({
        slug: selectedSlot,
        project_id: selectedProjectId,
        data: quiz,
      });

      if (insertError) {
        setError("Failed to save quiz.");
        return;
      }

      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      const url = `${window.location.origin}/quiz/${selectedSlot}?domain=${selectedProject?.domain}`;
      setQuizUrl(url);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to process file.");
    }
  };

  const handleApplyVisibility = async () => {
    if (!selectedProjectId) return;
    await supabase.from("quiz_visibility").delete().eq("project_id", selectedProjectId);
    const inserts = [...Array(15)].map((_, i) => {
      const slot = `quiz${i + 1}`;
      return {
        slot_id: slot,
        is_visible: visibleSlots.includes(slot),
        project_id: selectedProjectId,
      };
    });
    await supabase.from("quiz_visibility").upsert(inserts);
    alert("✅ Visibility updated");
  };

  const handleDeleteSlots = async () => {
    if (!selectedProjectId) return;
    for (const slot of selectedForDelete) {
      await supabase.from("quizzes").delete().eq("slug", slot).eq("project_id", selectedProjectId);
    }
    alert(`✅ Deleted: ${selectedForDelete.join(", ")}`);
    setSelectedForDelete([]);
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-start px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Upload Excel Quiz</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Select or Add Domain</label>
          <select
            value={selectedProjectId ?? ''}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
          >
            <option value="" disabled>Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.domain}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Add new domain"
              className="flex-1 px-4 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleAddProject}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >Add</button>
          </div>
        </div>

        {selectedProjectId && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Static Slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              >
                {[...Array(15)].map((_, i) => (
                  <option key={i} value={`quiz${i + 1}`}>QUIZ {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Time (minutes, optional)</label>
              <input
                type="number"
                value={timerValue}
                onChange={(e) => setTimerValue(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>

            <input
              type="file"
              accept=".xlsx"
              onChange={handleFile}
              className="mb-6 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />

            {quizUrl && (
              <div className="mb-6 text-center">
                <p className="text-green-700 font-medium mb-2">✅ Quiz link generated:</p>
                <a href={quizUrl} target="_blank" className="text-blue-600 underline break-all">{quizUrl}</a>
                <div className="mt-4 flex justify-center">
                  <QRCodeCanvas value={quizUrl} size={180} />
                </div>
              </div>
            )}

            <hr className="my-6" />

            <h2 className="text-xl font-bold mb-4">Manage Static Slots</h2>
            <div className="mb-6">
              <p className="font-semibold mb-2">Select visible slots for /quizzes page:</p>
              <button onClick={() => setVisibleSlots([...Array(15)].map((_, i) => `quiz${i + 1}`))} className="bg-gray-300 px-3 py-1 rounded mr-2">Select All</button>
              <button onClick={handleApplyVisibility} className="bg-blue-600 text-white px-3 py-1 rounded">Apply</button>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                {[...Array(15)].map((_, i) => {
                  const slot = `quiz${i + 1}`;
                  return (
                    <label key={slot} className="flex items-center space-x-2">
                      <input type="checkbox" checked={visibleSlots.includes(slot)} onChange={() => toggleSlotVisibility(slot)} />
                      <span>{slot.toUpperCase()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <p className="font-semibold mb-2">Delete selected slots from Supabase:</p>
              <button onClick={() => setSelectedForDelete([...Array(15)].map((_, i) => `quiz${i + 1}`))} className="bg-gray-300 px-3 py-1 rounded mr-2">Select All</button>
              <button onClick={handleDeleteSlots} className="bg-red-600 text-white px-4 py-1 rounded">Delete</button>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                {[...Array(15)].map((_, i) => {
                  const slot = `quiz${i + 1}`;
                  return (
                    <label key={slot} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedForDelete.includes(slot)}
                        onChange={(e) =>
                          setSelectedForDelete((prev) =>
                            e.target.checked ? [...prev, slot] : prev.filter((s) => s !== slot)
                          )
                        }
                      />
                      <span>{slot.toUpperCase()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="text-center">
              <a href="/qr" className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm">
                View QR Codes for Static Slots
              </a>
            </div>
          </>
        )}

        {error && <p className="mt-6 text-red-600 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}
