<template>
  <div class="planning-scene">
    <div class="scene-header">
      <div class="office-background">
        <h2>📋 产品策划室</h2>
        <p>{{ gameState.playerName }}，欢迎来到小米产品策划室！让我们开始规划你的新产品。</p>
      </div>
    </div>

    <div class="planning-content">
      <!-- 产品命名 -->
      <div class="planning-section" v-if="currentStep === 'naming'">
        <div class="section-card">
          <h3>🚀 为你的新产品命名</h3>
          <div class="product-naming">
            <div class="naming-suggestions">
              <p>灵感提示：</p>
              <div class="suggestion-tags">
                <span 
                  v-for="suggestion in namingSuggestions" 
                  :key="suggestion"
                  @click="gameState.productName = suggestion"
                  class="suggestion-tag"
                >
                  {{ suggestion }}
                </span>
              </div>
            </div>
            
            <div class="input-group">
              <input 
                v-model="gameState.productName"
                type="text"
                placeholder="例如：小米17 Pro、Redmi Note 15..."
                class="product-input"
                @keyup.enter="generateFeatures"
              >
              <button 
                @click="generateFeatures"
                :disabled="!gameState.productName.trim() || loading"
                class="generate-btn"
              >
                {{ loading ? '生成中...' : '生成功能特性' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能选择 -->
      <div class="planning-section" v-if="currentStep === 'features'">
        <div class="section-card">
          <h3>✨ 选择产品功能特性</h3>
          <p class="section-subtitle">为 {{ gameState.productName }} 选择最具竞争力的功能特性</p>
          
          <div class="features-stats">
            <div class="stat-item">
              <span class="stat-label">已选功能</span>
              <span class="stat-value">{{ selectedFeaturesCount }}/6</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">预估成本</span>
              <span class="stat-value">¥{{ totalCost.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">市场吸引力</span>
              <span class="stat-value">{{ averageAppeal.toFixed(1) }}/10</span>
            </div>
          </div>

          <div class="features-grid">
            <div 
              v-for="feature in gameState.availableFeatures" 
              :key="feature.id"
              @click="toggleFeature(feature)"
              :class="[
                'feature-card',
                { 'selected': isFeatureSelected(feature.id) },
                { 'disabled': !canSelectFeature(feature) }
              ]"
            >
              <div class="feature-header">
                <span class="feature-icon">{{ feature.icon }}</span>
                <div class="feature-category">{{ getCategoryName(feature.category) }}</div>
              </div>
              
              <h4 class="feature-title">{{ feature.title }}</h4>
              <p class="feature-description">{{ feature.description }}</p>
              
              <div class="feature-metrics">
                <div class="metric">
                  <span class="metric-label">吸引力</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ width: (feature.marketAppeal * 10) + '%' }"
                    ></div>
                  </div>
                  <span class="metric-value">{{ feature.marketAppeal }}/10</span>
                </div>
                
                <div class="metric">
                  <span class="metric-label">成本</span>
                  <span class="metric-value">¥{{ feature.cost.toLocaleString() }}</span>
                </div>
              </div>
              
              <div class="selection-indicator">
                <div class="checkmark">✓</div>
              </div>
            </div>
          </div>

          <div class="planning-actions">
            <button 
              @click="proceedToChat"
              :disabled="selectedFeaturesCount === 0"
              class="proceed-btn"
            >
              与雷总讨论定价 ({{ selectedFeaturesCount }}个功能)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>AI正在分析产品特性...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameState } from '../../composables/useGameState'
import { useAI } from '../../composables/useAI'
import { useAnimations } from '../../composables/useAnimations'
import type { ProductFeature } from '../../types'

const { gameState, toggleFeature, selectedFeaturesCount, totalCost, averageAppeal, setScene } = useGameState()
const { generateFeatures: generateFeaturesAPI, loading } = useAI()
const { sceneTransition } = useAnimations()

const currentStep = ref<'naming' | 'features'>('naming')

const namingSuggestions = [
  '小米17 Pro', '小米17 Ultra', 'Redmi Note 15 Pro', 
  '小米Mix 6', 'Redmi K70 Pro', '小米Civi 4'
]

const categoryNames = {
  performance: '性能',
  design: '设计',
  camera: '拍照',
  battery: '续航',
  ai: 'AI智能',
  connectivity: '连接'
}

const generateFeatures = async () => {
  if (!gameState.productName.trim()) return
  
  const response = await generateFeaturesAPI(gameState.productName)
  if (response) {
    try {
      const data = JSON.parse(response)
      gameState.availableFeatures = data.features || []
      currentStep.value = 'features'
    } catch (error) {
      console.error('解析功能特性失败:', error)
    }
  }
}

const isFeatureSelected = (featureId: string) => {
  return gameState.selectedFeatures.some(f => f.id === featureId)
}

const canSelectFeature = (feature: ProductFeature) => {
  return selectedFeaturesCount.value < 6 || isFeatureSelected(feature.id)
}

const getCategoryName = (category: string) => {
  return categoryNames[category as keyof typeof categoryNames] || category
}

const proceedToChat = async () => {
  if (selectedFeaturesCount.value === 0) return
  
  await sceneTransition('planning', 'ceo-office')
  setScene('ceo-office')
}

onMounted(() => {
  // 如果已有产品名称，直接生成功能
  if (gameState.productName) {
    generateFeatures()
  }
})
</script>

<style scoped>
.planning-scene {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.scene-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.office-background {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.office-background h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.office-background p {
  color: #666;
  font-size: 1.1rem;
}

.planning-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.planning-section {
  margin-bottom: 2rem;
}

.section-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.section-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.product-naming {
  max-width: 600px;
  margin: 0 auto;
}

.naming-suggestions {
  margin-bottom: 2rem;
}

.naming-suggestions p {
  color: #666;
  margin-bottom: 1rem;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.suggestion-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.suggestion-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.product-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.product-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
}

.generate-btn, .proceed-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.generate-btn:hover:not(:disabled), .proceed-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled, .proceed-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.features-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.feature-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.feature-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feature-icon {
  font-size: 2rem;
}

.feature-category {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.feature-card.selected .feature-category {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.feature-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-description {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.feature-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-label {
  font-size: 0.8rem;
  min-width: 60px;
  opacity: 0.8;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.feature-card.selected .metric-bar {
  background: rgba(255, 255, 255, 0.2);
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.feature-card.selected .metric-fill {
  background: white;
}

.metric-value {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.selection-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.feature-card.selected .selection-indicator {
  opacity: 1;
  transform: scale(1);
}

.checkmark {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.planning-actions {
  text-align: center;
  margin-top: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner-ring {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .planning-content {
    padding: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .features-stats {
    grid-template-columns: 1fr;
  }
}
</style>