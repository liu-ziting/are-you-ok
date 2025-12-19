import { ref } from 'vue'
import type { ChatMessage, AIResponse } from '../types'

const API_URL = 'https://liuziting.dpdns.org/?target=https://api.xiaomimimo.com/v1/chat/completions'
const API_KEY = 'Bearer sk-c6to94t7q8zvd2f3f9rdrzsegb7dj37lg3du6e0rapwkmp5b'

export function useAI() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const callAI = async (messages: ChatMessage[], jsonMode = false): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: API_KEY
        },
        body: JSON.stringify({
          model: 'mimo-v2-flash',
          messages: messages.map(msg => ({
            role: msg.role === 'lei-jun' ? 'assistant' : msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          response_format: jsonMode ? { type: 'json_object' } : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('AI API Error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 生成产品功能
  const generateFeatures = async (productName: string) => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `你是小米产品专家。为${productName}生成8个创新功能特性，每个特性包含标题、描述、市场吸引力(1-10)、成本估算(元)、分类。返回JSON格式：
        {
          "features": [
            {
              "id": "unique_id",
              "title": "功能名称",
              "description": "详细描述",
              "marketAppeal": 8,
              "cost": 500,
              "category": "performance|design|camera|battery|ai|connectivity",
              "icon": "🚀"
            }
          ]
        }`,
        timestamp: Date.now()
      },
      {
        id: '2',
        role: 'user',
        content: `请为${productName}生成产品功能特性`,
        timestamp: Date.now()
      }
    ]

    return await callAI(messages, true)
  }

  // 雷军对话
  const chatWithLeiJun = async (userMessage: string, context: any) => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `你是雷军，小米创始人。现在在讨论${context.productName}的定价策略。
        产品特性：${context.selectedFeatures.map((f: any) => f.title).join('、')}
        
        请用雷军的语气回复，要体现：
        1. 对产品的热情和自豪
        2. 对用户的关怀
        3. 商业敏锐度
        4. 适当的幽默感
        
        如果讨论到具体价格，要考虑成本、市场定位、竞争对手等因素。`,
        timestamp: Date.now()
      },
      {
        id: '2',
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      }
    ]

    return await callAI(messages)
  }

  // 生成市场反应
  const generateMarketReactions = async (productName: string, price: number, features: any[]) => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `生成${productName}(价格${price}元)发布后的市场反应，包括用户评价、媒体报道、竞争对手反应。
        产品特性：${features.map(f => f.title).join('、')}
        
        返回JSON格式：
        {
          "reactions": [
            {
              "type": "positive|negative|competitor|media",
              "platform": "微博|知乎|抖音|科技媒体",
              "author": "用户名或媒体名",
              "content": "评价内容",
              "likes": 随机点赞数,
              "influence": 1-10影响力评分
            }
          ]
        }`,
        timestamp: Date.now()
      },
      {
        id: '2',
        role: 'user',
        content: '生成15条不同类型的市场反应',
        timestamp: Date.now()
      }
    ]

    return await callAI(messages, true)
  }

  // 生成销量预测
  const generateSalesPrediction = async (productName: string, price: number, marketReactions: any[]) => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `作为市场分析专家，基于${productName}的定价${price}元和市场反应，预测销量表现。
        
        市场反应摘要：${marketReactions.slice(0, 5).map(r => r.content).join('；')}
        
        返回JSON格式：
        {
          "prediction": {
            "firstDaySales": 首日销量,
            "monthSales": 月销量,
            "yearSales": 年销量,
            "marketShare": 市场份额百分比,
            "profitMargin": 利润率百分比,
            "riskFactors": ["风险因素1", "风险因素2"]
          }
        }`,
        timestamp: Date.now()
      },
      {
        id: '2',
        role: 'user',
        content: '请进行详细的销量预测分析',
        timestamp: Date.now()
      }
    ]

    return await callAI(messages, true)
  }

  // 高管说服对话
  const persuadeExecutives = async (currentPrice: number, newPrice: number, reasoning: string) => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `你是小米高管团队，用户想要调整产品价格从${currentPrice}元到${newPrice}元。
        
        请模拟高管的反应，考虑：
        1. 成本控制
        2. 市场竞争
        3. 品牌定位
        4. 利润目标
        
        可能同意也可能拒绝，给出具体理由。`,
        timestamp: Date.now()
      },
      {
        id: '2',
        role: 'user',
        content: `调价理由：${reasoning}`,
        timestamp: Date.now()
      }
    ]

    return await callAI(messages)
  }

  return {
    loading,
    error,
    callAI,
    generateFeatures,
    chatWithLeiJun,
    generateMarketReactions,
    generateSalesPrediction,
    persuadeExecutives
  }
}