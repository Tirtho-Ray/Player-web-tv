<!-- import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = "http://localhost:5001";
const SOCKET_URL = "http://localhost:5001/device-sync";

const App: React.FC = () => {
  const [pinData, setPinData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState("OFFLINE");

  useEffect(() => {
    const stored = localStorage.getItem("deviceData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setPinData(parsed);
      if (parsed.status === "PAIRED") setStatus("PAIRED");
    }
  }, []);

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


useEffect(() => {
  if (!pinData?.id) {
    console.log("⚠️ Socket connection skipped: No device ID found in pinData");
    return;
  }

  console.log(`📡 Attempting to connect to: ${SOCKET_URL}`);
  console.log(`🆔 Device ID: ${pinData.id} | PIN: ${pinData.devicePin || pinData.pin}`);

  const s = io(SOCKET_URL, {
    transports: ["websocket"],
    query: {
      deviceId: pinData.id,
      pin: pinData.devicePin || pinData.pin,
      role: "device",
    },
  });

  
  s.on("connect", () => {
    console.log("%c✅ SOCKET CONNECTED", "background: #222; color: #bada55; font-size: 15px");
    console.log("Socket ID:", s.id);
    setStatus(pinData.status === "PAIRED" ? "PAIRED" : "ONLINE");
  });

  s.on("connect_error", (err) => {
    console.error("%c❌ SOCKET CONNECTION ERROR", "color: red; font-weight: bold", err.message);
  });


s.on("device_paired", (res) => {
    console.log("🎉 UI Update Triggered!", res);
    

    const pairedDevice = res.data; 
    localStorage.setItem("deviceData", JSON.stringify(pairedDevice));

    setPinData(pairedDevice);
    setStatus("PAIRED");
});


  s.on("disconnect", (reason) => {
    console.warn("🔌 Socket Disconnected:", reason);
    setStatus("OFFLINE");
  });

  setSocket(s);
  return () => { 
    console.log("🧹 Cleaning up socket connection...");
    s.disconnect(); 
  };
}, [pinData?.id]);

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
        console.log("💓 Heartbeat sent");
      }
    }, 1000);

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
          {status === "PAIRED" || pinData.status === "PAIRED" ? (
            <div className="animate-pulse">
              <div className="text-green-500 mb-4 text-6xl">✓</div>
              <h2 className="text-3xl font-black text-white mb-2">PAIRED</h2>
              <p className="text-gray-400">Ready to receive content</p>
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
              <p className="text-sm text-gray-500 mb-4">Scan QR or enter PIN in dashboard</p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800">
             <p className="text-[10px] text-gray-500 font-mono uppercase">
               SN: {pinData.deviceSerial} | Status: <span className={status === 'OFFLINE' ? 'text-red-500' : 'text-green-500'}>{status}</span>
             </p>
             <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="mt-4 text-gray-600 hover:text-red-400 text-xs transition"
              >
                Reset Device Configuration
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App; -->