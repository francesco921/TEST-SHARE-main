import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function QuizzesPage() {
  const [displaySlots, setDisplaySlots] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Recupera slot attivi da Supabase
      const { data, error } = await supabase.from("quizzes").select("id");
      if (error || !data) {
        console.error("Supabase fetch error:", error);
        setDisplaySlots([]);
        return;
      }

      const active = data.map((q) => q.id).filter((id) => /^quiz(1[0-5]|[1-9])$/.test(id));

      // 2. Recupera slot visibili da localStorage (solo lato client)
      let visible: string[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("visibleSlots");
        if (stored) {
          try {
            visible = JSON.parse(stored);
          } catch {
            visible = [];
          }
        }
      }

      // 3. Intersezione tra attivi e visibili
      const toShow = active.filter((id) => visible.includes(id));
      setDisplaySlots(toShow);
    };

    fetchData();
  }, []);

  if (displaySlots === null) return null; // oppure uno spinner di caricamento

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-8">Available Quizzes</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(15)].map((_, i) => {
            const slot = `quiz${i + 1}`;
            const enabled = displaySlots.includes(slot);

            return enabled ? (
              <Link key={slot} href={`/quiz/${slot}`}>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                  QUIZ {i + 1}
                </button>
              </Link>
            ) : (
              <button
                key={slot}
                disabled
                className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              >
                QUIZ {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
