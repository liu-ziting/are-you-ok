<template>
  <div class="ceo-office-scene">
    <div class="office-environment">
      <div class="office-background">
        <div class="window-view"></div>
        <div class="office-furniture">
          <div class="desk"></div>
          <div class="chair"></div>
          <div class="bookshelf"></div>
        </div>
      </div>
      
      <div class="chat-interface">
        <div class="chat-header">
          <div class="lei-jun-avatar">
            <div class="avatar-img">🍊</div>
            <div class="status-indicator online"></div>
          </div>
          <div class="chat-info">
            <h3>雷军 CEO</h3>
            <p class="status-text">在线 - 正在讨论定价策略</p>
          </div>
          <div class="product-context">
            <span class="product-name">{{ gameState.productName }}</span>
            <span class="features-count">{{ selectedFeaturesCount }}个功能</span>
          </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="message in gameState.chatHistory" 
            :key="message.id"
            :class="['message', `message-${message.role}`]"
          >
            <div class="message-avatar">
              <div v-if="message.role === 'lei-jun'" class="lei-jun-icon">🍊</div>
              <div v-else class="user-icon">👤</div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">
                  {{ message.role === 'lei-jun' ? '雷军' : gameState.playerName }}
                </span>
                <span class="message-time">
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
              
              <div class="message-text" :class="{ 'typing': message.id === typingMessageId }">
                {{ message.content }}
              </div>
              
              <div v-if="message.role === 'lei-jun' && message.emotion" class="emotion-indicator">
                {{ getEmotionEmoji(message.emotion) }}
              </div>
            </div>
          </div>
          
          <!-- 打字指示器 -->
          <div v-if="isLeiJunTyping" class="message message-lei-jun typing-indicator">
            <div class="message-avatar">
              <div class="lei-jun-icon">🍊</div>
            </div>
            <div class="message-content">
              <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="suggested-responses" v-if="suggestedResponses.length > 0">
            <button 
              v-for="suggestion in suggestedResponses" 
              :key="suggestion"
              @click="sendSuggestedMessage(suggestion)"
              class="suggestion-btn"
            >
              {{ suggestion }}
            </button>
          </div>
          
          <div class="input-container">
            <input 
              v-model="userMessage"
              type="text"
              placeholder="输入你的想法..."
              class="chat-input"
              @keyup.enter="sendMessage"
              :disabled="loading"
            >
            <button 
              @click="sendMessage"
              :disabled="!userMessage.trim() || loading"
              class="send-btn"
            >
              <span class="send-icon">📤</span>
            </button>
          </div>
        </div>

        <!-- 价格建议显示 -->
        <div v-if="gameState.suggestedPrice > 0" class="price-suggestion-panel">
          <div class="price-display">
            <h4>💰 定价建议</h4>
            <div class="price-amount">¥{{ gameState.suggestedPrice.toLocaleString() }}</div>
            <div class="price-analysis">
              <div class="analysis-item">
                <span class="label">成本分析</span>
                <span class="value">¥{{ totalCost.toLocaleString() }}</span>
              </div>
              <div class="analysis-item">
                <span class="label">利润率</span>
                <span class="value">{{ profitMargin }}%</span>
              </div>
              <div class="analysis-item">
                <span class="label">市场定位</span>
                <span class="value">{{ marketPosition }}</span>
              </div>
            </div>
          </div>
          
          <button @click="proceedToLaunch" class="proceed-btn">
            确认价格，开始发布会
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useGameState } from '../../composables/useGameState'
import { useAI } from '../../composables/useAI'
import { useAnimations } from '../../composables/useAnimations'

const { gameState, addMessage, selectedFeaturesCount, totalCost, setScene } = useGameState()
const { chatWithLeiJun, loading } = useAI()
const { sceneTransition, typeWriter } = useAnimations()

const messagesContainer = ref<HTMLElement>()
const userMessage = ref('')
const isLeiJunTyping = ref(false)
const typingMessageId = ref('')

const suggestedResponses = ref([
  '我觉得价格应该更亲民一些',
  '这个价格在市场上有竞争力吗？',
  '能详细分析一下成本构成吗？',
  '用户会接受这个价格吗？'
])

const profitMargin = computed(() => {
  if (gameState.suggestedPrice === 0 || totalCost.value === 0) return 0
  return Math.round(((gameState.suggestedPrice - totalCost.value) / gameState.suggestedPrice) * 100)
})

const marketPosition = computed(() => {
  if (gameState.suggestedPrice < 2000) return '入门级'
  if (gameState.suggestedPrice < 4000) return '中端'
  if (gameState.suggestedPrice < 6000) return '高端'
  return '旗舰级'
})

const initializeChat = () => {
  const welcomeMessage = {
    role: 'lei-jun' as const,
    content: `${gameState.playerName}，你好！我是雷军。听说你为${gameState.productName}选择了${selectedFeaturesCount.value}个很棒的功能特性：${gameState.selectedFeatures.map(f => f.title).join('、')}。现在我们来讨论一下定价策略，你有什么想法？`,
    emotion: 'excited' as const
  }
  
  addMessage(welcomeMessage)
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  
  const message = userMessage.value
  userMessage.value = ''
  
  // 添加用户消息
  addMessage({
    role: 'user',
    content: message
  })
  
  // 显示雷军正在输入
  isLeiJunTyping.value = true
  await scrollToBottom()
  
  // 调用AI获取回复
  const context = {
    productName: gameState.productName,
    selectedFeatures: gameState.selectedFeatures,
    totalCost: totalCost.value
  }
  
  const response = await chatWithLeiJun(message, context)
  isLeiJunTyping.value = false
  
  if (response) {
    const leiJunMessage = {
      role: 'lei-jun' as const,
      content: response,
      emotion: detectEmotion(response)
    }
    
    addMessage(leiJunMessage)
    
    // 尝试提取价格建议
    extractPriceSuggestion(response)
    
    // 更新建议回复
    updateSuggestedResponses(response)
  }
  
  await scrollToBottom()
}

