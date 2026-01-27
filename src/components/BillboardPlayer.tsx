import React, { useEffect, useState } from "react";
import { AssetManager } from "../utils/AssetManager";

const ContentPlayer: React.FC<{ playlist: any[] }> = ({ playlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPlaylist, setDisplayPlaylist] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const syncAssets = async () => {
      const updatedList = [];
      let loadedCount = 0;

      for (const item of playlist) {
        let localUrl = await AssetManager.getLocalUrl(item.id);
        if (!localUrl) {
          localUrl = await AssetManager.saveFile(item.id, item.url);
        }
        updatedList.push({ ...item, localUrl });
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / playlist.length) * 100));
      }
      setDisplayPlaylist(updatedList);
    };
    if (playlist.length > 0) syncAssets();
  }, [playlist]);

  useEffect(() => {
    if (displayPlaylist.length === 0) return;

    const currentItem = displayPlaylist[currentIndex];
    
    // ভিডিওর ক্ষেত্রে timer দরকার নেই, onEnded হ্যান্ডেল করবে। ইমেজের জন্য প্রয়োজন।
    if (currentItem.type !== "VIDEO") {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % displayPlaylist.length);
      }, currentItem.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayPlaylist]);

  if (displayPlaylist.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <p className="mt-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest">Caching Media: {loadingProgress}%</p>
      </div>
    );
  }

  const activeItem = displayPlaylist[currentIndex];

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      {activeItem.type === "VIDEO" ? (
        <video
          key={activeItem.localUrl}
          src={activeItem.localUrl}
          autoPlay
          muted
          onEnded={() => setCurrentIndex((prev) => (prev + 1) % displayPlaylist.length)}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          key={activeItem.localUrl}
          src={activeItem.localUrl}
          className="w-full h-full object-cover animate-in fade-in duration-1000"
          alt="billboard"
        />
      )}
      
      <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
         <p className="text-[8px] text-white font-mono">LIVE_PLAYER_v1</p>
      </div>
    </div>
  );
};

export default ContentPlayer;