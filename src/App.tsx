import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThreeGameCanvas } from './components/ThreeGameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { WordDictionaryModal } from './components/WordDictionaryModal';
import { GameOverModal } from './components/GameOverModal';
import { WordItem, GameMode, GameStatus } from './types';

const HIGH_SCORE_KEY = 'thai_clusters_3d_high_score';

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [gameMode, setGameMode] = useState<GameMode>('arcade');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const maxLives = 3;
  const [level, setLevel] = useState(1);
  const [hitsCorrect, setHitsCorrect] = useState(0);
  const [hitsWrong, setHitsWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lastFeedback, setLastFeedback] = useState<{
    word: WordItem;
    isCorrect: boolean;
    timestamp: number;
  } | null>(null);

  const [aimPos, setAimPos] = useState({ x: 0, y: 0 });
  const [hoveredWord, setHoveredWord] = useState<WordItem | null>(null);

  // Keep track of high score updates
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Timer countdown for timer mode
  useEffect(() => {
    if (gameStatus !== 'playing' || gameMode !== 'timer') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus('victory');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, gameMode]);

  const handleStartGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setLevel(1);
    setHitsCorrect(0);
    setHitsWrong(0);
    setTimeLeft(60);
    setLastFeedback(null);
    setGameStatus('playing');
  }, []);

  const handleHitWord = useCallback((word: WordItem, isCorrect: boolean) => {
    setLastFeedback({
      word,
      isCorrect,
      timestamp: Date.now(),
    });

    if (isCorrect) {
      setCombo((prevCombo) => {
        const nextCombo = prevCombo + 1;
        setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));
        
        // Score calculation with combo bonus
        const multiplier = 1 + Math.min(nextCombo * 0.1, 1.5);
        const earned = Math.round(100 * multiplier);
        setScore((prevScore) => {
          const newScore = prevScore + earned;
          // Level increments with every 500 score points
          setLevel(Math.floor(newScore / 500) + 1);
          return newScore;
        });

        return nextCombo;
      });

      setHitsCorrect((prev) => prev + 1);
    } else {
      // Hit a false cluster!
      setCombo(0);
      setHitsWrong((prev) => prev + 1);

      // In arcade mode, losing a life
      setLives((prevLives) => {
        const nextLives = prevLives - 1;
        if (nextLives <= 0) {
          setGameStatus('gameover');
        }
        return Math.max(nextLives, 0);
      });
    }
  }, []);

  const handleMissTrueWord = useCallback((word: WordItem) => {
    // Only penalize in arcade mode if a true cluster escapes past defense line
    setCombo(0);
    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        setGameStatus('gameover');
      }
      return Math.max(nextLives, 0);
    });
    setLastFeedback({
      word,
      isCorrect: false,
      timestamp: Date.now(),
    });
  }, []);

  const handleAimChange = useCallback((screenX: number, screenY: number, hovered: WordItem | null) => {
    setAimPos({ x: screenX, y: screenY });
    setHoveredWord(hovered);
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameStatus((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  const handleRestart = useCallback(() => {
    handleStartGame(gameMode);
  }, [handleStartGame, gameMode]);

  return (
    <div id="game-container" className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Layer */}
      <ThreeGameCanvas
        gameStatus={gameStatus}
        gameMode={gameMode}
        level={level}
        soundEnabled={soundEnabled}
        voiceEnabled={voiceEnabled}
        onHitWord={handleHitWord}
        onMissTrueWord={handleMissTrueWord}
        onAimChange={handleAimChange}
      />

      {/* 2D HUD UI Layer */}
      <HUD
        score={score}
        combo={combo}
        maxCombo={maxCombo}
        lives={lives}
        maxLives={maxLives}
        timeLeft={timeLeft}
        gameMode={gameMode}
        gameStatus={gameStatus}
        soundEnabled={soundEnabled}
        voiceEnabled={voiceEnabled}
        lastFeedback={lastFeedback}
        aimPos={aimPos}
        hoveredWord={hoveredWord}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
      />

      {/* Start / Intro Screen */}
      {gameStatus === 'ready' && (
        <StartScreen
          onStartGame={handleStartGame}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
          highScore={highScore}
        />
      )}

      {/* Pause Overlay */}
      {gameStatus === 'paused' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl">
            <h3 className="text-3xl font-extrabold font-kanit text-amber-400 mb-2">
              พักเกมชั่วคราว ⏸️
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              กดปุ่มด้านล่างเพื่อกลับไปยิงคำควบกล้ำต่อ
            </p>
            <button
              id="resume-game-btn"
              onClick={handleTogglePause}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-kanit font-bold text-base shadow-lg transition-transform active:scale-95"
            >
              เล่นต่อทันที ▶
            </button>
          </div>
        </div>
      )}

      {/* Game Over / Victory Modal */}
      <GameOverModal
        gameStatus={gameStatus}
        score={score}
        highScore={highScore}
        hitsCorrect={hitsCorrect}
        hitsWrong={hitsWrong}
        maxCombo={maxCombo}
        onRestart={handleRestart}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
      />

      {/* Educational Words Glossary Modal */}
      <WordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />
    </div>
  );
}
