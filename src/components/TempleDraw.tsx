import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, HelpCircle, RefreshCw, Compass, Shield, Heart, Zap, DollarSign, Activity } from 'lucide-react';
import { traditionalFortunes } from '../data/fortunes';
import { FortuneCard, DrawHistoryItem } from '../types';
import { playTick, playToss, playSuccess, playLowBump } from '../utils/audio';

interface TempleDrawProps {
  onAddHistory: (item: Omit<DrawHistoryItem, 'id' | 'timestamp'>) => void;
}

type Step = 'input' | 'shaking' | 'drawn' | 'tossing' | 'revealed';

export default function TempleDraw({ onAddHistory }: TempleDrawProps) {
  const [question, setQuestion] = useState('');
  const [inputError, setInputError] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [drawnStick, setDrawnStick] = useState<FortuneCard | null>(null);
  
  // Divine block state (筊杯)
  // 'flat' (陽 - inside/flat up) or 'curved' (陰 - outside/rounded up)
  const [blockLeft, setBlockLeft] = useState<'flat' | 'curved'>('flat');
  const [blockRight, setBlockRight] = useState<'flat' | 'curved'>('curved');
  const [tossResult, setTossResult] = useState<'none' | 'sheng' | 'xiao' | 'yin'>('none');
  const [tossCount, setTossCount] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);

  const startShake = () => {
    if (!question.trim()) {
      setInputError(true);
      return;
    }
    setInputError(false);
    
    // Clear previous states
    setTossResult('none');
    setDrawnStick(null);
    setCurrentStep('shaking');
    
    // Play wood shake simulation ticks
    let count = 0;
    const interval = setInterval(() => {
      playTick(160 + Math.random() * 80, 0.08, 0.5);
      count++;
      setShakeCount(count);
      if (count > 12) {
        clearInterval(interval);
        
        // Randomly pull a stick
        const randomCard = traditionalFortunes[Math.floor(Math.random() * traditionalFortunes.length)];
        setDrawnStick(randomCard);
        setCurrentStep('drawn');
      }
    }, 120);
  };

  const tossPoe = () => {
    if (!drawnStick) return;
    
    playToss();
    setCurrentStep('tossing');
    setTossResult('none');

    setTimeout(() => {
      // 50% Sheng (one flat, one curved), 25% Xiao (both flat), 25% Yin (both curved)
      const rand = Math.random();
      let left: 'flat' | 'curved';
      let right: 'flat' | 'curved';
      let res: 'sheng' | 'xiao' | 'yin';

      if (rand < 0.5) {
        // Sheng (聖筊) - One curved, One flat
        left = 'curved';
        right = 'flat';
        res = 'sheng';
        playSuccess();
      } else if (rand < 0.75) {
        // Xiao (笑筊) - Both flat
        left = 'flat';
        right = 'flat';
        res = 'xiao';
        playLowBump();
      } else {
        // Yin (陰筊) - Both curved
        left = 'curved';
        right = 'curved';
        res = 'yin';
        playLowBump();
      }

      setBlockLeft(left);
      setBlockRight(right);
      setTossResult(res);
      setTossCount(c => c + 1);

      if (res === 'sheng') {
        setCurrentStep('revealed');
        // Save to general history list
        onAddHistory({
          type: 'temple',
          title: `廟宇求籤：求問「${question}」`,
          detail: `抽得 [${drawnStick.title}・${drawnStick.classification}] - ${drawnStick.poetry.split('；')[0]}`
        });
      } else {
        setCurrentStep('drawn');
      }
    }, 1000);
  };

  const returnStick = () => {
    setCurrentStep('input');
    setTossResult('none');
    setDrawnStick(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#0F0F0F] border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[580px]">
      
      {/* Visual Workspace Area */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-radial from-[#151515] via-[#0F0F0F] to-[#0A0A0A] relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
          <span className="text-[14rem] font-serif select-none text-white">籤</span>
        </div>

        {/* Current status banner */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center space-x-2 text-gray-400">
            <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <span className="font-serif text-xs tracking-widest font-medium uppercase">古老廟宇智慧・誠心祈求</span>
          </div>
          {tossCount > 0 && (
            <span className="text-xs font-mono bg-white/5 border border-white/5 text-amber-500 px-3 py-1 rounded-sm">
              累計擲筊: {tossCount} 次
            </span>
          )}
        </div>

        {/* Main Central Stage */}
        <div className="flex-1 flex flex-col items-center justify-center my-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Input Question */}
            {currentStep === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-md flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-md">
                    <HelpCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-serif font-light text-white tracking-widest">叩問神明之事</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    靜心閉眼，在心中默念您的姓名、出生年月日及想求問的事情，輸入於下方。
                  </p>
                </div>

                <div className="w-full relative">
                  <textarea
                    id="temple-question-input"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      if (e.target.value.trim()) setInputError(false);
                    }}
                    placeholder="請輸入您要求問的大事（如：今年的轉職發展是否順利？、跟近期心儀對象的感情發展...）"
                    className={`w-full h-28 px-4 py-3 bg-white/5 border ${inputError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-600 text-sm shadow-inner transition-all resize-none font-serif`}
                    maxLength={100}
                  />
                  {inputError && (
                    <p className="text-red-400 text-[11px] text-left mt-1 font-sans animate-pulse">
                      ⚠️ 請先輸入您想向神明求問的事情，以示誠心喔！
                    </p>
                  )}
                  <span className="absolute bottom-2 right-3 text-[10px] text-gray-600">
                    {question.length}/100
                  </span>
                </div>

                <button
                  id="btn-start-shake"
                  onClick={startShake}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-serif font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all tracking-widest text-base flex items-center justify-center space-x-2 cursor-pointer shadow-amber-550/10"
                >
                  <span>誠心起蓋・開始搖籤</span>
                </button>
              </motion.div>
            )}

            {/* Step 2: Shaking animation */}
            {currentStep === 'shaking' && (
              <motion.div
                key="shaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-6"
              >
                {/* 3D Shaking Stick Jar */}
                <motion.div
                  animate={{
                    y: [0, -15, 10, -10, 15, -5, 0],
                    rotate: [0, -6, 6, -8, 8, -4, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                  className="relative w-28 h-52 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-xl rounded-b-3xl shadow-2xl border-4 border-amber-950 flex flex-col items-center py-4"
                >
                  {/* Bamboo Sticks sticking out top */}
                  <div className="absolute -top-16 left-2 right-2 h-16 flex justify-around overflow-visible">
                     {[1, 2, 3, 4, 5, 6, 7].map((itm) => (
                      <motion.div
                        key={itm}
                        animate={{
                          y: shakeCount % 2 === 0 ? [0, -10, 0] : [0, 5, 0],
                          rotate: [-2, 2, -2]
                        }}
                        transition={{ duration: 0.15, repeat: Infinity }}
                        className="w-2.5 h-20 bg-amber-200 border border-amber-400 rounded-sm origin-bottom"
                      />
                    ))}
                  </div>

                  {/* Red Traditional ribbon band on stick jar */}
                  <div className="w-full bg-red-700 border-y border-red-800 text-center py-1 mt-12 shadow-sm">
                    <span className="text-[10px] text-red-100 font-serif tracking-widest block uppercase">萬事皆靈</span>
                  </div>
                  
                  {/* Wood carve accent */}
                  <div className="mt-auto w-10 h-10 rounded-full bg-amber-950 flex items-center justify-center text-amber-500 font-serif text-[10px] border border-amber-800">
                    大吉
                  </div>
                </motion.div>

                <div className="text-center space-y-1">
                  <p className="text-amber-500 font-serif font-medium tracking-widest animate-pulse">神明正在斟酌指示...</p>
                  <p className="text-xs text-gray-500">竹籤搖晃，天機正在顯現</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Stick pulled out - Need to Toss Cups to verify */}
            {(currentStep === 'drawn' || currentStep === 'tossing') && drawnStick && (
              <motion.div
                key="drawn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md flex flex-col items-center space-y-6"
              >
                {/* Visual of the single drawn stick */}
                <div className="w-full p-4 bg-white/5 border border-white/10 rounded-3xl shadow-xl backdrop-blur-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-[#0a0a0a] font-serif text-[14px] font-black flex items-center justify-center">
                      抽
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">您抽得：{drawnStick.title}</h4>
                      <p className="text-[11px] text-gray-400 font-serif">籤詩首句：{drawnStick.poetry.split('，')[0]}...</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-500/10 border border-amber-500/20 font-serif text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                    {drawnStick.classification}
                  </span>
                </div>

                {/* Shaking & Instruction */}
                <div className="text-center space-y-1">
                  <h4 className="text-base font-serif font-semibold text-gray-200 flex items-center justify-center space-x-1">
                    <span>📿 請擲筊確認此籤</span>
                  </h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    傳統求籤需擲出一次「聖筊」（一陰一陽），方能確保此籤為神明屬意的旨意。
                  </p>
                </div>

                {/* Interactive Poe Blocks (筊杯) */}
                <div className="flex justify-center space-x-10 py-2 relative min-h-[140px] items-center w-full">
                  
                  {/* Left Block */}
                  <motion.div
                    animate={currentStep === 'tossing' ? {
                      y: [0, -80, 40, -20, 0],
                      x: [0, -30, -5, 0],
                      rotateY: [0, 360, 720],
                      rotate: [0, 45, 180, 0],
                    } : {}}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="relative w-16 h-28 cursor-pointer group animate-pulse-slow"
                  >
                    {blockLeft === 'curved' ? (
                      /* Curved Side Up (陰/Rounded) */
                      <div className="w-full h-full bg-gradient-to-r from-red-800 to-red-950 rounded-l-full rounded-r-[40px] shadow-lg flex items-center justify-center border-l-4 border-amber-500/20 transform rotate-12">
                        <span className="text-[10px] text-red-100/50 font-serif writing-mode-vertical">外凸・陰</span>
                      </div>
                    ) : (
                      /* Flat Side Up (陽/Flat) */
                      <div className="w-full h-full bg-gradient-to-r from-amber-200 to-[#FFFBEB] rounded-l-full rounded-r-[40px] shadow-inner border border-red-900/60 p-2 flex flex-col justify-between items-center transform rotate-12">
                        <div className="w-full h-full bg-red-950/10 rounded-l-full rounded-r-[35px] border border-dashed border-red-900/30 flex items-center justify-center">
                          <span className="text-xs text-red-950 font-serif font-black">內平・陽</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Right Block */}
                  <motion.div
                    animate={currentStep === 'tossing' ? {
                      y: [0, -90, 30, -10, 0],
                      x: [0, 30, 5, 0],
                      rotateY: [0, -360, -720],
                      rotate: [0, -45, -180, 0],
                    } : {}}
                    transition={{ duration: 0.95, ease: "easeOut" }}
                    className="relative w-16 h-28"
                  >
                    {blockRight === 'curved' ? (
                      /* Curved Side Up (陰/Rounded) */
                      <div className="w-full h-full bg-gradient-to-l from-red-800 to-red-950 rounded-r-full rounded-l-[40px] shadow-lg flex items-center justify-center border-r-4 border-amber-500/20 transform -rotate-12">
                        <span className="text-[10px] text-red-100/50 font-serif writing-mode-vertical">外凸・陰</span>
                      </div>
                    ) : (
                      /* Flat Side Up (陽/Flat) */
                      <div className="w-full h-full bg-gradient-to-l from-amber-200 to-[#FFFBEB] rounded-r-full rounded-l-[40px] shadow-inner border border-red-900/60 p-2 flex flex-col justify-between items-center transform -rotate-12">
                        <div className="w-full h-full bg-red-950/10 rounded-r-full rounded-l-[35px] border border-dashed border-red-900/30 flex items-center justify-center">
                          <span className="text-xs text-red-950 font-serif font-black">內平・陽</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Toss feedback banner */}
                {tossResult !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-center w-full max-w-xs ${
                      tossResult === 'sheng'
                        ? 'bg-emerald-950/45 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : tossResult === 'xiao'
                        ? 'bg-amber-950/45 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'bg-rose-950/45 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    }`}
                  >
                    {tossResult === 'sheng' && "【聖筊】神明允可！聖意讚同此籤！"}
                    {tossResult === 'xiao' && "【笑筊】神明微笑不語，求問心中尚不定？請再擲"}
                    {tossResult === 'yin' && "【陰筊】神明未允。此籤不符，請放回重抽"}
                  </motion.div>
                )}

                {/* Trigger control */}
                <div className="w-full grid grid-cols-2 gap-4">
                  <button
                    id="btn-return-stick"
                    disabled={currentStep === 'tossing'}
                    onClick={returnStick}
                    className="py-3 bg-white/5 text-gray-300 font-medium rounded-xl hover:bg-white/10 hover:text-white active:scale-95 transition-all text-xs border border-white/10 disabled:opacity-50 cursor-pointer"
                  >
                    放回籤筒重抽
                  </button>
                  <button
                    id="btn-toss-poe"
                    disabled={currentStep === 'tossing'}
                    onClick={tossPoe}
                    className="py-3 bg-red-700 hover:bg-red-600 text-white font-serif font-semibold rounded-xl shadow-lg shadow-red-950/30 active:scale-95 transition-all text-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{tossResult === 'none' ? '擲筊請示' : '再次擲筊'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Draw confirmed, revealed full details */}
            {currentStep === 'revealed' && drawnStick && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-lg flex flex-col space-y-5 my-2"
              >
                {/* Traditional Scroll Style card */}
                <div className="relative p-6 bg-[#13110E] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden font-serif">
                  
                  {/* Ornate Gold Borders */}
                  <div className="absolute top-3 left-4 right-4 h-1 border-t border-dashed border-amber-500/10" />
                  <div className="absolute bottom-3 left-4 right-4 h-1 border-b border-dashed border-amber-500/10" />

                  {/* Card Title & Classification */}
                  <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold leading-none mb-1">Divine Oracle Scroll</span>
                      <h4 className="text-xl md:text-2xl font-bold tracking-widest text-amber-400">{drawnStick.title}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-red-700 text-red-100 px-3 py-1 rounded-sm text-xs font-bold font-serif shadow-sm">
                        {drawnStick.classification}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1 font-sans">{drawnStick.story}</span>
                    </div>
                  </div>

                  {/* Traditional poetry box */}
                  <div className="py-4 px-5 bg-amber-500/5 rounded-2xl border border-amber-500/15 text-center mb-4 relative">
                    <div className="absolute top-2 left-2 text-amber-500/10 font-mono text-lg leading-none">❝</div>
                    <p className="text-base md:text-lg font-bold text-amber-200 font-serif leading-relaxed tracking-wider py-0.5 select-none">
                      {drawnStick.poetry.split('；')[0]}
                    </p>
                    <p className="text-base md:text-lg font-bold text-amber-200 font-serif leading-relaxed tracking-wider py-0.5 select-none">
                      {drawnStick.poetry.split('；')[1]}
                    </p>
                    <div className="absolute bottom-2 right-2 text-amber-500/10 font-mono text-lg leading-none text-right">❞</div>
                  </div>

                  {/* Overall Meaning in Details */}
                  <div className="space-y-4 max-h-56 overflow-y-auto pr-1 text-sm font-sans scrollbar-thin">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <h5 className="font-serif font-bold text-amber-400 text-xs tracking-widest mb-1.5 flex items-center uppercase">
                        <Compass className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> 籤詩白話解析
                      </h5>
                      <p className="text-xs text-gray-300 leading-relaxed font-normal">{drawnStick.meaning}</p>
                    </div>

                    {/* Quick Guidance Icons */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <h6 className="font-serif font-bold text-red-400 text-xs mb-1 flex items-center uppercase">
                          <Heart className="w-3.5 h-3.5 mr-1 text-red-500" /> 祈求姻緣
                        </h6>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-normal">{drawnStick.love}</p>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <h6 className="font-serif font-bold text-amber-400 text-xs mb-1 flex items-center uppercase">
                          <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" /> 考運事業
                        </h6>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-normal">{drawnStick.career}</p>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <h6 className="font-serif font-bold text-emerald-400 text-xs mb-1 flex items-center uppercase">
                          <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-500" /> 尋求財源
                        </h6>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-normal">{drawnStick.wealth}</p>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <h6 className="font-serif font-bold text-indigo-400 text-xs mb-1 flex items-center uppercase">
                          <Activity className="w-3.5 h-3.5 mr-1 text-indigo-550" /> 身體康泰
                        </h6>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-normal">{drawnStick.health}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-return-interactive"
                  onClick={returnStick}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-serif font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] tracking-widest text-[14px] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>感謝開示・重返抽籤</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Guide Deck (Side instruction guide column) */}
      <div className="w-full md:w-72 bg-[#0B0B0B] border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <h4 className="text-sm font-serif font-bold text-gray-200 flex items-center space-x-1.5 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>廟宇求籤指南</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              自古以來，求問神明講求「信、誠、寬、行」。抽籤並非一成不變的主宰，而是當局者迷時，提供另一個視角與心靈指點。
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold font-serif text-amber-500 uppercase tracking-widest">
              步驟與心路
            </h5>
            <div className="space-y-3 font-sans text-xs text-gray-400">
              <div className="flex space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-[10px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-gray-200">默念自薦</p>
                  <p className="text-[11px] text-gray-500">念名字、今日年月日與心中執念。</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-[10px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-gray-200">求籤搖晃</p>
                  <p className="text-[11px] text-gray-500">神明會為您挑選出一支最對應心照的竹籤。</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-[10px] shrink-0">3</span>
                <div>
                  <p className="font-bold text-gray-200">博杯請示</p>
                  <p className="text-[11px] text-gray-500">需出現一陰一陽（聖筊）確認此竹籤即為神旨。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional wisdom footnote */}
        <div className="pt-6 border-t border-white/10 mt-6 md:mt-0 text-[10px] text-gray-600 font-serif leading-loose">
          <p>「吉人自有天相，積善之家必有餘慶。」</p>
          <p className="mt-1">抽中下籤無須驚慌，修身自愛即可消災開泰；抽中大吉宜謙虛行善，方能常保天佑。</p>
        </div>
      </div>
    </div>
  );
}
