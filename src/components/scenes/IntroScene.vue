<template>
  <div class="intro-scene">
    <div class="intro-background">
      <div class="xiaomi-logo">
        <div class="logo-animation">
          <span class="mi-text">MI</span>
          <div class="logo-particles"></div>
        </div>
      </div>
      
      <div class="intro-content" :class="{ 'show': showContent }">
        <h1 class="game-title">小米定价模拟器</h1>
        <p class="game-subtitle">体验真实的产品定价决策过程</p>
        
        <div class="player-setup">
          <div class="input-group">
            <label>你的名字</label>
            <input 
              v-model="playerName" 
              type="text" 
              placeholder="输入你的名字"
              class="player-input"
              @keyup.enter="startGame"
            >
          </div>
          
          <div class="role-description">
            <div class="role-card">
              <div class="role-icon">👨‍💼</div>
              <h3>产品经理</h3>
              <p>你将扮演小米产品经理，负责新产品的定价策略制定</p>
            </div>
          </div>
          
          <button 
            @click="startGame" 
            :disabled="!playerName.trim()"
            class="start-button"
          >
            <span>开始游戏</span>
            <div class="button-glow"></div>
          </button>
        </div>
        
        <div class="game-features">
          <div class="feature-item" v-for="(feature, index) in gameFeatures" :key="index">
            <div class="feature-icon">{{ feature.icon }}</div>
            <span>{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="background-elements">
      <div class="floating-element" v-for="i in 6" :key="i" :style="getFloatingStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameState } from '../../composables/useGameState'
import { useAnimations } from '../../composables/useAnimations'

const { gameState, setScene } = useGameState()
const { sceneTransition } = useAnimations()

const playerName = ref('')
const showContent = ref(false)

const gameFeatures = [
  { icon: '🎯', text: '真实商业决策' },
  { icon: '🤖', text: 'AI驱动对话' },
  { icon: '📊', text: '数据可视化' },
  { icon: '🎮', text: '沉浸式体验' }
]

const startGame = async () => {
  if (!playerName.value.trim()) return
  
  gameState.playerName = playerName.value
  await sceneTransition('intro', 'planning')
  setScene('planning')
}

const getFloatingStyle = (index: number) => {
  const delay = index * 0.5
  const duration = 3 + Math.random() * 2
  return {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    left: `${10 + index * 15}%`,
    top: `${20 + Math.random() * 60}%`
  }
}

onMounted(() => {
  setTimeout(() => {
    showContent.value = true
  }, 1000)
})
</script>

<style scoped>
.intro-scene {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.intro-background {
  text-align: center;
  z-index: 2;
  position: relative;
}

.xiaomi-logo {
  margin-bottom: 3rem;
}

.logo-animation {
  position: relative;
  display: inline-block;
}

.mi-text {
  font-size: 4rem;
  font-weight: 900;
  color: #ff6900;
  text-shadow: 0 0 30px rgba(255, 105, 0, 0.5);
  animation: logoGlow 2s ease-in-out infinite alternate;
}

.logo-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.logo-particles::before,
.logo-particles::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6900;
  border-radius: 50%;
  animation: particleFloat 3s ease-in-out infinite;
}

.logo-particles::before {
  top: -20px;
  left: -30px;
  animation-delay: 0s;
}

.logo-particles::after {
  bottom: -20px;
  right: -30px;
  animation-delay: 1.5s;
}

.intro-content {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s ease-out;
}

.intro-content.show {
  opacity: 1;
  transform: translateY(0);
}

.game-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.game-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.player-setup {
  max-width: 400px;
  margin: 0 auto 3rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.player-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.player-input:focus {
  outline: none;
  border-color: #ff6900;
  box-shadow: 0 0 20px rgba(255, 105, 0, 0.3);
}

.player-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.role-description {
  margin-bottom: 2rem;
}

.role-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.role-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.role-card h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.role-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.start-button {
  position: relative;
  background: linear-gradient(135deg, #ff6900, #ff8533);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 200px;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 105, 0, 0.4);
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.start-button:hover .button-glow {
  left: 100%;
}

.game-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.feature-icon {
  font-size: 1.2rem;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 105, 0, 0.1);
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

@keyframes logoGlow {
  0% { text-shadow: 0 0 30px rgba(255, 105, 0, 0.5); }
  100% { text-shadow: 0 0 50px rgba(255, 105, 0, 0.8), 0 0 70px rgba(255, 105, 0, 0.3); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@media (max-width: 768px) {
  .game-title {
    font-size: 2rem;
  }
  
  .mi-text {
    font-size: 3rem;
  }
  
  .game-features {
    grid-template-columns: 1fr;
  }
}
</style>