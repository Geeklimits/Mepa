
import React, { useState, useEffect } from 'react';
import { LogType } from '../types';
import { searchMusic } from '../geminiService';

interface MusicViewProps {
  onLog: (type: LogType, action: string, target: string, reason?: string) => void;
}

interface Song {
  title: string;
  artist: string;
  platform: string;
  duration: string;
  verdict?: string;
  link?: string;
}

const MusicView: React.FC<MusicViewProps> = ({ onLog }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Persist queue in localStorage
  const [queue, setQueue] = useState<Song[]>(() => {
    const saved = localStorage.getItem('mepa_music_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist current song for a continuous vibe
  const [currentSong, setCurrentSong] = useState<Song>(() => {
    const saved = localStorage.getItem('mepa_current_song');
    return saved ? JSON.parse(saved) : {
      title: 'Wildflower',
      artist: 'Billie Eilish',
      platform: 'Spotify',
      duration: '3:42',
      verdict: "It's acceptable for a breakdown, I guess. 💅"
    };
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync queue to localStorage
  useEffect(() => {
    localStorage.setItem('mepa_music_queue', JSON.stringify(queue));
  }, [queue]);

  // Sync current song to localStorage
  useEffect(() => {
    localStorage.setItem('mepa_current_song', JSON.stringify(currentSong));
  }, [currentSong]);

  // Simulated progress bar
  useEffect(() => {
    let interval: number;
    if (isPlaying && progress < 100) {
      interval = window.setInterval(() => {
        setProgress(p => Math.min(p + 0.5, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const results = await searchMusic(query);
    setSearchResults(results);
    setIsSearching(false);

    if (results.length > 0) {
      onLog('music', 'Searched', query, `Found ${results.length} songs. Mepa judged them all.`);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    onLog('music', 'Playing', song.title, `Source: ${song.platform}. Verdict: ${song.verdict}`);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    onLog('music', 'Queued', song.title, "Added to elite rotation.");
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Search Header */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Aura Search</h3>
          <span className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.3em] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">AI Logic Sync</span>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Spotify, YouTube, or just vibes..."
            className="w-full bg-slate-50 border border-slate-200 pl-16 pr-40 py-6 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all text-slate-800 font-medium placeholder:text-slate-400"
          />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-10 py-3.5 bg-slate-900 text-white rounded-4xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSearching ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Find Song ✨</span>
            )}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <p className="text-slate-[10px] font-bold text-slate-400 uppercase tracking-widest">Mepa's Selection & Verdicts</p>
              <button onClick={() => setSearchResults([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Clear Results</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((song, i) => (
                <div
                  key={i}
                  className="flex flex-col p-6 rounded-4xl bg-slate-50 border border-slate-100 hover:border-pink-200 hover:bg-white transition-all group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                      <img src={`https://picsum.photos/seed/${song.title}/200`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-base truncate">{song.title}</p>
                      <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border ${song.platform === 'Spotify' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {song.platform}
                    </span>
                  </div>

                  <div className="bg-white/50 p-4 rounded-2xl border border-slate-100 mb-4 group-hover:bg-pink-50/50 group-hover:border-pink-100 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mepa's Verdict:</p>
                    <p className="text-xs italic text-slate-600 leading-relaxed">"{song.verdict}"</p>
                  </div>

                  <div className="flex items-center space-x-2 mt-auto">
                    <button
                      onClick={() => playSong(song)}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
                    >
                      Play Now ▶️
                    </button>
                    <button
                      onClick={() => addToQueue(song)}
                      className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-slate-900 transition-colors"
                    >
                      + Queue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Player Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Now Playing Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 text-6xl opacity-10 animate-pulse">🎵</div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]"></div>

            <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 relative z-10">
              <div className="w-64 h-64 bg-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center text-8xl shrink-0 overflow-hidden border border-slate-700 relative group">
                {currentSong.link && currentSong.link.includes('youtube') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentSong.link.replace('watch?v=', 'embed/').split('&')[0] + "?autoplay=1&controls=0&modestbranding=1"}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={`w-full h-full object-cover rounded-[3rem] ${isPlaying ? 'opacity-100' : 'opacity-50'}`}
                  ></iframe>
                ) : (
                  <>
                    <img
                      src={`https://picsum.photos/seed/${currentSong.title}/600`}
                      alt="Album Art"
                      className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'scale-110' : 'scale-100 opacity-40 grayscale'}`}
                    />
                    {!isPlaying && <div className="absolute inset-0 flex items-center justify-center text-4xl">🧘‍♀️</div>}
                  </>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center bg-white/10 border border-white/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-pink-500 mr-3 animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-100">Luxury Stream Active</span>
                </div>

                <h3 className="text-4xl font-serif font-bold mb-2 italic tracking-tight leading-tight">{currentSong.title}</h3>
                <p className="text-xl text-slate-400 font-medium mb-8">by {currentSong.artist}</p>

                <div className="flex items-center justify-center md:justify-start space-x-10 mb-10">
                  <button className="text-slate-500 hover:text-white transition-all transform hover:scale-125">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18V6h2v12H6zm3.5-6L18 6v12l-8.5-6z" /></svg>
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] active:scale-90"
                  >
                    {isPlaying ? (
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                      <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                  <button className="text-slate-500 hover:text-white transition-all transform hover:scale-125">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{Math.floor(progress * 0.42)}s</span>
                    <span>{currentSong.duration}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center space-x-6 shadow-sm">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">💅</div>
            <div>
              <h4 className="font-bold text-slate-800">Mepa's Commentary</h4>
              <p className="text-sm text-slate-500 italic">"{currentSong.verdict || "Just listen to the song and stop talking to me. 🙄"}"</p>
            </div>
          </div>
        </div>

        {/* Queue Column */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[500px]">
          <div className="p-8 border-b border-slate-50">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-lg font-bold text-slate-800">Elite Queue</h4>
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{queue.length} Tracks</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Coming up next in your lifestyle.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="text-4xl mb-4 grayscale opacity-30">🎧</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Your queue is literally empty. It's giving "silence is better than mid choices."</p>
              </div>
            ) : (
              queue.map((song, i) => (
                <div
                  key={i}
                  className="group flex items-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg shadow-inner overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    <img src={`https://picsum.photos/seed/${song.title + i}/100`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 ml-4">
                    <p className="font-bold text-slate-700 text-xs truncate">{song.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        playSong(song);
                        removeFromQueue(i);
                      }}
                      className="p-2 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => removeFromQueue(i)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50 rounded-b-[3rem]">
            <button
              onClick={() => setQueue([])}
              disabled={queue.length === 0}
              className="w-full py-4 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-30"
            >
              Clear Entire Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicView;
