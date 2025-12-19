import { ref, nextTick } from 'vue'

export function useAnimations() {
  const isAnimating = ref(false)
  const currentAnimation = ref('')

  // 场景切换动画
  const sceneTransition = async (fromScene: string, toScene: string) => {
    isAnimating.value = true
    currentAnimation.value = 'scene-exit'
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    currentAnimation.value = 'scene-enter'
    await nextTick()
    
    setTimeout(() => {
      isAnimating.value = false
      currentAnimation.value = ''
    }, 300)
  }

  // 打字机效果
  const typeWriter = (text: string, element: HTMLElement, speed = 50) => {
    return new Promise<void>((resolve) => {
      element.textContent = ''
      let i = 0
      
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i)
          i++
        } else {
          clearInterval(timer)
          resolve()
        }
      }, speed)
    })
  }

  // 数字滚动动画
  const countUp = (start: number, end: number, element: HTMLElement, duration = 1000) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now()
      const range = end - start
      
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const current = Math.floor(start + range * easeOutQuart)
        
        element.textContent = current.toLocaleString()
        
        if (progress >= 1) {
          clearInterval(timer)
          element.textContent = end.toLocaleString()
          resolve()
        }
      }, 16) // 60fps
    })
  }

  // 卡片翻转动画
  const flipCard = (element: HTMLElement) => {
    return new Promise<void>((resolve) => {
      element.style.transform = 'rotateY(180deg)'
      setTimeout(() => {
        element.style.transform = 'rotateY(0deg)'
        resolve()
      }, 300)
    })
  }

  // 弹幕滚动动画
  const scrollDanmu = (element: HTMLElement, text: string, speed = 2) => {
    element.textContent = text
    element.style.transform = 'translateX(100%)'
    element.style.transition = `transform ${speed}s linear`
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(-100%)'
    })
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, speed * 1000)
    })
  }

  // 价格揭晓动画
  const priceReveal = async (element: HTMLElement, price: number) => {
    // 先隐藏
    element.style.opacity = '0'
    element.style.transform = 'scale(0.5)'
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 显示动画
    element.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    element.style.opacity = '1'
    element.style.transform = 'scale(1)'
    
    // 数字滚动
    await countUp(0, price, element, 1500)
    
    // 闪烁效果
    element.style.animation = 'pulse 0.5s ease-in-out 3'
  }

  // 粒子爆炸效果
  const particleExplosion = (container: HTMLElement, count = 20) => {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ff6900;
        border-radius: 50%;
        pointer-events: none;
        left: 50%;
        top: 50%;
      `
      
      container.appendChild(particle)
      
      const angle = (360 / count) * i
      const velocity = 100 + Math.random() * 100
      const lifetime = 1000 + Math.random() * 500
      
      particle.animate([
        {
          transform: 'translate(-50%, -50%) rotate(0deg) translateX(0px)',
          opacity: 1
        },
        {
          transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${velocity}px)`,
          opacity: 0
        }
      ], {
        duration: lifetime,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        particle.remove()
      }
    }
  }

  return {
    isAnimating,
    currentAnimation,
    sceneTransition,
    typeWriter,
    countUp,
    flipCard,
    scrollDanmu,
    priceReveal,
    particleExplosion
  }
}