const sendSuggestedMessage = (suggestion: string) => {
  userMessage.value = suggestion
  sendMessage()
}

const extractPriceSuggestion = (response: string) => {
  const priceRegex = /(\d+)元|(\d+)块|(\d+)万/g
  const matches = [...response.matchAll(priceRegex)]
  
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1]
    if (lastMatch) {
      let price = parseInt(lastMatch[1] || lastMatch[2] || lastMatch[3] || '0')
      
      if (lastMatch[3]) {
        price = price * 10000
      }
      
      if (price > 0 && price < 50000) {
        gameState.suggestedPrice = price
      }
    }
  }
}

const detectEmotion = (text: string): 'happy' | 'concerned' | 'excited' | 'serious' => {
  if (text.includes('哈哈') || text.includes('😄') || text.includes('不错')) return 'happy'
  if (text.includes('担心') || text.includes('风险') || text.includes('困难')) return 'concerned'
  if (text.includes('激动') || text.includes('太棒了') || text.includes('完美')) return 'excited'
  return 'serious'
}

const updateSuggestedResponses = (response: string) => {
  const responses = []
  
  if (response.includes('价格')) {
    responses.push('能再便宜一点吗？', '这个价格用户能接受吗？')
  }
  
  if (response.includes('成本')) {
    responses.push('有没有降低成本的方法？', '成本控制很重要')
  }
  
  if (response.includes('竞争')) {
    responses.push('竞争对手的价格如何？', '我们的优势在哪里？')
  }
  
  if (responses.length === 0) {
    responses.push('我同意你的观点', '还有其他考虑因素吗？', '让我们确定最终价格')
  }
  
  suggestedResponses.value = responses.slice(0, 3)
}

const getEmotionEmoji = (emotion: string) => {
  const emotions = {
    happy: '😊',
    concerned: '🤔',
    excited: '🚀',
    serious: '💼'
  }
  return emotions[emotion as keyof typeof emotions] || '💬'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const proceedToLaunch = async () => {
  gameState.finalPrice = gameState.suggestedPrice
  await sceneTransition('ceo-office', 'launch-stage')
  setScene('launch-stage')
}

// 监听消息变化，自动滚动
watch(() => gameState.chatHistory.length, () => {
  scrollToBottom()
})

onMounted(() => {
  initializeChat()
})
</script>

<style scoped>
.ceo-office-scene {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  position: relative;
  overflow: hidden;
}

.office-environment {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.office-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.window-view {
  position: absolute;
  top: 10%;
  right: 5%;
  width: 200px;
  height: 150px;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
  border-radius: 10px;
  border: 3px solid #8B4513;
}

.desk {
  position: absolute;
  bottom: 20%;
  left: 10%;
  width: 300px;
  height: 100px;
  background: #8B4513;
  border-radius: 10px;
}

.chair {
  position: absolute;
  bottom: 15%;
  left: 15%;
  width: 60px;
  height: 120px;
  background: #2F4F4F;
  border-radius: 30px 30px 10px 10px;
}

.bookshelf {
  position: absolute;
  top: 20%;
  left: 5%;
  width: 100px;
  height: 200px;
  background: #654321;
  border-radius: 5px;
}

.chat-interface {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.lei-jun-avatar {
  position: relative;
  margin-right: 1rem;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid white;
  background: linear-gradient(135deg, #ff6900, #ff8533);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background: #4CAF50;
}

.chat-info {
  flex: 1;
}

.chat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
}

.status-text {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.product-context {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.features-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
  gap: 0.75rem;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.lei-jun-icon, .user-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.lei-jun-icon {
  background: linear-gradient(135deg, #ff6900, #ff8533);
}

.user-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.message-content {
  max-width: 70%;
  background: white;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-user .message-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sender-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-text {
  line-height: 1.5;
  font-size: 0.95rem;
}

.message-text.typing {
  opacity: 0.7;
  font-style: italic;
}

.emotion-indicator {
  position: absolute;
  bottom: -10px;
  right: 10px;
  font-size: 1.2rem;
}

.typing-indicator .message-content {
  padding: 1rem;
}

.typing-animation {
  display: flex;
  gap: 0.25rem;
}

.typing-animation span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input-area {
  padding: 1rem;
  background: white;
  border-radius: 0 0 20px 20px;
}

.suggested-responses {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.suggestion-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.send-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  font-size: 1.1rem;
}

.price-suggestion-panel {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  min-width: 280px;
  animation: slideInUp 0.5s ease-out;
}

.price-display h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
  text-align: center;
}

.price-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.analysis-item .label {
  color: #666;
}

.analysis-item .value {
  font-weight: 600;
  color: #333;
}

.proceed-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.proceed-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .chat-interface {
    width: 95%;
    height: 90vh;
  }
  
  .chat-header {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .product-context {
    align-items: flex-start;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .price-suggestion-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    margin: 0;
  }
}
</style>