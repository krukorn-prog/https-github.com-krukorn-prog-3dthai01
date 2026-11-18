import React from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Heart,
  Target,
  Zap,
} from 'lucide-react';
import { WordItem, GameMode, GameStatus } from '../types';

interface Props {
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  maxLives: number;
  timeLeft?: number;
  gameMode: GameMode;
  gameStatus: GameStatus;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  lastFeedback: {
    word: WordItem;
    isCorrect: boolean;
    timestamp: number;
  } | null;
  aimPos: { x: number; y: number };
  hoveredWord: WordItem | null;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  onOpenDictionary: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<Props> = ({
  score,
  combo,
  lives,
  maxLives,
  timeLeft,
  gameMode,
  gameStatus,
  soundEnabled,
  voiceEnabled,
  lastFeedback,
  onToggleSound,
  onToggleVoice,
  onOpenDictionary,
  onTogglePause,
  onRestart,
}) => {
  const isPlaying = gameStatus === 'playing';

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* 1. Top Navigation & Stats Bar */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between z-20">
        {/* Left: Score & Combo */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-lg shadow-cyan-950/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 tracking-wide">คะแนน (SCORE)</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-kanit tracking-wider">
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="bg-gradient-to-r from-amber-500/90 to-rose-500/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-amber-300/60 shadow-lg flex items-center gap-1.5 animate-bounce">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-200" />
              <span className="font-kanit font-black text-sm tracking-wide">
                คอมโบ x{combo}!
              </span>
            </div>
          )}
        </div>

        {/* Center: Mission Guidance */}
        <div className="hidden md:flex flex-col items-center">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-full px-5 py-1.5 shadow-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-slate-200">
              ภารกิจ: เลือกเฉพาะ <span className="text-emerald-400 font-bold underline decoration-emerald-500 decoration-2 underline-offset-2">คำควบกล้ำแท้</span>
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1">
            (เลือกคำควบกล้ำแท้เพื่อรับคะแนนนะเด็กๆ!)
          </span>
        </div>

        {/* Right: Lives / Mode & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Health or Timer */}
          {gameMode === 'arcade' && (
            <div className="bg-slate-900/85 backdrop-blur-md border border-rose-500/40 rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5 shadow-lg">
              {Array.from({ length: maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-all duration-300 ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-600 fill-slate-800 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          )}

          {gameMode === 'timer' && typeof timeLeft === 'number' && (
            <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <span className="text-xs text-amber-400 font-bold">เวลา</span>
              <span className="text-2xl font-black font-kanit text-amber-300">
                {timeLeft}s
              </span>
            </div>
          )}

          {/* Interactive Controls Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 shadow-lg pointer-events-auto">
            <button
              id="hud-sound-toggle-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              id="hud-voice-toggle-btn"
              onClick={onToggleVoice}
              title={voiceEnabled ? 'ปิดเสียงอ่าน' : 'เปิดเสียงอ่าน'}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              {voiceEnabled ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              id="hud-dictionary-btn"
              onClick={onOpenDictionary}
              title="คลังคำศัพท์และวิธีอ่าน"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 transition-colors text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">คลังคำศัพท์</span>
            </button>

            {isPlaying ? (
              <button
                id="hud-pause-btn"
                onClick={onTogglePause}
                title="พักเกม"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Pause className="w-5 h-5 text-amber-400" />
              </button>
            ) : gameStatus === 'paused' ? (
              <button
                id="hud-resume-btn"
                onClick={onTogglePause}
                title="เล่นต่อ"
                className="p-2 rounded-xl text-emerald-400 hover:bg-slate-800/80 transition-colors"
              >
                <Play className="w-5 h-5 fill-emerald-400" />
              </button>
            ) : null}

            <button
              id="hud-restart-btn"
              onClick={onRestart}
              title="เริ่มเกมใหม่"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Educational Feedback Toast (When a word is selected) */}
      {lastFeedback && Date.now() - lastFeedback.timestamp < 3500 && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 pointer-events-auto">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
              lastFeedback.isCorrect
                ? 'bg-emerald-950/85 border-emerald-400/60 text-emerald-100 shadow-emerald-900/40'
                : 'bg-rose-950/90 border-rose-400/60 text-rose-100 shadow-rose-900/40'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${
                lastFeedback.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}
            >
              {lastFeedback.isCorrect ? '✓' : '!'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl font-kanit">
                  "{lastFeedback.word.text}"
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    lastFeedback.isCorrect ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                  }`}
                >
                  {lastFeedback.word.categoryName}
                </span>
                {lastFeedback.word.reading && (
                  <span className="text-xs font-semibold text-amber-300">
                    ({lastFeedback.word.reading})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200/90 mt-0.5">
                {lastFeedback.isCorrect
                  ? `ถูกต้อง! +100 คะแนน (${lastFeedback.word.explanation})`
                  : `คำนี้ไม่ใช่คำควบแท้! ${lastFeedback.word.explanation}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Controls / Instructions Hint & Credits */}
      <footer className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between z-10">
        {/* Bottom Left: Creator Credit Badge */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 font-kanit tracking-wide">
            Power By ครูกรณ์
          </span>
        </div>

        {/* Center Hint */}
        <div className="hidden sm:flex bg-slate-950/75 backdrop-blur-sm border border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-slate-400 items-center gap-3">
          <span>🖱️ เลื่อนเมาส์เพื่อดูบัตรคำ</span>
          <span className="text-slate-600">|</span>
          <span>⚡ คลิกหรือแตะเพื่อเลือก</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">เลือกคำควบแท้เพื่อรับคะแนน!</span>
        </div>

        {/* Bottom Right Balance placeholder */}
        <div className="w-24 sm:w-36" />
      </footer>
    </div>
  );
};
