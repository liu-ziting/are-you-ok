<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

// --- 类型定义 ---
type Stage = 'START' | 'SETUP' | 'MEETING' | 'LAUNCH' | 'SIMULATION' | 'RESULT'

interface Product {
    name: string
    positioning: string
    features: string[]
}

interface Message {
    role: 'leijun' | 'user' | 'system'
    content: string
}

interface Danmaku {
    id: number
    text: string
    top: number
    speed: number
    color: string
}

interface Strategy {
    id: string
    name: string
    cost: number
    desc: string
    effect: string
}

interface MarketResult {
    sales: number
    profit: number
    headlines: string[]
    competitorAction: string
    leijunComment: string
    hotSearches: string[]
    score: number
}

// --- 常量配置 ---
const BOM_COST = 3500

const API_URL = 'https://liuziting.dpdns.org/?target=https://api.xiaomimimo.com/v1/chat/completions'
const API_KEY = 'Bearer sk-c6to94t7q8zvd2f3f9rdrzsegb7dj37lg3du6e0rapwkmp5b'

const STRATEGIES: Strategy[] = [
    { id: 'VALUE', name: '极致性价比', cost: 500000000, desc: '回归初心，硬件利润率不超5%', effect: '销量爆棚，品牌热度极高' },
    { id: 'PREMIUM', name: '冲击高端', cost: 1000000000, desc: '顶级影像+陶瓷机身，不惜成本', effect: '单机利润高，提升品牌形象' },
    { id: 'AI_IOT', name: 'AIoT 生态联动', cost: 700000000, desc: '买手机送手环，深度融合 HyperOS', effect: '增强用户粘性，全家桶销量提升' }
]

const FEATURES_LIST = ['徕卡光学镜头', '自研澎湃芯片', '卫星通信', '陶瓷机身', '龙晶玻璃', '150W快充']

// --- 游戏状态 ---
const currentStage = ref<Stage>('START')
const product = reactive<Product>({
    name: '小米17',
    positioning: '高端旗舰',
    features: []
})

const selectedPrice = ref(4999)
const selectedStrategy = ref<Strategy>(STRATEGIES[0])
const isAiThinking = ref(false)

const chatMessages = ref<Message[]>([])
const userChatInput = ref('')
const chatScroll = ref<HTMLElement | null>(null)
const danmakus = ref<Danmaku[]>([])
let danmakuId = 0

const result = reactive<MarketResult>({
    sales: 0,
    profit: 0,
    headlines: [],
    competitorAction: '',
    leijunComment: '',
    hotSearches: [],
    score: 0
})

// --- 核心逻辑 ---

async function callAI(messages: Message[], jsonMode = false) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
            body: JSON.stringify({
                model: 'mimo-v2-flash',
                messages: messages.map(m => ({ role: m.role === 'leijun' ? 'assistant' : m.role, content: m.content })),
                temperature: 0.7,
                response_format: jsonMode ? { type: 'json_object' } : undefined
            })
        })
        const data = await response.json()
        return data.choices[0].message.content
    } catch (error) {
        console.error('AI API Error:', error)
        return null
    }
}

// 弹幕系统
function addDanmaku(text: string) {
    const id = danmakuId++
    const colors = ['#fff', '#ff6700', '#00f2fe', '#ffd700', '#ff4d4f']
    const danmaku = {
        id,
        text,
        top: Math.random() * 60 + 5, // 5% to 65% height
        speed: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)]
    }
    danmakus.value.push(danmaku)
    setTimeout(() => {
        danmakus.value = danmakus.value.filter(d => d.id !== id)
    }, 15000)
}

// 监听定价变化生成弹幕
let lastPriceCall = 0
watch(selectedPrice, async newPrice => {
    const now = Date.now()
    if (now - lastPriceCall < 2000) return
    lastPriceCall = now

    const prompt = `玩家正在发布会现场滑动手指定价滑块，当前定价：${newPrice}元（成本${BOM_COST}元）。
    产品名称：${product.name}，定位：${product.positioning}。
    请模拟3条此时直播间观众的实时弹幕，要口语化、有梗、真实。
    只返回JSON数组：["弹幕1", "弹幕2", "弹幕3"]`

    const res = await callAI([{ role: 'system', content: prompt }], true)
    if (res) {
        try {
            const list = JSON.parse(res)
            list.forEach((t: string) => addDanmaku(t))
        } catch (e) {}
    }
})

