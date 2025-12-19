// 游戏相关类型定义
export interface GameState {
  currentScene: SceneType
  playerName: string
  productName: string
  selectedFeatures: ProductFeature[]
  availableFeatures: ProductFeature[]
  chatHistory: ChatMessage[]
  suggestedPrice: number
  finalPrice: number
  marketReactions: MarketReaction[]
  salesPrediction: SalesPrediction
  gameScore: number
  achievements: Achievement[]
  hasUsedPersuasion: boolean
}

export type SceneType = 
  | 'intro' 
  | 'planning' 
  | 'ceo-office' 
  | 'launch-stage' 
  | 'board-room' 
  | 'social-media' 
  | 'results'

export interface ProductFeature {
  id: string
  title: string
  description: string
  marketAppeal: number
  cost: number
  category: 'performance' | 'design' | 'camera' | 'battery' | 'ai' | 'connectivity'
  icon: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'lei-jun' | 'system'
  content: string
  timestamp: number
  emotion?: 'happy' | 'concerned' | 'excited' | 'serious'
  avatar?: string
}

export interface MarketReaction {
  id: string
  type: 'positive' | 'negative' | 'competitor' | 'media'
  platform: string
  author: string
  content: string
  likes: number
  timestamp: number
  influence: number
}

export interface SalesPrediction {
  firstDaySales: number
  monthSales: number
  yearSales: number
  marketShare: number
  profitMargin: number
  riskFactors: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

export interface AIResponse {
  content: string
  emotion?: string
  suggestions?: string[]
}