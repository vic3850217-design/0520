import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Users, ClipboardCopy, RefreshCw, Trash2, Trophy, HelpCircle, UserPlus, Sparkles } from 'lucide-react';
import { DrawHistoryItem } from '../types';
import { playTick, playSuccess } from '../utils/audio';

interface RaffleBoxProps {
  onAddHistory: (item: Omit<DrawHistoryItem, 'id' | 'timestamp'>) => void;
}

export default function RaffleBox({ onAddHistory }: RaffleBoxProps) {
  const [inputText, setInputText] = useState(
    "曉明\n雅婷\n大強\n俊宇\n心怡\n婷婷\n志明\n美玲\n冠宇\n家豪"
  );
  
  const [candidates, setCandidates] = useState<string[]>([
    "曉明", "雅婷", "大強", "俊宇", "心怡", "婷婷", "志明", "美玲", "冠宇", "家豪"
  ]);
  const [drawnList, setDrawnList] = useState<string[]>([]);
  const [drawCount, setDrawCount] = useState(1);
  const [preventDuplicate, setPreventDuplicate] = useState(true); // 不重複抽籤
  
  // Animation states
  const [isShaking, setIsShaking] = useState(false);
  const [recentlyDrawn, setRecentlyDrawn] = useState<string[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Parse input to list
  const handleUpdateCandidates = () => {
    setValidationError(null);
    const list = inputText
      .split(/[\n,，]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (list.length === 0) {
      setValidationError('請先輸入至少一些名單名冊喔！');
      return;
    }
    setCandidates(list);
    setDrawnList([]);
    setRecentlyDrawn([]);
  };

  const draw = () => {
    setValidationError(null);
    // Determine available pool
    const pool = preventDuplicate 
      ? candidates.filter(item => !drawnList.includes(item))
      : candidates;

    if (pool.length === 0) {
      setValidationError('已經沒有剩餘的候選人可供抽選囉！請先重置名冊。');
      return;
    }

    setIsShaking(true);
    setRecentlyDrawn([]);
    
    // Play rapid shake rattle ticks
    let ticks = 0;
    const interval = setInterval(() => {
      playTick(240 + Math.random() * 60, 0.05, 0.35);
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        
        // Pick winners
        const winners: string[] = [];
        const poolCopy = [...pool];
        const actualDrawCount = Math.min(drawCount, poolCopy.length);

        for (let i = 0; i < actualDrawCount; i++) {
          const randomIndex = Math.floor(Math.random() * poolCopy.length);
          const picked = poolCopy.splice(randomIndex, 1)[0];
          winners.push(picked);
        }

        // Apply
        setRecentlyDrawn(winners);
        setDrawnList(prev => [...prev, ...winners]);
        setIsShaking(false);
        setShowWinnerModal(true);
        playSuccess();

        // Add to history
        onAddHistory({
          type: 'raffle',
          title: `名單抽選：選出 ${winners.length} 人`,
          detail: `幸運兒：[${winners.join(', ')}]`
        });
      }
    }, 100);
  };

  const resetAll = () => {
    setDrawnList([]);
    setRecentlyDrawn([]);
    setShowWinnerModal(false);
  };

  // Helper remaining count
  const remainingCount = preventDuplicate 
    ? candidates.filter(item => !drawnList.includes(item)).length
    : candidates.length;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#0F0F0F] border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[580px]">
      
      {/* Raffle Stage Component */}
      <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#0D0D0D] flex flex-col justify-between items-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
        
        {/* Background Spark */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
          <Gift className="w-96 h-96 text-white" />
        </div>

        {/* Top summary details */}
        <div className="w-full flex justify-between items-center text-xs tracking-wide text-gray-400 z-10 p-1">
          <span className="font-serif font-medium flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            <span>目前候選總數: {candidates.length} 人</span>
          </span>
          <span className="font-mono bg-white/5 text-amber-400 border border-white/10 px-2 py-0.5 rounded-full font-bold text-[11px]">
            剩餘可用: {remainingCount} 人
          </span>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="w-full mt-3 px-3.5 py-2.5 bg-red-950/30 border border-red-500/20 rounded-xl text-center z-10">
            <p className="text-xs text-red-400 font-serif font-medium flex items-center justify-center space-x-1.5">
              <span>⚠️ {validationError}</span>
            </p>
          </div>
        )}

        {/* Central interactive Raffle Box structure */}
        <div className="flex-1 flex flex-col items-center justify-center my-6 relative min-h-[280px]">
          <AnimatePresence mode="wait">
            {isShaking ? (
              /* Shaking Box */
              <motion.div
                key="shaking-box"
                animate={{
                  rotate: [-4, 4, -4, 4, -2, 2, 0],
                  scale: [1, 1.06, 0.98, 1.04, 1],
                  y: [0, -8, 6, -4, 0]
                }}
                transition={{ duration: 0.35, repeat: Infinity }}
                className="w-44 h-44 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl border-4 border-amber-700 flex items-center justify-center shadow-2xl relative"
              >
                {/* Ribbon details */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-2.5 w-5 bg-[#0F0F0F] border-x border-white/5" />
                <div className="absolute left-0 right-0 top-1/2 -mt-2.5 h-5 bg-[#0F0F0F] border-y border-white/5" />
                
                {/* Central Emblem */}
                <div className="w-16 h-16 rounded-full bg-[#151515] border border-amber-500 text-amber-500 flex items-center justify-center font-serif text-lg font-bold z-10 animate-pulse">
                  抽
                </div>
              </motion.div>
            ) : (
              /* Hoverable Idle Box */
              <motion.div
                key="idle-box"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={draw}
                className="w-44 h-44 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-3xl border-4 border-amber-700 flex items-center justify-center shadow-xl cursor-pointer relative"
              >
                {/* Ribbons */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-2.5 w-5 bg-[#0E0E0E]/80 border-x border-white/5" />
                <div className="absolute left-0 right-0 top-1/2 -mt-2.5 h-5 bg-[#0E0E0E]/80 border-y border-white/5" />
                
                {/* Central Circle */}
                <div className="w-16 h-16 rounded-full bg-[#121212] flex flex-col items-center justify-center font-serif text-xl font-bold text-amber-500 z-10 border border-amber-500/30 shadow-inner">
                  <span>抽籤</span>
                  <span className="text-[9px] text-gray-500 -mt-1 uppercase tracking-widest font-sans font-semibold">PRESS</span>
                </div>

                {/* Lid crease line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-[#0A0A0A]/30" />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-gray-500 mt-6 font-serif select-none pointer-events-none tracking-wider">
            點擊禮盒或點下方按鈕，搖晃抽獎箱挑選幸運兒
          </p>
        </div>

        {/* Settings options beneath bottom */}
        <div className="w-full max-w-sm space-y-4">
          
          <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-2xl p-2.5 border border-white/5 text-xs">
            {/* Draw type configuration */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-gray-400 font-serif uppercase tracking-wider">抽籤排除機制</label>
              <div className="flex space-x-1">
                <button
                  id="btn-prevent-duplicate"
                  onClick={() => setPreventDuplicate(true)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    preventDuplicate ? 'bg-amber-500 text-black shadow-xs font-bold' : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/5'
                  }`}
                  title="抽出後，得獎者不能重複抽"
                >
                  不重複抽
                </button>
                <button
                  id="btn-allow-duplicate"
                  onClick={() => setPreventDuplicate(false)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    !preventDuplicate ? 'bg-amber-500 text-black shadow-xs font-bold' : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/5'
                  }`}
                  title="每輪都是全體機率抽"
                >
                  可重複抽
                </button>
              </div>
            </div>

            {/* Batch count selector */}
            <div className="flex flex-col space-y-2 justify-between">
              <label className="text-[10px] font-bold text-gray-400 font-serif uppercase tracking-wider">單次抽選人數 ({drawCount} 人)</label>
              <input
                id="raffle-multiplier"
                type="range"
                min="1"
                max={Math.min(10, candidates.length || 1)}
                value={drawCount}
                onChange={(e) => setDrawCount(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            id="btn-trigger-raffle-draw"
            onClick={draw}
            disabled={isShaking || candidates.length === 0}
            className="w-full py-3.5 bg-amber-500 text-black font-serif font-black text-sm tracking-widest rounded-2xl shadow-lg hover:bg-amber-600 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-amber-500/15"
          >
            {isShaking ? '抽獎箱火熱搖晃中...' : `起抽！隨機選出 ${drawCount} 名幸運兒`}
          </button>
        </div>

        {/* Modal Winner Display */}
        <AnimatePresence>
          {showWinnerModal && recentlyDrawn.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20"
            >
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9 }}
                className="bg-[#151515] rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-6 relative border border-white/10 overflow-hidden"
              >
                {/* Traditional Festive Background decor */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
                
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-serif font-black text-amber-500 mt-2">恭喜獲獎大吉！</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Congratulations Winners</p>
                </div>

                <div className="max-h-40 overflow-y-auto py-2 space-y-2 flex flex-col items-center">
                  {recentlyDrawn.map((winner, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.12 }}
                      key={winner}
                      className="w-full max-w-[220px] py-2 px-4 bg-[#1E1E1E] rounded-2xl border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-amber-500 font-bold"># {index + 1}</span>
                        <span className="text-base font-bold text-white font-serif">{winner}</span>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </motion.div>
                  ))}
                </div>

                <button
                  id="btn-close-winner-modal"
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0E0E0E] font-sans text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  確認，記錄名冊
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Candidates Textarea Input Side deck */}
      <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#0F0F0F]">
        
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <ClipboardCopy className="w-4 h-4 text-gray-400" />
            <h4 className="text-xs font-bold text-amber-400 font-serif uppercase tracking-widest leading-none">名單名冊配置</h4>
          </div>

          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
            請在下方輸入所有的抽籤項目或成員姓名（可用 換行、逗號 斷開）：
          </p>

          <textarea
            id="raffle-candidates-editor"
            value={inputText}
            onChange={(e) => {
              setValidationError(null);
              setInputText(e.target.value);
            }}
            placeholder="每個名字一行..."
            className="w-full flex-1 h-44 md:h-2/3 p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white text-xs shadow-inner resize-none font-serif placeholder-gray-600"
          />

          <button
            id="btn-update-candidates"
            onClick={handleUpdateCandidates}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-serif font-bold text-xs rounded-xl tracking-widest shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-white/5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>儲存並重置名冊</span>
          </button>
        </div>

        {/* Drawn list tracker bottom */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-400 font-serif uppercase tracking-wider">
              本輪幸運兒 ({drawnList.length})
            </span>
            {drawnList.length > 0 && (
              <button
                id="btn-reset-raffle-winners"
                onClick={resetAll}
                className="text-[10px] text-gray-500 hover:text-amber-500 flex items-center space-x-0.5 cursor-pointer transition-colors"
                title="清空此輪已抽宿命名單"
              >
                <RefreshCw className="w-3 h-3 text-amber-500" />
                <span>清空並返回</span>
              </button>
            )}
          </div>

          {/* Winning List scroll */}
          {drawnList.length === 0 ? (
            <div className="text-center p-4 bg-white/3 border border-dashed border-white/5 rounded-xl">
              <span className="text-[10px] text-gray-500">目前尚無得獎名冊</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 py-1">
              {drawnList.map((winner, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] font-serif font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg"
                >
                  {winner}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