// 游戏流程控制
function startSetup() {
    currentStage.value = 'SETUP'
}

function toggleFeature(feature: string) {
    const index = product.features.indexOf(feature)
    if (index === -1) {
        if (product.features.length < 3) product.features.push(feature)
    } else {
        product.features.splice(index, 1)
    }
}

async function startMeeting() {
    if (!product.name || !product.positioning) {
        alert('请先完善产品信息')
        return
    }
    currentStage.value = 'MEETING'
    isAiThinking.value = true

    const initialPrompt = `我是市场总监，现在正在跟你（雷军）汇报我们的新产品。
    产品名称：${product.name}
    定位：${product.positioning}
    核心卖点：${product.features.join(', ')}
    
    请作为雷军开始对话，评价一下这个产品定义，并询问我打算怎么定价。`

    const res = await callAI([{ role: 'user', content: initialPrompt }])
    if (res) {
        chatMessages.value = [{ role: 'leijun', content: res }]
    }
    isAiThinking.value = false
}

async function handleChat() {
    if (!userChatInput.value.trim() || isAiThinking.value) return
    const input = userChatInput.value
    chatMessages.value.push({ role: 'user', content: input })
    userChatInput.value = ''
    isAiThinking.value = true

    const aiRes = await callAI([
        { role: 'system', content: '你是雷军，正在和市场总监讨论新手机的发布。语气要亲切、有远见、偶尔用点金句（如底层逻辑、Are you ok、交个朋友）。' },
        ...chatMessages.value
    ])

    if (aiRes) {
        chatMessages.value.push({ role: 'leijun', content: aiRes })
        setTimeout(() => {
            if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight
        }, 100)
    }
    isAiThinking.value = false
}

function startLaunch() {
    currentStage.value = 'LAUNCH'
}

async function runSimulation() {
    currentStage.value = 'SIMULATION'
    isAiThinking.value = true

    // 计算逻辑
    const price = selectedPrice.value
    const strategy = selectedStrategy.value

    let baseSales = 5000000
    const priceDiff = 4999 - price
    baseSales += (priceDiff / 100) * 300000

    let salesMod = 1.0
    if (strategy.id === 'VALUE') salesMod = 1.5
    else if (strategy.id === 'PREMIUM') salesMod = 0.7
    else salesMod = 1.1

    const finalSales = Math.max(500000, Math.floor(baseSales * salesMod))
    const finalProfit = finalSales * (price - BOM_COST) - strategy.cost

    // AI 模拟
    const prompt = `
    模拟${product.name}发布后的市场反应。
    定位：${product.positioning}
    定价：${price}元（成本：${BOM_COST}元）
    策略：${strategy.name}
    销量：${finalSales}
    利润：${finalProfit}
    
    请生成：
    1. 3条媒体头条
    2. 3条微博热搜
    3. 竞争对手（Apple, Huawei）的反应
    4. 雷总的最终总结点评（Are you OK? 语气）
    5. 给这次操盘打个分 (0-100)
    
    返回 JSON:
    {
        "headlines": [],
        "hotSearches": [],
        "competitorAction": "",
        "leijunComment": "",
        "score": 85
    }`

    const res = await callAI([{ role: 'system', content: prompt }], true)
    if (res) {
        try {
            const data = JSON.parse(res)
            Object.assign(result, data)
            result.sales = finalSales
            result.profit = finalProfit
        } catch (e) {}
    }

    isAiThinking.value = false
    currentStage.value = 'RESULT'
}

function formatMoney(n: number) {
    if (Math.abs(n) > 100000000) return (n / 100000000).toFixed(2) + ' 亿元'
    return (n / 10000).toFixed(2) + ' 万元'
}

const finalRank = computed(() => {
    if (result.score >= 90) return { title: '传奇CEO接班人', desc: '雷总：小米有你，我放心。' }
    if (result.score >= 70) return { title: '王牌市场操盘手', desc: '产品大卖，高端成了！' }
    return { title: 'Are you OK?', desc: '雷总：我们要回归底层逻辑。' }
})
</script>

