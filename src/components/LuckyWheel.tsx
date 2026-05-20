import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Play, Plus, Trash2, Sliders, RefreshCw, HelpCircle, FileDiff, Sparkles } from 'lucide-react';
import { WheelItem, DrawHistoryItem } from '../types';
import { playTick, playSuccess } from '../utils/audio';

interface LuckyWheelProps {
  onAddHistory: (item: Omit<DrawHistoryItem, 'id' | 'timestamp'>) => void;
}

const PRESETS: Record<string, Omit<WheelItem, 'id'>[]> = {
  food: [
    { name: '排骨飯', color: '#f59e0b', weight: 1 },
    { name: '牛肉麵', color: '#ef4444', weight: 1 },
    { name: '小籠包', color: '#10b981', weight: 1 },
    { name: '小火鍋', color: '#3b82f6', weight: 1 },
    { name: '義大利麵', color: '#8b5cf6', weight: 1 },
    { name: '麥當勞', color: '#ec4899', weight: 1 },
    { name: '健康餐盒', color: '#14b8a6', weight: 1 },
    { name: '麻辣燙', color: '#9a3412', weight: 1 },
  ],
  truthOrDare: [
    { name: '真心話', color: '#3b82f6', weight: 1 },
    { name: '大冒險', color: '#ef4444', weight: 1 },
    { name: '安全過關', color: '#10b981', weight: 1 },
    { name: '再抽一次', color: '#f59e0b', weight: 1 },
    { name: '真心話（雙倍）', color: '#8b5cf6', weight: 1 },
    { name: '大冒險（指定）', color: '#ec4899', weight: 1 },
  ],
  partyPenalty: [
    { name: '學貓叫3次', color: '#ec4899', weight: 1 },
    { name: '仰臥起坐5個', color: '#f59e0b', weight: 1 },
    { name: '真心話大坦白', color: '#3b82f6', weight: 1 },
    { name: '喝水一大杯', color: '#10b981', weight: 1 },
    { name: '分享一個祕密', color: '#8b5cf6', weight: 1 },
    { name: '公主抱隔壁', color: '#ef4444', weight: 1 },
  ],
  yesNo: [
    { name: '絕對可以', color: '#10b981', weight: 1 },
    { name: '不建議如此', color: '#ef4444', weight: 1 },
    { name: '稍微等等', color: '#3b82f6', weight: 1 },
    { name: '重新思量', color: '#ec4899', weight: 1 },
    { name: '有貴人相助', color: '#f59e0b', weight: 1 },
    { name: '命運掌握在手', color: '#8b5cf6', weight: 1 },
  ]
};

const PALETTE = [
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#14b8a6', '#6366f1', '#a855f7', '#f43f5e', '#06b6d4', '#059669'
];

