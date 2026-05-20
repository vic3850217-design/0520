import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Play, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { DrawHistoryItem } from '../types';
import { playTick, playSuccess } from '../utils/audio';

interface NumberDrawProps {
  onAddHistory: (item: Omit<DrawHistoryItem, 'id' | 'timestamp'>) => void;
}

export default function NumberDraw({ onAddHistory }: NumberDrawProps) {
  const [minVal, setMinVal] = useState(1);
  const [maxVal, setMaxVal] = useState(49);
  const [count, setCount] = useState(6);
  const [allowDuplicate, setAllowDuplicate] = useState(false); // Default: no duplicate (standard lottery)
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  // Store rolling numbers for each slide slot to render a visual jackpot-reels effect
  const [rollingNumbers, setRollingNumbers] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const startDraw = () => {
    setValidationError(null);
    // Basic range validation
    if (minVal >= maxVal) {
      setValidationError('「最小值」必須小於「最大值」喔！');
      return;
    }
    const range = maxVal - minVal + 1;
    if (!allowDuplicate && count > range) {
      setValidationError(`在不重複的情況下，隨記區間(${range}個數)不足以抽出指定的 ${count} 個號碼喔！`);
      return;
    }

    setIsDrawing(true);
    setResults([]);
    
    // Pick final outcomes
    const pickedNumbers: number[] = [];
    const availablePool = Array.from({ length: range }, (_, i) => minVal + i);

    for (let i = 0; i < count; i++) {
      if (allowDuplicate) {
        const rand = minVal + Math.floor(Math.random() * range);
        pickedNumbers.push(rand);
      } else {
        const randIdx = Math.floor(Math.random() * availablePool.length);
        const rand = availablePool.splice(randIdx, 1)[0];
        pickedNumbers.push(rand);
      }
    }

    // Sort standard results for tidy view (e.g. lottery looks beautiful in sorted order)
    const sortedFinals = [...pickedNumbers].sort((a, b) => a - b);

    // Rapid Reel Simulation animation
    let cycles = 0;
    const interval = setInterval(() => {
      // populate rolling placeholder numbers
      const tempArray = Array.from({ length: count }, () => 
        minVal + Math.floor(Math.random() * range)
      );
      setRollingNumbers(tempArray);
      playTick(300 + Math.random() * 80, 0.03, 0.2);
      
      cycles++;
      if (cycles > 15) {
        clearInterval(interval);
        setResults(sortedFinals);
        setRollingNumbers([]);
        setIsDrawing(false);
        playSuccess();

        // Log results
        onAddHistory({
          type: 'number',
          title: `數字抽籤: [${minVal} - ${maxVal}] 抽出 ${count} 個號碼`,
          detail: `幸運密碼：${sortedFinals.join('、')}`
        });
      }
    }, 70);
  };

  const clearDraw = () => {
    setResults([]);
    setRollingNumbers([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#0F0F0F] border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[500px]">
      
      {/* Primary Display visual screen area */}
      <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#0D0D0D] flex flex-col justify-between items-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
        
        {/* Background logo marker */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
          <Hash className="w-96 h-96 text-white" />
        </div>

        {/* Top Info line */}
        <div className="w-full flex justify-between items-center text-xs text-gray-400 z-10 p-1 font-serif">
          <span className="flex items-center space-x-1.5 font-bold">
            <Layers className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>賓果隨機號碼滾輪</span>
          </span>
          <span className="font-mono text-[11px] bg-white/5 border border-white/10 text-amber-500 font-bold px-2.5 py-0.5 rounded-full">
            範圍: {minVal} ➔ {maxVal}
          </span>
        </div>

        {/* Inline Error Block if validation fails */}
        {validationError && (
          <div className="w-full mt-3 px-3.5 py-2.5 bg-red-950/30 border border-red-500/20 rounded-xl text-center z-10">
            <p className="text-xs text-red-400 font-serif font-medium flex items-center justify-center space-x-1.5">
              <span>⚠️ {validationError}</span>
            </p>
          </div>
        )}

        {/* CENTRAL SLOT MACHINE VIEW */}
        <div className="flex-grow flex items-center justify-center w-full my-6 min-h-[220px]">
          <div className="flex flex-wrap gap-4 items-center justify-center max-w-xl">
            {isDrawing && rollingNumbers.length > 0 ? (
              /* Rolling stage cards */
              rollingNumbers.map((num, idx) => (
                <motion.div
                  key={idx}
                  animate={{ y: [-15, 10, -15] }}
                  transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-[#121212] text-[#0A0A0A] font-serif text-2xl font-black shadow-lg flex items-center justify-center"
                >
                  {num}
                </motion.div>
              ))
            ) : results.length > 0 ? (
              /* Final locked items with pop-in slide */
              results.map((num, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 120 }}
                  key={idx}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 text-amber-500 font-mono text-2xl font-black shadow-xl flex items-center justify-center relative group"
                >
                  {/* Subtle lighting overlay */}
                  <div className="absolute inset-0.5 rounded-[1px] bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
                  <span>{num}</span>
                </motion.div>
              ))
            ) : (
              /* Empty Standby Cage */
              <div className="text-center p-8 bg-white/3 border-2 border-white/5 border-dashed rounded-[2rem] max-w-xs">
                <span className="text-5xl block select-none mb-3">🎲</span>
                <p className="text-xs font-serif text-gray-500 leading-relaxed">
                  設定右側數值範圍，點擊按鈕啟動隨機數字篩選，體驗球體物理碰撞效果。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Start button beneath bottom */}
        <button
          id="btn-trigger-number-draw"
          onClick={startDraw}
          disabled={isDrawing}
          className="w-full max-w-sm py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-serif font-black text-sm tracking-widest rounded-2xl shadow-xl active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-amber-500/15"
        >
          <Play className="w-4 h-4 text-[#0E0E0E] fill-current" />
          <span>{isDrawing ? '篩選滾桶高速運轉中...' : '抽出幸運數字'}</span>
        </button>
      </div>

      {/* Numerical Setup Inputs Pane */}
      <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#0F0F0F]">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <ShieldCheck className="w-4.5 h-4.5 text-gray-400" />
            <h4 className="text-xs font-serif font-black uppercase tracking-widest text-amber-500 leading-none">隨機參數設定</h4>
          </div>

          <div className="space-y-4">
            
            {/* Range selection row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 font-serif">最小值最小界</label>
                <input
                  id="number-min-input"
                  type="number"
                  disabled={isDrawing}
                  value={minVal}
                  onChange={(e) => {
                    setValidationError(null);
                    setMinVal(parseInt(e.target.value) || 0);
                  }}
                  className="px-3 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-white rounded-xl placeholder-gray-600 font-serif"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 font-serif">最大值最大界</label>
                <input
                  id="number-max-input"
                  type="number"
                  disabled={isDrawing}
                  value={maxVal}
                  onChange={(e) => {
                    setValidationError(null);
                    setMaxVal(parseInt(e.target.value) || 0);
                  }}
                  className="px-3 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-white rounded-xl placeholder-gray-600 font-serif align-middle"
                />
              </div>
            </div>

            {/* Total drew counts selection */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 font-serif">抽取個數 (抽幾個數)</label>
              <input
                id="number-count-input"
                type="number"
                disabled={isDrawing}
                min="1"
                max="50"
                value={count}
                onChange={(e) => {
                  setValidationError(null);
                  setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)));
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-white rounded-xl font-serif"
              />
            </div>

            {/* Allowed duplications check toggle */}
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-gray-400 font-serif">允許號碼重複與否</label>
              <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 text-[11px]">
                <button
                  id="btn-number-unique"
                  onClick={() => {
                    setValidationError(null);
                    setAllowDuplicate(false);
                  }}
                  disabled={isDrawing}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all font-serif font-semibold cursor-pointer ${
                    !allowDuplicate ? 'bg-white/15 text-white shadow-xs' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="號碼抽出後排除，即不重複"
                >
                  不重複（一輪清）
                </button>
                <button
                  id="btn-number-duplicate"
                  onClick={() => {
                    setValidationError(null);
                    setAllowDuplicate(true);
                  }}
                  disabled={isDrawing}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all font-serif font-semibold cursor-pointer ${
                    allowDuplicate ? 'bg-white/15 text-white shadow-xs' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="每次抽出機率不變（有機會抽到相同數）"
                >
                  可重複
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Clear previous records bottom */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          {results.length > 0 && (
            <button
              id="btn-clear-numbers"
              onClick={clearDraw}
              className="w-full py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer font-serif"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>清空並重新繪製</span>
            </button>
          )}

          <div className="text-[10px] text-gray-500 mt-2 flex items-center space-x-1 justify-center leading-relaxed">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500/50" />
            <span>數值包含最小值與最大值之邊界本身。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
