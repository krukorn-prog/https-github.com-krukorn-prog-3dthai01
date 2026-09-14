import React, { useState } from 'react';
import { X, Volume2, CheckCircle2, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { TRUE_CLUSTERS, FALSE_CLUSTERS } from '../data/words';
import { speakThaiWord } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WordDictionaryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'true' | 'false'>('true');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dictionary-title"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="dictionary-title" className="text-xl font-bold font-kanit text-slate-100 flex items-center gap-2">
                คลังคำศัพท์: คำควบกล้ำภาษาไทย
              </h2>
              <p className="text-xs text-slate-400">
                เรียนรู้และฟังเสียงอ่านของคำควบกล้ำแท้และคำควบกล้ำไม่แท้
              </p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex px-6 pt-4 gap-3 bg-slate-900/40">
          <button
            id="tab-true-clusters"
            onClick={() => setActiveTab('true')}
            className={`flex-1 py-3 px-4 rounded-2xl font-kanit font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === 'true'
                ? 'bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>๑. คำควบกล้ำแท้ ({TRUE_CLUSTERS.length} คำ)</span>
          </button>

          <button
            id="tab-false-clusters"
            onClick={() => setActiveTab('false')}
            className={`flex-1 py-3 px-4 rounded-2xl font-kanit font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === 'false'
                ? 'bg-rose-600/30 text-rose-300 border-2 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>๒. คำควบกล้ำไม่แท้ ({FALSE_CLUSTERS.length} คำ)</span>
          </button>
        </div>

        {/* Educational Tip Box */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs sm:text-sm">
          {activeTab === 'true' ? (
            <div className="flex items-start gap-2.5 text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 font-bold">เทคนิคจำคำควบกล้ำแท้:</strong> พยัญชนะต้น ๒ ตัว เรียงกัน และออกเสียงพยัญชนะทั้งสองตัว <span className="underline decoration-emerald-400 font-bold">พร้อมกันสนิท</span> เช่น กราบ, ครู, ปลา, กวาง (ยิงตัวนี้ในเกมเพื่อได้คะแนน!)
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 font-bold">เทคนิคจำคำควบกล้ำไม่แท้:</strong> มี ร ควบอยู่ด้วย แต่เวลาอ่านออกเสียง <span className="underline decoration-rose-400 font-bold">ออกเสียงเฉพาะตัวหน้า</span> (จริง อ่านว่า จิง) หรือ <span className="underline decoration-rose-400 font-bold">เปลี่ยนเสียง ทร เป็น ซ</span> (ทราย อ่านว่า ซาย) (อย่าเพิ่งยิงตัวนี้ในเกมนะ!)
              </div>
            </div>
          )}
        </div>

        {/* Word Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {activeTab === 'true'
            ? TRUE_CLUSTERS.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/40 hover:bg-slate-800/70 border border-emerald-500/20 hover:border-emerald-500/50 p-4 rounded-2xl flex flex-col justify-between transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-white font-kanit">
                        {item.text}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                        พยัญชนะควบ: {item.cluster}
                      </div>
                    </div>
                    <button
                      onClick={() => speakThaiWord(item.text)}
                      title="กดเพื่อฟังเสียงอ่าน"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-700/40">
                    {item.explanation}
                  </div>
                </div>
              ))
            : FALSE_CLUSTERS.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/40 hover:bg-slate-800/70 border border-rose-500/20 hover:border-rose-500/50 p-4 rounded-2xl flex flex-col justify-between transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-white font-kanit">
                        {item.text}
                      </div>
                      {item.reading && (
                        <div className="text-xs font-bold text-amber-300 mt-0.5">
                          {item.reading}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => speakThaiWord(item.text)}
                      title="กดเพื่อฟังเสียงอ่าน"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-700/40">
                    {item.explanation}
                  </div>
                </div>
              ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-amber-300 font-kanit">
            Power By ครูกรณ์
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-kanit font-bold text-sm shadow-lg shadow-cyan-900/40 transition-transform active:scale-95"
          >
            พร้อมแล้ว! กลับไปเล่นเกม 🎯
          </button>
        </div>
      </div>
    </div>
  );
};
