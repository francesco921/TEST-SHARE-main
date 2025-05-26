import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function QuizzesPage() {
  const [visibleSlots, setVisibleSlots] = useState<string[]>([]);
  const [activeSlots, setActiveSlots] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Carica visibilità da Supabase
        const { data: visibilityData, error: visibilityError } = await supabase
          .from("quiz_visibility")
          .select("slot_id, is_visible");

        if (visibilityError) {
          console.error("Errore visibilità:", visibilityError);
        } else {
          const visible = visibilityData
            .filter((v) => v.is_visible)
            .map((v) => v.slot_id);
          setVisibleSlots(visible);
        }

        // 2. Carica quiz esistenti da Supabase
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("id");

        if (quizError) {
          console.error("Errore caricamento quiz:", quizError);
        } else {
          const ids = quizData.map((q) => q.id);
          const valid = ids.filter((id) => /^quiz(1[0-5]|[1-9])$/.test(id));
          setActiveSlots(valid);
        }

        setReady(true);
      } catch (e) {
        console.error("Errore generale:", e);
      }
    };

    fetchData();
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-8">Available Quizzes</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(15)].map((_, i) => {
            const slot = `quiz${i + 1}`;
            const isVisible = visibleSlots.includes(slot);
            const isActive = activeSlots.includes(slot);

            if (!isVisible) return null;

            return isActive ? (
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