export default function LuckyWheel({ onAddHistory }: LuckyWheelProps) {
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', name: '大吉', color: '#ef4444', weight: 1 },
    { id: '2', name: '上吉', color: '#f59e0b', weight: 1 },
    { id: '3', name: '中吉', color: '#3b82f6', weight: 1 },
    { id: '4', name: '小吉', color: '#10b981', weight: 1 },
    { id: '5', name: '中平', color: '#8b5cf6', weight: 1 },
    { id: '6', name: '再接再厲', color: '#94a3b8', weight: 1 },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [activeTab, setActiveTab] = useState<'options' | 'presets'>('options');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Physics refs
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const requestIdRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef(-1);

  // Initialize preset
  const loadPreset = (presetKey: string) => {
    if (isSpinning) return;
    const list = PRESETS[presetKey];
    if (list) {
      setItems(list.map((item, idx) => ({
        id: String(Date.now() + idx),
        ...item
      })));
      setWinner(null);
      angleRef.current = 0;
    }
  };

  // Add customized option
  const addOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isSpinning) return;

    const chosenColor = PALETTE[items.length % PALETTE.length];
    const item: WheelItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      color: chosenColor,
      weight: 1
    };

    setItems([...items, item]);
    setNewItemName('');
    setWinner(null);
  };

  // Delete option
  const deleteOption = (id: string) => {
    if (items.length <= 2 || isSpinning) {
      return;
    }
    setItems(items.filter(item => item.id !== id));
    setWinner(null);
  };

  // Draw wheel on canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    // Dynamic segments
    const totalWeights = items.reduce((acc, item) => acc + item.weight, 0);
    let startAngle = angleRef.current;

    // Outer gold border shadow
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    
    // Draw outer golden ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#b45309'; // amber-700 outline
    ctx.fill();

    // Reset shadow for slices
    ctx.shadowBlur = 0;

    items.forEach((item, index) => {
      const sliceAngle = (item.weight / totalWeights) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Slice section
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Divider Lines
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Contrast font sizes based on space
      const textLen = item.name.length;
      let fontSize = 14;
      if (items.length > 10) fontSize = 11;
      else if (items.length > 8) fontSize = 12;
      
      ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
      
      // Shadow to make texts readable
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;

      // Draw truncated or full text
      const displayText = textLen > 7 ? item.name.substring(0, 6) + '..' : item.name;
      ctx.fillText(displayText, radius - 25, 0);
      ctx.restore();

      startAngle = endAngle;
    });

    // Draw central golden handle knob
    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.fill();

    // Clean shadow
    ctx.shadowBlur = 0;
  };

  // Keep drawing based on angle
  useEffect(() => {
    drawWheel();
  }, [items]);

  const spin = () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    lastTickSegmentRef.current = -1;

    // Angular acceleration impulse
    // Pick standard rotation + randomized offset
    const randomBoost = 12 + Math.random() * 10;
    velocityRef.current = randomBoost;

    const friction = 0.985; // Natural speed deceleration

    const animate = () => {
      angleRef.current += velocityRef.current * (Math.PI / 180);
      velocityRef.current *= friction;

      // Wrap angle to 0 - 2PI range
      const normAngle = angleRef.current % (2 * Math.PI);

      // Tick Audio Simulation logic
      // Check which segment is currently directly facing the top point 
      // (Top point is at 270 degrees or 1.5 * Math.PI)
      const totalWeights = items.reduce((acc, item) => acc + item.weight, 0);
      
      // Calculate active peg divider offset
      const checkAngle = (1.5 * Math.PI - normAngle + 4 * Math.PI) % (2 * Math.PI);
      let currentSegIndex = 0;
      let angleAcc = 0;
      
      for (let i = 0; i < items.length; i++) {
        const itemAngle = (items[i].weight / totalWeights) * (2 * Math.PI);
        angleAcc += itemAngle;
        if (checkAngle < angleAcc) {
          currentSegIndex = i;
          break;
        }
      }

      if (currentSegIndex !== lastTickSegmentRef.current) {
        lastTickSegmentRef.current = currentSegIndex;
        // Frequency changes depending on velocity
        const tickPitch = 240 + (velocityRef.current * 4);
        playTick(Math.min(tickPitch, 400), 0.04, 0.25);
      }

      drawWheel();

      if (velocityRef.current < 0.08) {
        // Halt completely
        velocityRef.current = 0;
        setIsSpinning(false);
        cancelAnimationFrame(requestIdRef.current!);
        
        // Calculate Winner
        // Top pointer is situated at Angle 1.5 * PI (270deg)
        const finalCheckAngle = (1.5 * Math.PI - (angleRef.current % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
        let finalAcc = 0;
        let winItem = items[0];
        
        for (let i = 0; i < items.length; i++) {
          const itemAngle = (items[i].weight / totalWeights) * (2 * Math.PI);
          finalAcc += itemAngle;
          if (finalCheckAngle < finalAcc) {
            winItem = items[i];
            break;
          }
        }

        setWinner(winItem);
        playSuccess();
        onAddHistory({
          type: 'wheel',
          title: `轉盤抽中：${winItem.name}`,
          detail: `總共選項有 ${items.length} 個：[${items.map(i => i.name).join(', ')}]`
        });
      } else {
        requestIdRef.current = requestAnimationFrame(animate);
      }
    };

    requestIdRef.current = requestAnimationFrame(animate);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#0F0F0F] border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[550px]">
      
      {/* Visual Wheel Deck & Pointer */}
      <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#121212] via-[#0F0F0F] to-[#0D0D0D] relative border-b md:border-b-0 md:border-r border-white/5">
        
        {/* Pointer (Top Notch Arrow Peg) */}
        <div className="absolute top-8 z-10 flex flex-col items-center">
          <motion.div 
            animate={isSpinning ? {
              rotate: [0, -15, 10, -5, 12, -2, 0],
            } : {}}
            transition={{ duration: 0.15, repeat: isSpinning ? Infinity : 0 }}
            className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-500 drop-shadow-md origin-top"
          />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 -mt-1 shadow-sm" />
        </div>

        {/* Spin wheel canvas container */}
        <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center my-4">
          <canvas
            ref={canvasRef}
            width={720}
            height={720}
            className="w-full h-full max-w-full drop-shadow-2xl"
          />
          
          {/* Inner click center cover overlay */}
          <button
            id="btn-spin-wheel-center"
            onClick={spin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-2 border-[#121212] text-white drop-shadow-md flex flex-col items-center justify-center font-serif text-sm font-bold tracking-tight select-none active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer z-10"
          >
            <span>{isSpinning ? '轉..' : 'SPIN'}</span>
          </button>
        </div>

        <button
          id="btn-spin-wheel-large"
          onClick={spin}
          disabled={isSpinning}
          className="w-full max-w-xs mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-serif font-black text-sm tracking-widest rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-amber-500/10"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSpinning ? '轉盤極速飛轉中...' : '起轉！啟動大轉盤'}</span>
        </button>

        {/* Winning Popup Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-20"
            >
              <div className="bg-[#151515] rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-white/10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 mx-auto flex items-center justify-center text-amber-500 shadow-inner">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">抽選結果出爐</span>
                  <p className="text-2xl font-black font-serif px-2 break-words" style={{ color: winner.color }}>
                    {winner.name}
                  </p>
                </div>
                <button
                  id="btn-winner-confirm"
                  onClick={() => setWinner(null)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0E0E0E] font-sans text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  太棒了，收下結果
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editor & Preset Control Panel */}
      <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#0F0F0F]">
        
        {/* Upper Navigation for editor */}
        <div className="space-y-5 flex-1 flex flex-col overflow-hidden">
          
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 text-xs">
            <button
              id="tab-options"
              onClick={() => setActiveTab('options')}
              className={`flex-1 py-1.5 rounded-lg font-serif font-semibold text-center transition-all cursor-pointer ${
                activeTab === 'options' ? 'bg-white/15 text-white shadow-xs' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              自訂選項
            </button>
            <button
              id="tab-presets"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 rounded-lg font-serif font-semibold text-center transition-all cursor-pointer ${
                activeTab === 'presets' ? 'bg-white/15 text-white shadow-xs' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              經典範本
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'options' ? (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col space-y-4 overflow-hidden"
              >
                {/* Input box */}
                <form onSubmit={addOption} className="flex space-x-2 shrink-0">
                  <input
                    id="spin-option-input"
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="新增選項..."
                    maxLength={15}
                    disabled={isSpinning}
                    className="flex-1 px-3 py-2 bg-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-white border border-white/10 placeholder-gray-600 font-serif"
                  />
                  <button
                    id="btn-add-option"
                    type="submit"
                    disabled={isSpinning}
                    className="px-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                {/* Slices lists */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 border border-white/5 rounded-xl p-2 bg-white/3 max-h-60 md:max-h-[280px] scrollbar-thin">
                  <div className="text-[10px] text-gray-500 font-serif mb-1.5 px-1 uppercase tracking-wider">目前的轉盤扇區 (最少2個)</div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#141414] border border-white/5 shadow-xs group"
                    >
                      <div className="flex items-center space-x-2">
                        {/* Circle representing color */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-300 font-medium font-serif truncate max-w-36">
                          {item.name}
                        </span>
                      </div>
                      <button
                        id={`btn-del-option-${item.id}`}
                        onClick={() => deleteOption(item.id)}
                        disabled={isSpinning || items.length <= 2}
                        className="text-gray-500 hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-all disabled:opacity-20 disabled:hover:text-gray-500 cursor-pointer"
                        title={items.length <= 2 ? "最少需有2個選項" : "刪除"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="presets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="text-[10px] text-gray-500 font-serif uppercase tracking-widest mb-1">請選擇一個主題套用至大轉盤上：</div>
                
                <button
                  id="preset-food"
                  onClick={() => loadPreset('food')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 font-serif">🥗 今天吃什麼？</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-loose">解決世紀難題，排骨飯、牛肉麵、麥當勞...</p>
                  </div>
                </button>

                <button
                  id="preset-truth"
                  onClick={() => loadPreset('truthOrDare')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 font-serif">🤫 真心話大冒險</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-loose">聚會同樂必備，真心話、大冒險、指定挑戰等。</p>
                  </div>
                </button>

                <button
                  id="preset-party"
                  onClick={() => loadPreset('partyPenalty')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 font-serif">🎭 遊戲大懲罰</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-loose">懲罰不冷場：學貓叫、仰臥起坐、分享祕密...</p>
                  </div>
                </button>

                <button
                  id="preset-yesno"
                  onClick={() => loadPreset('yesNo')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 font-serif">🔮 買定離手決策</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-loose">幫助陷入選擇困難的答案：絕對可以、重新思量...</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footnotes instruction */}
        <div className="pt-4 border-t border-white/5 mt-4 text-[10px] text-gray-500 flex items-center space-x-1 justify-center">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500/50" />
          <span>扇形大小均等，各選項被選中機率相同。</span>
        </div>
      </div>
    </div>
  );
}
