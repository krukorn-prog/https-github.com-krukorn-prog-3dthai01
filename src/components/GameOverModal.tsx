import React from 'react';
import { Trophy, RotateCcw, BookOpen, Star, Sparkles } from 'lucide-react';
import { GameStatus } from '../types';

interface Props {
  gameStatus: GameStatus;
  score: number;
  highScore: number;
  hitsCorrect: number;
  hitsWrong: number;
  maxCombo: number;
  onRestart: () => void;
  onOpenDictionary: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  gameStatus,
  score,
  highScore,
  hitsCorrect,
  hitsWrong,
  maxCombo,
  onRestart,
  onOpenDictionary,
}) => {
  if (gameStatus !== 'gameover' && gameStatus !== 'victory') return null;

  const totalSelections = hitsCorrect + hitsWrong;
  const accuracy = totalShots > 0 ? Math.round((hitsCorrect / totalShots) * 100) : 0;
  const isNewHighScore = score > highScore && score > 0;

  // Star rating:
  // 3 stars: score >= 1500 or (hitsCorrect >= 15 && accuracy >= 80)
  // 2 stars: score >= 800
  // 1 star: score > 0
  const starsCount = hitsCorrect >= 12 && accuracy >= 75 ? 3 : hitsCorrect >= 6 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        {/* Trophy / Header Icon */}
        <div className="relative -mt-14 mb-3">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center text-slate-950">
            <Trophy className="w-14 h-14" />
          </div>
          {isNewHighScore && (
            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full border border-white shadow-md animate-bounce">
              NEW RECORD!
            </div>
          )}
        </div>

        <h2 className="text-3xl font-extrabold font-kanit text-white mt-1">
          {gameStatus === 'victory' ? 'เก่งมากๆ เลยน้องๆ! 🎉' : 'จบเกมแล้ว! เก่งมาก 👍'}
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          ฝึกจำแนกคำควบกล้ำแท้และไม่แท้ได้ยอดเยี่ยม
        </p>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-10 h-10 transition-all ${
                star <= starsCount
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 my-2 text-left">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-semibold">คะแนนรวม</div>
            <div className="text-2xl font-black font-kanit text-amber-300">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-semibold">คอมโบสูงสุด</div>
            <div className="text-2xl font-black font-kanit text-cyan-300">
              {maxCombo}x
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-xs text-emerald-400 font-semibold">เลือกคำควบแท้ถูก</div>
            <div className="text-2xl font-black font-kanit text-emerald-300">
              {hitsCorrect} คำ
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-xs text-rose-400 font-semibold">เลือกคำไม่ถูกต้อง</div>
            <div className="text-2xl font-black font-kanit text-rose-300">
              {hitsWrong} ครั้ง
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-5">
          <button
            id="modal-play-again-btn"
            onClick={onRestart}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-kanit font-bold text-base shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>เล่นอีกครั้ง</span>
          </button>

          <button
            id="modal-review-btn"
            onClick={onOpenDictionary}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-kanit font-semibold text-sm border border-cyan-500/30 flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>ทบทวนคำศัพท์</span>
          </button>
        </div>

        <div className="mt-4 text-xs font-semibold text-amber-300/90 font-kanit">
          Power By ครูกรณ์
        </div>
      </div>
    </div>
  );
};
