import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Note, Vision, MiningLog } from './types';
import { KEYBOARD_MAP } from './constants';
import { AudioEngine, audioEngine } from './services/audioEngine';
import { Visualizer } from './components/Visualizer';
import { generateStartupVision } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loadingVision, setLoadingVision] = useState(false);
  const [miningLogs, setMiningLogs] = useState<MiningLog[]>([]);
  const [balance, setBalance] = useState<number>(0.00000000);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  const playCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startGame = async () => {
    try {
      await audioEngine.init();
      audioEngine.resume();
      if (musicEnabled) {
        audioEngine.startBluesBackingTrack();
      }
      setGameState(GameState.PLAYING);
      addVision({
        id: 'init',
        text: 'تم تفعيل بروتوكول التعدين الشامل. الموسيقى: متصلة.',
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Audio Init Failed", e);
    }
  };

  const toggleMusic = () => {
    if (musicEnabled) {
      audioEngine.stopBluesBackingTrack();
      setMusicEnabled(false);
    } else {
      audioEngine.startBluesBackingTrack();
      setMusicEnabled(true);
    }
  };

  const addVision = (vision: Vision) => {
    setVisions(prev => [vision, ...prev].slice(0, 3)); 
  };

  const generateRandomHash = () => {
    const chars = '0123456789ABCDEF';
    let result = '0x';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result + '...';
  };

  const playNote = useCallback((note: Note) => {
    // Force resume if suspended
    audioEngine.resume();
    audioEngine.playTone(note.frequency);
    playCountRef.current += 1;

    // Simulate mining reward
    const reward = 0.00001250 + (Math.random() * 0.00000500);
    setBalance(prev => prev + reward);

    // Add Mining Log
    const newLog: MiningLog = {
      id: Math.random().toString(36).substr(2, 9),
      op: note.miningOp,
      hash: generateRandomHash(),
      timestamp: Date.now(),
      status: Math.random() > 0.85 ? 'SUCCESS' : 'VALIDATING'
    };
    
    setMiningLogs(prev => [newLog, ...prev].slice(0, 8)); 

    // Every 15 notes, generate a startup vision
    if (playCountRef.current % 15 === 0 && !loadingVision) {
      setLoadingVision(true);
      generateStartupVision().then(text => {
        addVision({
          id: Date.now().toString(),
          text: text,
          timestamp: Date.now()
        });
        setLoadingVision(false);
      });
    }
  }, [loadingVision]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const inputKey = e.key.toLowerCase();
    
    // Find note by checking triggerKeys
    const note = KEYBOARD_MAP.find(n => n.triggerKeys.includes(inputKey));
    
    if (note) {
      setActiveKeys(prev => new Set(prev).add(note.key));
      playNote(note);
    }
  }, [playNote]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const inputKey = e.key.toLowerCase();
    const note = KEYBOARD_MAP.find(n => n.triggerKeys.includes(inputKey));
    
    if (note) {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note.key);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleKeyDown, handleKeyUp]);

  // UI Components
  const IntroScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 z-10 relative">
      <div className="floating">
        <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
          CRYPTO BLUES
        </h1>
        <h2 className="text-3xl text-emerald-200 neon-text">سمفونية التعدين</h2>
      </div>
      
      <p className="max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed border-r-4 border-emerald-500 pr-6 mr-6">
        قم بتشغيل محرك البلوز. كل زر هو عملية تعدين. 
        <br/><span className="text-cyan-400 text-sm mt-2 block font-mono">Initiating Blues Protocol for Global Prosperity.</span>
      </p>

      <button 
        onClick={startGame}
        className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-none border border-emerald-500 hover:border-cyan-500 transition-colors duration-300"
      >
        <div className="absolute inset-0 w-0 bg-emerald-500 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
        <span className="relative text-2xl font-bold tracking-widest uppercase group-hover:text-emerald-100 neon-text">
          START SYSTEM
        </span>
      </button>
    </div>
  );

  const MiningTerminal = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 z-20">
      
      {/* Central HUD */}
      <div className="w-full max-w-5xl bg-black/80 border border-emerald-500/50 p-6 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-md relative overflow-hidden flex flex-col h-[80vh]">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20"></div>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-emerald-500/30 pb-4 gap-4 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <h2 className="text-emerald-400 font-mono tracking-widest text-lg ml-2">BLUES_MINER_V2.0</h2>
              <div className="text-xs font-mono text-cyan-500 ml-2">
                 HASH_RATE: {(activeKeys.size * 245.2 + 84.5).toFixed(2)} PH/s
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={toggleMusic}
               className={`px-3 py-1 text-xs font-mono border ${musicEnabled ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'} hover:bg-white/5 transition-colors`}
             >
               MUSIC: {musicEnabled ? 'ON' : 'OFF'}
             </button>
             <div className="flex flex-col items-end bg-emerald-900/20 p-3 rounded border border-emerald-500/30 w-full md:w-auto">
               <span className="text-xs text-emerald-400 font-mono mb-1">WALLET BALANCE (BTC)</span>
               <span className="text-2xl font-mono font-bold text-white neon-text tabular-nums tracking-wider">
                 {balance.toFixed(8)}
               </span>
             </div>
          </div>
        </div>

        {/* Active Operation Display - Grows to fill space */}
        <div className="flex-grow flex items-center justify-center mb-6 relative">
          {activeKeys.size > 0 ? (
            <div className="text-center w-full">
               <div className="text-xs text-gray-500 font-mono mb-2">EXECUTING OPCODE</div>
               <div className="text-3xl md:text-5xl font-black text-white neon-text tracking-tighter animate-[pulse_0.1s_ease-in-out]">
                 {KEYBOARD_MAP.find(n => n.key === Array.from(activeKeys)[activeKeys.size - 1])?.miningOp}
               </div>
               <div className="text-emerald-500 text-sm font-mono mt-2 animate-pulse">
                 {Array.from(activeKeys).map(k => `[${k.toUpperCase()}]`).join('')} PROCESSING...
               </div>
            </div>
          ) : (
            <div className="text-gray-700 font-mono text-sm animate-pulse flex flex-col items-center gap-2">
               <span>PRESS ANY KEY TO MINE</span>
               <span className="text-xs text-emerald-900">ALL KEYS ENABLED</span>
            </div>
          )}
        </div>

        {/* Vision Overlay (Gemini) */}
        <div className="mb-6 w-full text-center z-30 min-h-[60px] shrink-0">
          {loadingVision && (
            <div className="text-cyan-500 font-mono text-xs animate-pulse mb-2">
              > DECODING ANCIENT PROTOCOL...
            </div>
          )}
          {visions.length > 0 && (
            <div className="relative bg-emerald-900/10 p-2 rounded border-l-2 border-emerald-500">
              <p className="text-lg md:text-xl text-white font-light leading-relaxed neon-text rtl">
                "{visions[0].text}"
              </p>
            </div>
          )}
        </div>

        {/* Logs Console */}
        <div className="font-mono text-xs md:text-sm space-y-1 h-32 md:h-48 overflow-hidden flex flex-col-reverse relative shrink-0 bg-black/40 p-2 rounded border border-gray-800" ref={scrollRef}>
           {miningLogs.map((log) => (
             <div key={log.id} className="flex justify-between items-center border-b border-gray-800/50 pb-1 animate-[fadeIn_0.2s_ease-out]">
               <div className="flex items-center space-x-2 w-full overflow-hidden">
                 <span className="text-emerald-700 shrink-0">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                 <span className="text-cyan-600 truncate">{log.op}</span>
               </div>
               <span className={`${log.status === 'SUCCESS' ? 'text-green-400' : 'text-yellow-600'} text-[10px] font-bold shrink-0 ml-2`}>
                 {log.status}
               </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="w-full h-full relative bg-black text-white overflow-hidden">
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <Visualizer activeNotes={Array.from(activeKeys)} />
      
      {gameState === GameState.INTRO ? <IntroScreen /> : <MiningTerminal />}
    </main>
  );
};

export default App;
