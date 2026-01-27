import React, { useState } from "react";

interface Props { 
  onSync: () => void; 
  status: string; 
  isActive: boolean;
}

const ActiveBillboardView: React.FC<Props> = ({ onSync, status, isActive }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = () => {
    if (!isActive) return; 
    setSyncing(true);
    onSync();
    setTimeout(() => setSyncing(false), 2000); 
  };


  if (!isActive) {
    return (
      <div className="flex flex-col items-center py-6 animate-pulse">
        <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-red-900 bg-red-900/20 mb-6">
          <span className="text-4xl text-red-600">⚠</span>
        </div>
        <h2 className="text-2xl font-black text-red-500 mb-2">ACCESS DENIED</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          This device has been disabled from the dashboard.
        </p>
        <div className="w-full p-4 bg-gray-800/50 rounded-xl text-xs text-gray-500 text-center border border-gray-700">
          Please contact your administrator to enable this screen.
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
          status === 'ONLINE' || status === 'PAIRED' 
            ? 'border-green-500/50 bg-green-500/10' 
            : 'border-red-500/50 bg-red-500/10'
        }`}>
           <span className={`text-4xl ${
             status === 'ONLINE' || status === 'PAIRED' 
               ? 'text-green-500 shadow-green-500/50' 
               : 'text-red-500'
           }`}>●</span>
        </div>
       
        {(status === 'ONLINE' || status === 'PAIRED') && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 border-4 border-gray-900 rounded-full"></span>
        )}
      </div>
      
      <h2 className="text-3xl font-black mb-1">PAIRED</h2>
      <p className="text-gray-400 text-sm mb-8 text-center font-medium">
        Device is <span className="text-green-500">Active</span> and ready
      </p>

      <button
        onClick={handleSyncClick}
        disabled={syncing}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${
          syncing 
            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
            : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-lg shadow-blue-900/30"
        }`}
      >
        {syncing ? (
          <span className="animate-spin text-xl">↻</span>
        ) : (
          <span className="text-xl">📥</span>
        )}
        <span className="tracking-wide">
          {syncing ? "Syncing Content..." : "Sync Content Now"}
        </span>
      </button>
      
      <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-tighter">
        <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
        Last update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ActiveBillboardView;