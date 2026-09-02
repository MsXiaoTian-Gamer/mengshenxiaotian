import { useEffect, useRef } from 'react'

const MESSAGES = [
  '今天也要加油~',
  '欢迎来看博客！',
  '有什么想看的吗？',
  'Unity 超好玩的！',
  '一起做游戏吧~',
  '记得休息眼睛哦',
  '代码敲累了吗？',
  'Bug 退散！',
  '今天写了几行代码？',
  '芜湖~',
]

const STORAGE = {
  x: 'mascot_x',
  y: 'mascot_y',
}

/** 可拖拽看板娘（保留位置记忆） */
export function Mascot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const body = bodyRef.current
    const bubble = bubbleRef.current
    if (!container || !body) return

    // 恢复保存位置
    const savedX = localStorage.getItem(STORAGE.x)
    const savedY = localStorage.getItem(STORAGE.y)
    if (savedX !== null && savedY !== null) {
      container.style.right = 'auto'
      container.style.bottom = 'auto'
      container.style.left = savedX + 'px'
      container.style.top = savedY + 'px'
    }

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    let dragging = false
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0
    let moved = 0

    const setDragging = (on: boolean) => {
      dragging = on
      if (on) {
        container.classList.add('dragging')
        container.style.transition = 'none'
      } else {
        container.classList.remove('dragging')
        container.style.transition = ''
      }
    }

    const onStart = (e: PointerEvent | TouchEvent) => {
      e.preventDefault()
      const pos = 'touches' in e ? e.touches[0] : e
      startX = pos.clientX
      startY = pos.clientY
      const rect = container.getBoundingClientRect()
      startLeft = rect.left
      startTop = rect.top
      moved = 0
      setDragging(true)
    }

    const onMove = (e: PointerEvent | TouchEvent) => {
      if (!dragging) return
      e.preventDefault()
      const pos = 'touches' in e ? e.touches[0] : e
      const dx = pos.clientX - startX
      const dy = pos.clientY - startY
      moved = Math.sqrt(dx * dx + dy * dy)
      const maxLeft = window.innerWidth - container.offsetWidth
      const maxTop = window.innerHeight - container.offsetHeight
      container.style.right = 'auto'
      container.style.bottom = 'auto'
      container.style.left = clamp(startLeft + dx, 0, maxLeft) + 'px'
      container.style.top = clamp(startTop + dy, 0, maxTop) + 'px'
    }

    const onEnd = () => {
      if (!dragging) return
      setDragging(false)
      if (moved < 5) {
        const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
        if (bubble) {
          bubble.textContent = msg
          bubble.classList.remove('show')
          void bubble.offsetWidth
          bubble.classList.add('show')
        }
      } else {
        try {
          localStorage.setItem(STORAGE.x, String(parseFloat(container.style.left) || 0))
          localStorage.setItem(STORAGE.y, String(parseFloat(container.style.top) || 0))
        } catch (e) {
          /* ignore */
        }
      }
    }

    body.addEventListener('pointerdown', onStart)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    body.addEventListener('touchstart', onStart as EventListener, { passive: false })
    body.addEventListener('touchmove', onMove as EventListener, { passive: false })
    body.addEventListener('touchend', onEnd)

    return () => {
      body.removeEventListener('pointerdown', onStart)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      body.removeEventListener('touchstart', onStart as EventListener)
      body.removeEventListener('touchmove', onMove as EventListener)
      body.removeEventListener('touchend', onEnd)
    }
  }, [])

  return (
    <div className="kawaii-mascot" id="mascot" ref={containerRef} aria-hidden="true">
      <div className="mascot-body" id="mascotBody" ref={bodyRef} title="点我试试~" aria-label="看板娘">
        <div className="mascot-tail left">
          <div className="mascot-tail-ribbon"></div>
        </div>
        <div className="mascot-tail right">
          <div className="mascot-tail-ribbon"></div>
        </div>
        <div className="mascot-head">
          <div className="mascot-bangs">
            <div className="mascot-bangs-notch"></div>
          </div>
          <div className="mascot-brow left"></div>
          <div className="mascot-brow right"></div>
          <div className="mascot-eye left">
            <div className="mascot-eye-hl"></div>
            <div className="mascot-eye-star"></div>
            <div className="mascot-eye-sparkle"></div>
            <div className="mascot-eye-sparkle2"></div>
          </div>
          <div className="mascot-eye right">
            <div className="mascot-eye-hl"></div>
            <div className="mascot-eye-star"></div>
            <div className="mascot-eye-sparkle"></div>
            <div className="mascot-eye-sparkle2"></div>
          </div>
          <div className="mascot-blush left"></div>
          <div className="mascot-blush right"></div>
          <div className="mascot-mouth"></div>
        </div>
        <div className="mascot-torso">
          <div className="mascot-top">
            <div className="mascot-collar"></div>
            <div className="mascot-tie"></div>
          </div>
          <div className="mascot-skirt"></div>
          <div className="mascot-arm left"></div>
          <div className="mascot-arm right"></div>
        </div>
        <div className="mascot-legs">
          <div className="mascot-leg"></div>
          <div className="mascot-leg"></div>
        </div>
      </div>
      <div className="mascot-bubble" id="mascotBubble" ref={bubbleRef} aria-live="polite">
        你好呀~
      </div>
    </div>
  )
}
