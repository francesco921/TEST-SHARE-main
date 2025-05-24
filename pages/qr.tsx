import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const slots = [...Array(15)].map((_, i) => `quiz${i + 1}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const getCanvasById = (slot: string) =>
    document.querySelector(`#qr-${slot}`) as HTMLCanvasElement | null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard");
  };

  const copyQRImage = (slot: string) => {
    const canvas = getCanvasById(slot);
    if (!canvas) return;
    const url = canvas.toDataURL();
    navigator.clipboard.writeText(url);
    alert("✅ QR image copied");
  };

  const copyLinkAndQR = (slot: string, fullUrl: string) => {
    const canvas = getCanvasById(slot);
    if (!canvas) return;
    const url = canvas.toDataURL();
    navigator.clipboard.writeText(`${fullUrl}\n${url}`);
    alert("✅ Link and QR image copied");
  };

  const downloadQR = (slot: string) => {
    const canvas = getCanvasById(slot);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slot}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">QR Codes for Static Slots</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {slots.map((slot) => {
            const fullUrl = baseUrl ? `${baseUrl}/quiz/${slot}` : `/quiz/${slot}`;
            return (
              <div
                key={slot}
                className="bg-white shadow rounded-lg p-4 flex flex-col items-center border border-gray-200"
              >
                <QRCodeCanvas
                  value={fullUrl}
                  size={160}
                  id={`qr-${slot}`}
                />
                <p className="mt-4 text-sm break-all text-gray-700 font-medium text-center">
                  {fullUrl}
                </p>
                <div className="mt-4 w-full space-y-2">
                  <button
                    onClick={() => copyToClipboard(fullUrl)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => copyQRImage(slot)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                  >
                    Copy QR Image
                  </button>
                  <button
                    onClick={() => copyLinkAndQR(slot, fullUrl)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    Copy Link + QR
                  </button>
                  <button
                    onClick={() => downloadQR(slot)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Download QR Image
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
