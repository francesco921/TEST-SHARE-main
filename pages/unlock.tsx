import { useState } from "react";
import { useRouter } from "next/router";

const PASSWORD = "GENIO2025"; // This will remain hidden from user view

export default function UnlockPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === PASSWORD) {
      localStorage.setItem("quizAccess", "true");
      router.push("/quizzes");
    } else {
      setError("Incorrect keyword. Please check the one printed in your book.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 shadow-md rounded-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Unlock Quiz Access</h1>
        <p className="mb-4 text-sm text-gray-600 text-center">
          Please enter the secret keyword printed inside your book to access the quiz area.
        </p>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter keyword"
            className="w-full px-4 py-2 border border-gray-300 rounded pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-sm text-blue-600 hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Unlock Access
        </button>
        {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
