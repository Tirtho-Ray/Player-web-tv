import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = "http://localhost:5001";
const SOCKET_URL = "http://localhost:5001/device-sync";

const App: React.FC = () => {
  const [pinData, setPinData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState("OFFLINE");

  // ১. লোকাল স্টোরেজ থেকে ডাটা লোড করা
  useEffect(() => {
    const stored = localStorage.getItem("deviceData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setPinData(parsed);
    }
  }, []);

  // ২. পিন জেনারেট করা (শুধুমাত্র প্রথমবার)
  const handleGeneratePin = async () => {
    setLoading(true);
    try {
      let serial = localStorage.getItem("device_serial");
      if (!serial) {
        serial = `WEB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        localStorage.setItem("device_serial", serial);
      }

      const res = await fetch(`${API_URL}/api/v1/device/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceSerial: serial }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      const data = { ...result.data, deviceSerial: serial };
      localStorage.setItem("deviceData", JSON.stringify(data));
      setPinData(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ৩. সকেট কানেকশন হ্যান্ডেল করা (JWT Token সহ)
  useEffect(() => {
    if (!pinData?.id) return;

    // টোকেন থাকলে টোকেন ব্যবহার করবে, না থাকলে পিন
    const connectionQuery: any = {
      deviceId: pinData.id,
      role: "device",
    };

    if (pinData.token) {
      connectionQuery.token = pinData.token; // JWT Token
    } else {
      connectionQuery.pin = pinData.devicePin || pinData.pin; // First time PIN
    }

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      query: connectionQuery,
    });

    s.on("connect", () => {
      console.log("✅ Connected with:", pinData.token ? "JWT Token" : "PIN");
      setStatus(pinData.token ? "PAIRED" : "ONLINE");
    });

    // ৪. পেয়ারিং সাকসেস ইভেন্ট লিসেনার (সার্ভার থেকে টোকেন আসবে এখানে)
    s.on("device_paired", (res) => {
      console.log("🎉 Pairing Successful! Token received.");
      
      // সার্ভার থেকে আসা টোকেন এবং আপডেট ডাটা সেভ করা
      const pairedData = {
        ...pinData,
        ...res.data, // database record
        token: res.token, // JWT Token from server
        status: "PAIRED"
      };

      localStorage.setItem("deviceData", JSON.stringify(pairedData));
      setPinData(pairedData);
      setStatus("PAIRED");
    });

    s.on("connect_error", (err) => {
      console.error("❌ Auth Error:", err.message);
      setStatus("OFFLINE");
    });

    s.on("disconnect", () => setStatus("OFFLINE"));

    setSocket(s);
    return () => { s.disconnect(); };
  }, [pinData?.id, pinData?.token]); // টোকেন আপডেট হলে রিকানেক্ট হবে

  // হার্টবিট লজিক
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      if (socket.connected) socket.emit("heartbeat");
    }, 30000); // ৩০ সেকেন্ড পর পর
    return () => clearInterval(interval);
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {!pinData ? (
        <div className="bg-gray-900 p-10 rounded-3xl shadow-xl text-center border border-gray-800">
          <h1 className="text-2xl font-bold mb-6">Setup New Billboard</h1>
          <button
            onClick={handleGeneratePin}
            disabled={loading}
            className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Get Activation PIN"}
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl text-center border border-gray-800 max-w-sm w-full">
          {/* যদি টোকেন থাকে অথবা স্ট্যাটাস PAIRED হয় */}
          {pinData.token || status === "PAIRED" ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                <span className="text-green-500 text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">PAIRED</h2>
              <p className="text-gray-400 text-sm">Billboard is active and secured</p>
              
              <div className="mt-6 p-3 bg-gray-800/50 rounded-lg w-full">
                <p className="text-[10px] text-blue-400 font-mono break-all line-clamp-2">
                  JWT: {pinData.token}
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-300 mb-2">Activation Code</h2>
              <div className="bg-blue-900/30 py-6 rounded-2xl mb-8 border border-blue-500/30">
                <h1 className="text-5xl font-black text-blue-400 tracking-[0.2em]">
                  {pinData.pin || pinData.devicePin}
                </h1>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block mb-6">
                <QRCodeCanvas
                  value={JSON.stringify({
                    pin: pinData.pin || pinData.devicePin,
                    serial: pinData.deviceSerial
                  })}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-500">Scan QR or enter PIN in dashboard</p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800">
             <p className="text-[10px] text-gray-500 font-mono uppercase">
               SN: {pinData.deviceSerial} | Socket: <span className={status === 'OFFLINE' ? 'text-red-500' : 'text-green-500'}>{status}</span>
             </p>
             <button
                onClick={() => { if(window.confirm("Reset this device?")) { localStorage.clear(); window.location.reload(); } }}
                className="mt-4 text-gray-600 hover:text-red-400 text-xs transition underline"
              >
                Reset Configuration
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;