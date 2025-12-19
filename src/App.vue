<script setup lang="ts">
import { ref } from 'vue'
import XiaomiPricingSimulator from './components/XiaomiPricingSimulator.vue'

// 游戏视图枚举
type GameView = 'SIMULATOR'

const currentView = ref<GameView>('SIMULATOR')
</script>

<template>
    <div class="app-container">
        <!-- 直接进入小米17定价模拟器 -->
        <XiaomiPricingSimulator v-if="currentView === 'SIMULATOR'" />
    </div>
</template>

<style>
:root {
    --bg-dark: #0f0c29;
    --accent-color: #ff6700; /* 小米橙 */
    --text-primary: #ffffff;
}

body {
    margin: 0;
    padding: 0;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    overflow: hidden;
}

.app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
</style>

