import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001/device-sync";

export const useDeviceSocket = (pinData: any, setPinData: (data: any) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState("OFFLINE");

  useEffect(() => {
    if (!pinData?.id) return;

    const connectionQuery: any = {
      deviceId: pinData.id,
      role: "device",
      ...(pinData.token ? { token: pinData.token } : { pin: pinData.devicePin || pinData.pin })
    };

    const s = io(SOCKET_URL, { transports: ["websocket"], query: connectionQuery });

    s.on("connect", () => {
      setStatus(pinData.token ? "PAIRED" : "ONLINE");
    });

    s.on("device_paired", (res) => {
      const pairedData = { ...pinData, ...res.data, token: res.token, status: "PAIRED",isActive: res.isActive };
      localStorage.setItem("deviceData", JSON.stringify(pairedData));
      setPinData(pairedData);
      setStatus("PAIRED");
    });

    s.on("disconnect", () => setStatus("OFFLINE"));
    setSocket(s);

    return () => { s.disconnect(); };
  }, [pinData?.id, pinData?.token]);

  const triggerSync = useCallback(() => {
    if (socket && pinData?.id) {
      socket.emit("trigger_sync", { targetDeviceId: pinData.id });
      console.log("Sync requested...");
    }
  }, [socket, pinData?.id]);

  return { status, triggerSync };
};