<template>
    <div class="launch-event-container">
        <!-- 背景装饰 -->
        <div class="stage-lighting"></div>

        <!-- 顶部 HUD -->
        <div v-if="currentStage !== 'START' && currentStage !== 'RESULT'" class="event-hud">
            <div class="hud-group">
                <span class="hud-label">PRODUCT</span>
                <span class="hud-value">{{ product.name || '未命名' }}</span>
            </div>
            <div class="hud-group">
                <span class="hud-label">POSITIONING</span>
                <span class="hud-value">{{ product.positioning }}</span>
            </div>
        </div>

        <!-- 弹幕层 -->
        <div class="danmaku-layer">
            <div v-for="d in danmakus" :key="d.id" class="danmaku-item" :style="{ top: d.top + '%', color: d.color, animationDuration: d.speed + 's' }">
                {{ d.text }}
            </div>
        </div>

        <!-- 场景渲染 -->
        <main class="scene-main">
            <!-- 阶段 0: 开始 -->
            <div v-if="currentStage === 'START'" class="scene-start">
                <div class="glow-mi">MI</div>
                <h1 class="title-main">XIAOMI 17</h1>
                <h2 class="title-sub">小米17 定价操盘模拟器</h2>
                <button class="btn-primary" @click="startSetup">开始操盘</button>
            </div>

            <!-- 阶段 1: 产品定义 -->
            <div v-if="currentStage === 'SETUP'" class="scene-setup">
                <div class="setup-card">
                    <h2>第一步：定义你的产品</h2>
                    <div class="form-group">
                        <label>产品名称</label>
                        <input v-model="product.name" placeholder="例如：小米17 Ultra" />
                    </div>
                    <div class="form-group">
                        <label>产品定位</label>
                        <select v-model="product.positioning">
                            <option>高端旗舰</option>
                            <option>性能小钢炮</option>
                            <option>大众走量款</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>核心卖点 (最多选3个)</label>
                        <div class="feature-tags">
                            <span v-for="f in FEATURES_LIST" :key="f" :class="{ active: product.features.includes(f) }" @click="toggleFeature(f)">
                                {{ f }}
                            </span>
                        </div>
                    </div>
                    <button class="btn-primary" @click="startMeeting">下一步：汇报给雷总</button>
                </div>
            </div>

            <!-- 阶段 2: 闭门会议 (Chat) -->
            <div v-if="currentStage === 'MEETING'" class="scene-meeting">
                <div class="meeting-header">
                    <div class="leijun-avatar">雷</div>
                    <div class="meeting-title">
                        <h3>闭门会议：与雷总的深度对话</h3>
                        <p>讨论你的产品逻辑，说服雷总支持你的方案</p>
                    </div>
                </div>
                <div class="chat-window" ref="chatScroll">
                    <div v-for="(msg, i) in chatMessages" :key="i" :class="['msg-wrap', msg.role]">
                        <div class="msg-content">{{ msg.content }}</div>
                    </div>
                    <div v-if="isAiThinking" class="msg-wrap leijun typing">雷总正在思考底层逻辑...</div>
                </div>
                <div class="chat-input-area">
                    <input v-model="userChatInput" @keyup.enter="handleChat" placeholder="输入你的想法..." />
                    <button @click="handleChat" :disabled="isAiThinking">发送</button>
                    <button class="btn-next" @click="startLaunch">去发布会现场</button>
                </div>
            </div>

            <!-- 阶段 3: 发布会定价 (Launch) -->
            <div v-if="currentStage === 'LAUNCH'" class="scene-decision">
                <div class="launch-stage">
                    <div class="presentation-screen">
                        <div class="product-render">
                            <div class="phone-mock">📱</div>
                            <div class="price-callout">
                                <span class="label">FINAL PRICE</span>
                                <span class="value">¥{{ selectedPrice }}</span>
                            </div>
                        </div>
                        <div class="strategy-banner">
                            <span class="tag">STRATEGY</span>
                            <span class="text">{{ selectedStrategy.name }}</span>
                        </div>
                    </div>

                    <div class="control-pod">
                        <div class="pod-section">
                            <label>设定最终定价 (BOM成本: ¥{{ BOM_COST }})</label>
                            <input type="range" v-model="selectedPrice" min="1999" max="9999" step="100" />
                            <div class="price-hints">
                                <span>交个朋友</span>
                                <span>稳健</span>
                                <span>冲击高端</span>
                            </div>
                        </div>
                        <div class="pod-section">
                            <label>选择发布策略</label>
                            <div class="strategy-options">
                                <button v-for="s in STRATEGIES" :key="s.id" :class="{ active: selectedStrategy.id === s.id }" @click="selectedStrategy = s">
                                    {{ s.name }}
                                </button>
                            </div>
                        </div>
                        <button class="btn-launch" @click="runSimulation">召开发布会！</button>
                    </div>
                </div>
            </div>

            <!-- 阶段 4: 模拟中 -->
            <div v-if="currentStage === 'SIMULATION'" class="scene-simulation">
                <div class="sim-vfx">
                    <div class="orbit"></div>
                    <div class="orbit"></div>
                    <div class="core-logo">MI</div>
                </div>
                <h2>正在模拟全网真实反应...</h2>
            </div>

            <!-- 阶段 5: 结果 -->
            <div v-if="currentStage === 'RESULT'" class="scene-feedback">
                <div class="feedback-layout">
                    <div class="final-score-badge">
                        操盘评分：<span>{{ result.score }}</span>
                    </div>

                    <div class="results-panel">
                        <div class="res-card">
                            <label>预估销量</label>
                            <div class="val">{{ (result.sales / 10000).toFixed(0) }}w</div>
                        </div>
                        <div class="res-card">
                            <label>预估利润</label>
                            <div class="val">¥{{ formatMoney(result.profit) }}</div>
                        </div>
                    </div>

                    <div class="social-impact">
                        <div class="hot-search-list">
                            <div class="hot-header">🔥 微博热搜</div>
                            <div v-for="(h, i) in result.hotSearches" :key="i" class="hot-item">
                                <span class="rank">{{ i + 1 }}</span> {{ h }}
                            </div>
                        </div>
                        <div class="leijun-talk">
                            <div class="avatar">雷</div>
                            <div class="talk-body">
                                <h4>雷总结案陈词</h4>
                                <p>{{ result.leijunComment }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="ending-rank">
                        <h3>{{ finalRank.title }}</h3>
                        <p>{{ finalRank.desc }}</p>
                    </div>

                    <button class="btn-primary" @click="startSetup">重新操盘</button>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.launch-event-container {
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, #1a1a2e 0%, #000 100%);
    color: #fff;
    overflow: hidden;
    position: relative;
    font-family: 'Inter', 'PingFang SC', sans-serif;
}

.stage-lighting {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(255, 103, 0, 0.05) 0%, transparent 100%);
    pointer-events: none;
}

