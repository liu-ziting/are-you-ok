<script setup lang="ts">
import { computed } from 'vue'
import { useGameState } from './composables/useGameState'

// 导入场景组件
import IntroScene from './components/scenes/IntroScene.vue'
import PlanningScene from './components/scenes/PlanningScene.vue'
import CEOOfficeScene from './components/scenes/CEOOfficeScene.vue'
// import LaunchStageScene from './components/scenes/LaunchStageScene.vue'
// import BoardRoomScene from './components/scenes/BoardRoomScene.vue'
// import SocialMediaScene from './components/scenes/SocialMediaScene.vue'
// import ResultsScene from './components/scenes/ResultsScene.vue'

const { gameState } = useGameState()

// 场景映射
const sceneComponents = {
  intro: IntroScene,
  planning: PlanningScene,
  'ceo-office': CEOOfficeScene,
  // 'launch-stage': LaunchStageScene,
  // 'board-room': BoardRoomScene,
  // 'social-media': SocialMediaScene,
  // results: ResultsScene
} as const

const currentSceneComponent = computed(() => {
  return sceneComponents[gameState.currentScene as keyof typeof sceneComponents] || IntroScene
})
</script>

<template>
  <div class="xiaomi-pricing-simulator">
    <!-- 动态场景渲染 -->
    <component :is="currentSceneComponent" />
    
    <!-- 全局加载指示器 -->
    <div v-if="false" class="global-loading">
      <div class="loading-content">
        <div class="xiaomi-loader">
          <div class="loader-ring"></div>
          <div class="loader-text">MI</div>
        </div>
        <p>正在加载...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xiaomi-pricing-simulator {
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.xiaomi-loader {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.loader-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 105, 0, 0.3);
  border-top: 4px solid #ff6900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 900;
  color: #ff6900;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

