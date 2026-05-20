import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Gift, Hash, ShieldAlert, Sparkles, Trash2, Calendar, Menu, X, RotateCcw } from 'lucide-react';
import { DrawMode, DrawHistoryItem } from './types';
import TempleDraw from './components/TempleDraw';
import LuckyWheel from './components/LuckyWheel';
import RaffleBox from './components/RaffleBox';
import NumberDraw from './components/NumberDraw';

export default function App() {
  const [activeMode, setActiveMode] = useState<DrawMode>('temple');
  const [history, setHistory] = useState<DrawHistoryItem[]>([
    {
      id: 'pre-1',
      type: 'temple',
      timestamp: '07:51',
      title: '廟宇初開：建立萬用求籤堂',
      detail: '開啟幸事大吉，恭迎諸君前來求神問路。'
    }
  ]);
  const [showHistory, setShowHistory] = useState(true);

  // Common callback to add history item from child modules
  const addHistoryItem = (item: Omit<DrawHistoryItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const newItem: DrawHistoryItem = {
      id: String(Date.now()),
      timestamp: `${hours}:${minutes}:${seconds}`,
      ...item
    };

    setHistory(prev => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 flex flex-col font-sans transition-all selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Decorative Traditional Red/Gold Banner top border */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-[0_1px_15px_rgba(245,158,11,0.3)]" />

      {/* Main Container Header */}
      <header className="bg-[#0F0F0F] border-b border-white/10 py-5 px-6 shrink-0 relative z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-[#0A0A0A] shadow-md shadow-amber-500/20">
              <span className="font-serif font-black text-lg">籤</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-light tracking-widest text-white flex items-center">
                <span>萬用抽籤及</span>
                <span className="font-bold text-amber-500">求籤系統</span>
                <Sparkles className="w-4 h-4 text-amber-500 ml-1.5 shrink-0 animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-500 font-sans tracking-widest uppercase">
                Traditional Oracle Divine & Contemporary Prize Raffle Toolkit
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Quick statistics/meta */}
            <span className="text-[10px] bg-white/5 border border-white/5 text-amber-500/80 px-3 py-1 rounded-sm font-serif font-medium tracking-widest hidden md:inline-block uppercase">
              正德正念・心誠則靈
            </span>

            {/* History drawer toggler */}
            <button
              id="btn-toggle-drawer"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
            >
              <span>{showHistory ? '收起歷史' : '展顯歷史記錄'}</span>
              <span className="bg-amber-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold font-mono">
                {history.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Dashboard Shell Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start overflow-hidden">
        
        {/* Left Interactive Arena: Mode Selector & Active Modules */}
        <div className="flex-1 w-full flex flex-col space-y-6">
          
          {/* Modern Liquid Sliding Mode Switch Tabs (Using standard framer motion) */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0F0F0F] rounded-2xl p-1.5 border border-white/10 text-xs md:text-sm shadow-xl font-serif font-bold">
            
            <button
              id="mode-temple"
              onClick={() => setActiveMode('temple')}
              className={`relative py-3.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center space-x-1.5 z-10 ${
                activeMode === 'temple' ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              <span>廟宇求籤</span>
              {activeMode === 'temple' && (
                <motion.div
                  layoutId="active-mode-backdrop"
                  className="absolute inset-0 bg-amber-500/10 border border-amber-500/30 rounded-xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              id="mode-wheel"
              onClick={() => setActiveMode('wheel')}
              className={`relative py-3.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center space-x-1.5 z-10 ${
                activeMode === 'wheel' ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Gift className="w-4.5 h-4.5" />
              <span>幸運大轉盤</span>
              {activeMode === 'wheel' && (
                <motion.div
                  layoutId="active-mode-backdrop"
                  className="absolute inset-0 bg-amber-500/10 border border-amber-500/30 rounded-xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              id="mode-raffle"
              onClick={() => setActiveMode('raffle')}
              className={`relative py-3.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center space-x-1.5 z-10 ${
                activeMode === 'raffle' ? 'text-rose-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Gift className="w-4.5 h-4.5" />
              <span>名單抽獎箱</span>
              {activeMode === 'raffle' && (
                <motion.div
                  layoutId="active-mode-backdrop"
                  className="absolute inset-0 bg-rose-500/10 border border-rose-500/30 rounded-xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              id="mode-number"
              onClick={() => setActiveMode('number')}
              className={`relative py-3.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center space-x-1.5 z-10 ${
                activeMode === 'number' ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Hash className="w-4.5 h-4.5" />
              <span>幸運數字</span>
              {activeMode === 'number' && (
                <motion.div
                  layoutId="active-mode-backdrop"
                  className="absolute inset-0 bg-amber-500/10 border border-amber-500/30 rounded-xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Active Module content block */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeMode === 'temple' && (
                  <TempleDraw onAddHistory={addHistoryItem} />
                )}
                {activeMode === 'wheel' && (
                  <LuckyWheel onAddHistory={addHistoryItem} />
                )}
                {activeMode === 'raffle' && (
                  <RaffleBox onAddHistory={addHistoryItem} />
                )}
                {activeMode === 'number' && (
                  <NumberDraw onAddHistory={addHistoryItem} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Collapsible Panel: General Draw history logs ledger */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="w-full lg:w-80 shrink-0 bg-[#0D0D0D] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[580px] overflow-hidden lg:sticky lg:top-6"
            >
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4.5 h-4.5 text-amber-500" />
                    <h3 className="font-serif font-extrabold text-sm text-gray-200 tracking-wider">抽選實時契卷</h3>
                  </div>
                  {history.length > 0 && (
                    <button
                      id="btn-clear-all-history"
                      onClick={clearHistory}
                      className="text-[10px] text-gray-500 hover:text-red-400 flex items-center space-x-1 transition-colors"
                      title="清空歷史記錄痕跡"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>全數清空</span>
                    </button>
                  )}
                </div>

                {/* History Lists timeline */}
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <span className="text-3xl select-none">🗂️</span>
                    <p className="text-xs font-serif text-gray-500">尚無任何抽選印記，快去起籤、博杯或轉動轉盤吧！</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
                    {history.map((record) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={record.id}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl relative shadow-xs flex justify-between items-start group transition-all"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center space-x-1.5">
                            {/* Short Badge indicating type */}
                            <span className={`text-[8px] font-serif font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                              record.type === 'temple' 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : record.type === 'wheel' 
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : record.type === 'raffle'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-gray-800 text-yellow-500'
                            }`}>
                              {record.type === 'temple' ? '廟宇' : record.type === 'wheel' ? '轉盤' : record.type === 'raffle' ? '名單' : '數字'}
                            </span>
                            <span className="text-[10px] font-mono font-medium text-gray-500">
                              {record.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-xs font-serif font-bold text-gray-200 pr-1 leading-snug break-all">
                            {record.title}
                          </p>
                          {record.detail && (
                            <p className="text-[10px] text-gray-400 leading-relaxed break-all font-sans font-normal border-l border-amber-500/30 pl-1.5 mt-1">
                              {record.detail}
                            </p>
                          )}
                        </div>

                        {/* Slide delete option trigger */}
                        <button
                          id={`btn-delete-history-${record.id}`}
                          onClick={() => deleteHistoryItem(record.id)}
                          className="lg:opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity p-0.5 shrink-0"
                          title="刪除此紀錄"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status bar bottom block */}
              <div className="pt-4 border-t border-white/10 mt-4 text-[10px] text-gray-500 flex items-center space-x-1 justify-center leading-loose">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500/75 animate-pulse" />
                <span>歷史記錄均儲存於此瀏覽器暫時分頁中。</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Footer footer */}
      <footer className="bg-[#050505] border-t border-white/5 py-4 text-center text-[10px] text-gray-500 shrink-0 font-sans tracking-widest uppercase">
        <p>
          © {new Date().getFullYear()} 萬用抽籤及求籤系統・設計融入東方文化新極簡與現代智慧學
        </p>
      </footer>
    </div>
  );
}