/* HUD */
.event-hud {
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    z-index: 100;
}

.hud-group {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.hud-label {
    display: block;
    font-size: 0.6rem;
    color: #888;
    letter-spacing: 1px;
}
.hud-value {
    font-size: 1.1rem;
    font-weight: bold;
    color: #ff6700;
}
.hud-value.negative {
    color: #ff4d4f;
}
.hud-bar {
    width: 100px;
    height: 4px;
    background: #333;
    margin-top: 5px;
    border-radius: 2px;
}
.hud-bar .fill {
    height: 100%;
    background: #ff6700;
    border-radius: 2px;
    transition: width 0.5s;
}

/* 弹幕层 */
.danmaku-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
}

.danmaku-item {
    position: absolute;
    white-space: nowrap;
    font-weight: bold;
    font-size: 1.2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    animation: danmaku-move linear forwards;
    left: 100%;
}

@keyframes danmaku-move {
    from {
        left: 100%;
    }
    to {
        left: -100%;
    }
}

/* Scene Layouts */
.scene-main {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Start Scene */
.scene-start {
    text-align: center;
}
.glow-mi {
    width: 100px;
    height: 100px;
    background: #ff6700;
    border-radius: 24px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    box-shadow: 0 0 50px rgba(255, 103, 0, 0.5);
}
.title-main {
    font-size: 4rem;
    margin: 0;
    letter-spacing: 4px;
}
.title-sub {
    font-size: 1rem;
    color: #888;
    margin: 10px 0 40px;
}

/* Setup Scene */
.scene-setup {
    width: 600px;
}
.setup-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 40px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.form-group {
    margin-bottom: 25px;
}
.form-group label {
    display: block;
    margin-bottom: 10px;
    color: #888;
}
.form-group input,
.form-group select {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px;
    border-radius: 12px;
    color: #fff;
}
.feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.feature-tags span {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: 0.3s;
}
.feature-tags span.active {
    background: #ff6700;
    color: #fff;
}

/* Meeting Scene */
.scene-meeting {
    width: 800px;
    height: 600px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    padding: 20px;
}
.meeting-header {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 20px;
}
.leijun-avatar {
    width: 50px;
    height: 50px;
    background: #ff6700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}
.chat-window {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px;
    margin-bottom: 20px;
}
.msg-wrap {
    max-width: 80%;
    padding: 12px 18px;
    border-radius: 18px;
    line-height: 1.5;
}
.msg-wrap.leijun {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 4px;
}
.msg-wrap.user {
    align-self: flex-end;
    background: #ff6700;
    border-bottom-right-radius: 4px;
}
.chat-input-area {
    display: flex;
    gap: 10px;
}
.chat-input-area input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px;
    color: #fff;
}

/* Decision Scene */
.scene-decision {
    width: 1000px;
}
.launch-stage {
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.presentation-screen {
    height: 400px;
    background: #000;
    border-radius: 20px;
    border: 4px solid #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.presentation-screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255, 103, 0, 0.1) 0%, transparent 100%);
}
.phone-mock {
    font-size: 8rem;
    margin-bottom: 20px;
}
.price-callout {
    text-align: center;
}
.price-callout .label {
    display: block;
    font-size: 0.8rem;
    color: #ff6700;
}
.price-callout .value {
    font-size: 4rem;
    font-weight: bold;
}
.strategy-banner {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
}
.strategy-banner .tag {
    background: #ff6700;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
}

.control-pod {
    background: rgba(255, 255, 255, 0.05);
    padding: 30px;
    border-radius: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 40px;
    align-items: center;
}
.pod-section label {
    display: block;
    margin-bottom: 15px;
    color: #888;
    font-size: 0.9rem;
}
.strategy-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}
.strategy-options button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: 0.3s;
}
.strategy-options button.active {
    background: #ff6700;
}
.btn-launch {
    padding: 20px 40px;
    background: #ff6700;
    border: none;
    border-radius: 16px;
    color: #fff;
    font-weight: bold;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(255, 103, 0, 0.3);
}

