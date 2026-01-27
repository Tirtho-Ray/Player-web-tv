import React, { useState, useEffect } from "react";
import { useDeviceSocket } from "./hook/useDeviceSocket";
import ActiveBillboardView from "./components/ActiveBillboardView";
import SetupView from "./components/SetupView";
import PairingView from "./components/PairingView";
import ContentPlayer from "./components/BillboardPlayer";


const API_URL = "http://localhost:5001";

const App: React.FC = () => {
  const [pinData, setPinData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]); // New Playlist state

  // socket hook
  const { status, triggerSync } = useDeviceSocket(pinData, (data: any) => {
    // সকেট থেকে সিঙ্ক ডাটা আসলে প্লেলিস্ট আপডেট হবে
    if (data?.type === "FULL_SYNC") {
      setPlaylist(data.playlist);
    } else {
      setPinData(data);
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem("deviceData");
    if (stored) setPinData(JSON.parse(stored));
  }, []);

  const handleGeneratePin = async () => {
    setLoading(true);
    try {
      let serial = localStorage.getItem("device_serial") || `WEB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      localStorage.setItem("device_serial", serial);

      const res = await fetch(`${API_URL}/api/v1/device/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceSerial: serial }),
      });
      const result = await res.json();
      const data = { ...result.data, deviceSerial: serial };
      localStorage.setItem("deviceData", JSON.stringify(data));
      setPinData(data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    if (window.confirm("Reset this device? All downloaded content will be cleared.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // ১. যদি প্লেলিস্ট থাকে তবে সরাসরি প্লেয়ার দেখাও (Fullscreen Mode)
  if (playlist.length > 0) {
    return <ContentPlayer playlist={playlist} />;
  }

  // ২. অন্যথায় অ্যাডমিন/সেটআপ ভিউ দেখাও
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 font-sans">
      {!pinData ? (
        <SetupView onGenerate={handleGeneratePin} loading={loading} />
      ) : (
        <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800 max-w-sm w-full transition-all">
          {pinData.token || status === "PAIRED" ? (
            <ActiveBillboardView 
              onSync={triggerSync} 
              status={status} 
              isActive={pinData.isActive !== false} 
            />
          ) : (
            <PairingView pinData={pinData} />
          )}

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              SN: {pinData.deviceSerial} | {status}
            </p>
            <button onClick={handleReset} className="mt-4 text-gray-600 hover:text-red-400 text-xs underline transition">
              Reset Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;