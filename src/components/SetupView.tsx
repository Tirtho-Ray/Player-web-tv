import React from "react";

interface Props {
  onGenerate: () => void;
  loading: boolean;
}

const SetupView: React.FC<Props> = ({ onGenerate, loading }) => {
  return (
    <div className="bg-gray-900 p-10 rounded-3xl shadow-xl text-center border border-gray-800 animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">📺</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Setup New Billboard</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Connect this screen to your dashboard <br /> to start displaying content.
      </p>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
      >
        {loading ? "Generating PIN..." : "Get Activation PIN"}
      </button>
    </div>
  );
};

export default SetupView;