/* Feedback Scene */
.scene-feedback {
    width: 900px;
}
.feedback-layout {
    display: flex;
    flex-direction: column;
    gap: 30px;
    align-items: center;
}
.final-score-badge {
    font-size: 1.5rem;
    color: #888;
}
.final-score-badge span {
    font-size: 4rem;
    font-weight: bold;
    color: #ff6700;
    text-shadow: 0 0 30px rgba(255, 103, 0, 0.5);
}
.ending-rank {
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 20px 60px;
    border-radius: 20px;
}
.ending-rank h3 {
    font-size: 2rem;
    color: #ff6700;
    margin: 0 0 10px 0;
}
.ending-rank p {
    margin: 0;
    color: #aaa;
}
.results-panel {
    display: flex;
    gap: 20px;
}
.res-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 16px;
    text-align: center;
}
.res-card .val {
    font-size: 2rem;
    font-weight: bold;
    color: #ff6700;
}
.social-impact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.hot-search-list {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 15px;
}
.hot-header {
    color: #ff4d4f;
    font-weight: bold;
    margin-bottom: 10px;
}
.hot-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
}
.hot-item .rank {
    color: #ff6700;
    margin-right: 10px;
    font-weight: bold;
}
.leijun-talk {
    display: flex;
    gap: 15px;
    background: rgba(255, 103, 0, 0.1);
    padding: 15px;
    border-radius: 16px;
    border: 1px solid rgba(255, 103, 0, 0.3);
}
.leijun-talk .avatar {
    width: 40px;
    height: 40px;
    background: #ff6700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
}
.talk-body h4 {
    margin: 0 0 5px 0;
    color: #ff6700;
}
.talk-body p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    font-style: italic;
}

/* Global Elements */
.btn-primary {
    padding: 15px 40px;
    background: #ff6700;
    border: none;
    border-radius: 30px;
    color: #fff;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;
    transition: 0.3s;
}
.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 103, 0, 0.4);
}

input[type='range'] {
    width: 100%;
    accent-color: #ff6700;
}
.price-hints {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #666;
    margin-top: 5px;
}

/* Typing animation */
.typing::after {
    content: '...';
    animation: typing 1.5s infinite;
}
@keyframes typing {
    0% {
        content: '';
    }
    33% {
        content: '.';
    }
    66% {
        content: '..';
    }
    100% {
        content: '...';
    }
}
</style>

