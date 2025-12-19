import { ref, computed, reactive } from 'vue'
import type { GameState, SceneType, ProductFeature, ChatMessage, MarketReaction } from '../types'

const gameState = reactive<GameState>({
  currentScene: 'intro',
  playerName: '',
  productName: '',
  selectedFeatures: [],
  availableFeatures: [],
  chatHistory: [],
  suggestedPrice: 0,
  finalPrice: 0,
  marketReactions: [],
  salesPrediction: {
    firstDaySales: 0,
    monthSales: 0,
    yearSales: 0,
    marketShare: 0,
    profitMargin: 0,
    riskFactors: []
  },
  gameScore: 0,
  achievements: [],
  hasUsedPersuasion: false
})

const loading = ref(false)
const currentAnimation = ref('')

export function useGameState() {
  // 场景控制
  const setScene = (scene: SceneType) => {
    gameState.currentScene = scene
  }

  const nextScene = () => {
    const scenes: SceneType[] = ['intro', 'planning', 'ceo-office', 'launch-stage', 'board-room', 'social-media', 'results']
    const currentIndex = scenes.indexOf(gameState.currentScene)
    if (currentIndex < scenes.length - 1) {
      gameState.currentScene = scenes[currentIndex + 1]
    }
  }

  // 产品功能管理
  const addFeature = (feature: ProductFeature) => {
    if (!gameState.selectedFeatures.find(f => f.id === feature.id)) {
      gameState.selectedFeatures.push(feature)
    }
  }

  const removeFeature = (featureId: string) => {
    gameState.selectedFeatures = gameState.selectedFeatures.filter(f => f.id !== featureId)
  }

  const toggleFeature = (feature: ProductFeature) => {
    const exists = gameState.selectedFeatures.find(f => f.id === feature.id)
    if (exists) {
      removeFeature(feature.id)
    } else {
      addFeature(feature)
    }
  }

  // 聊天管理
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    gameState.chatHistory.push({
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    })
  }

  const clearChat = () => {
    gameState.chatHistory = []
  }

  // 市场反应管理
  const addMarketReaction = (reaction: Omit<MarketReaction, 'id' | 'timestamp'>) => {
    gameState.marketReactions.push({
      ...reaction,
      id: Date.now().toString(),
      timestamp: Date.now()
    })
  }

  // 游戏重置
  const resetGame = () => {
    Object.assign(gameState, {
      currentScene: 'intro',
      playerName: '',
      productName: '',
      selectedFeatures: [],
      availableFeatures: [],
      chatHistory: [],
      suggestedPrice: 0,
      finalPrice: 0,
      marketReactions: [],
      salesPrediction: {
        firstDaySales: 0,
        monthSales: 0,
        yearSales: 0,
        marketShare: 0,
        profitMargin: 0,
        riskFactors: []
      },
      gameScore: 0,
      achievements: [],
      hasUsedPersuasion: false
    })
  }

  // 计算属性
  const selectedFeaturesCount = computed(() => gameState.selectedFeatures.length)
  const totalCost = computed(() => 
    gameState.selectedFeatures.reduce((sum, feature) => sum + feature.cost, 0)
  )
  const averageAppeal = computed(() => {
    if (gameState.selectedFeatures.length === 0) return 0
    return gameState.selectedFeatures.reduce((sum, feature) => sum + feature.marketAppeal, 0) / gameState.selectedFeatures.length
  })

  return {
    // 状态
    gameState,
    loading,
    currentAnimation,
    
    // 方法
    setScene,
    nextScene,
    addFeature,
    removeFeature,
    toggleFeature,
    addMessage,
    clearChat,
    addMarketReaction,
    resetGame,
    
    // 计算属性
    selectedFeaturesCount,
    totalCost,
    averageAppeal
  }
}