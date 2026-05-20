export interface FortuneCard {
  id: number;
  title: string;       // 籤別 (e.g., 第一籤、第二籤)
  classification: string; // 籤性 (e.g., 大吉, 上吉, 中平, 下下)
  poetry: string;      // 籤詩
  story: string;       // 籤詩典故
  meaning: string;     // 現代解釋
  love: string;        // 感情問卜詳解
  career: string;      // 事業問卜詳解
  wealth: string;      // 財運問卜詳解
  health: string;      // 健康問卜詳解
}

export interface WheelItem {
  id: string;
  name: string;
  color: string;
  weight: number; // For advanced probability (default to 1)
}

export interface DrawHistoryItem {
  id: string;
  type: 'temple' | 'wheel' | 'raffle' | 'number';
  timestamp: string;
  title: string; // E.g. "抽到：第一籤大吉", "大轉盤：今天吃火鍋"
  detail?: string; // Additional metadata
}

export type DrawMode = 'temple' | 'wheel' | 'raffle' | 'number';
