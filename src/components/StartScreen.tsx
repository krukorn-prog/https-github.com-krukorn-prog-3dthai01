import React from 'react';
import { Play, Sparkles, BookOpen, Shield, Flame, Compass, Crosshair } from 'lucide-react';
import { GameMode } from '../types';

interface Props {
  onStartGame: (mode: GameMode) => void;
  onOpenDictionary: () => void;
  highScore: number;
}

export const StartScreen: React.FC<Props> = ({
  onStartGame,
  onOpenDictionary,
  highScore,
}) => {
  const [selectedMode, setSelectedMode] = React.useState<GameMode>('arcade');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 text-center text-slate-100 flex flex-col items-center">
        {/* Futuristic 3D Game Logo Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>เกมการศึกษาภาษาไทย 3 มิติ สำหรับเด็กๆ</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-kanit tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
          ตามล่าหาคำควบแท้
        </h1>
        <div className="text-sm font-bold text-amber-300 mt-1 font-kanit">
          Power By ครูกรณ์
        </div>

        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-lg">
          บังคับเครื่องยิง 3D ด้วยเมาส์ แล้วเล็งยิงเฉพาะ{' '}
          <span className="text-emerald-400 font-bold underline decoration-emerald-500">
            คำควบกล้ำแท้
          </span>{' '}
          เพื่อรับคะแนนและคอมโบ!
        </p>

        {/* High Score Banner if available */}
        {highScore > 0 && (
          <div className="mt-3 px-4 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-kanit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>คะแนนสูงสุดของคุณ: {highScore.toLocaleString()} แต้ม</span>
          </div>
        )}

        {/* Mode Selection Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
          {/* Arcade Mode */}
          <button
            id="mode-arcade-btn"
            onClick={() => setSelectedMode('arcade')}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedMode === 'arcade'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Shield className="w-6 h-6 text-cyan-400" />
              {selectedMode === 'arcade' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              )}
            </div>
            <div className="mt-3">
              <div className="font-kanit font-bold text-base text-white">
                โหมดผจญภัย
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                มี 3 ชีวิต เพิ่มระดับความเร็วเมื่อคะแนนสูงขึ้น
              </div>
            </div>
          </button>

          {/* Zen Practice Mode */}
          <button
            id="mode-zen-btn"
            onClick={() => setSelectedMode('zen')}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedMode === 'zen'
                ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Compass className="w-6 h-6 text-emerald-400" />
              {selectedMode === 'zen' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
            </div>
            <div className="mt-3">
              <div className="font-kanit font-bold text-base text-white">
                โหมดฝึกซ้อม
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                เล่นสบายๆ ไม่มีเกมโอเวอร์ เหมาะกับการฝึกฝน
              </div>
            </div>
          </button>

          {/* Speed Rush Mode */}
          <button
            id="mode-timer-btn"
            onClick={() => setSelectedMode('timer')}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedMode === 'timer'
                ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-950/50 scale-[1.02]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Flame className="w-6 h-6 text-amber-400" />
              {selectedMode === 'timer' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              )}
            </div>
            <div className="mt-3">
              <div className="font-kanit font-bold text-base text-white">
                ทดสอบ 60 วินาที
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                ยิงคำควบแท้ให้ได้มากที่สุดก่อนหมดเวลา!
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            id="start-game-btn"
            onClick={() => onStartGame(selectedMode)}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-kanit font-extrabold text-lg shadow-xl shadow-cyan-900/50 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950 text-slate-950" />
            <span>เริ่มยิงปืน 3D ทันที!</span>
          </button>

          <button
            id="open-dictionary-btn"
            onClick={onOpenDictionary}
            className="py-4 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 font-kanit font-bold text-sm border border-cyan-500/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>ดูคลังคำศัพท์ (31 คำ)</span>
          </button>
        </div>

        {/* Quick hint for kids */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span>เคล็ดลับ: เลื่อนเมาส์ไปหาคำที่ต้องการแล้วคลิกซ้ายเพื่อยิง</span>
        </div>
      </div>
    </div>
  );
};
