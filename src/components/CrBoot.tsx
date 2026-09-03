import { useEffect } from 'react'

/**
 * CRT 动态壳：
 * 1) 冷启动（整页会话首次）播放 PHOSPHOR.SYS BOOT 序列
 * 2) 监听 crt:poweroff 事件 → 播放关机坍缩 → 重载页面（重播 boot）
 */
export default function CrBoot() {
  useEffect(() => {
    let overlay: HTMLDivElement | null = null

    const cleanup = () => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay)
      overlay = null
    }

    const playBoot = () => {
      if (overlay) cleanup()
      overlay = document.createElement('div')
      overlay.className = 'crt-boot-overlay'
      overlay.innerHTML =
        '<div class="crt-boot-inner"><div class="crt-boot-line">PHOSPHOR.SYS v2.0 — 终端初始化</div>' +
        '<div class="crt-boot-line crt-boot-delay-1">MEM OK .......... 640K</div>' +
        '<div class="crt-boot-line crt-boot-delay-2">HAL 自检通过 .......... OK</div>' +
        '<div class="crt-boot-cursor">█</div></div>'
      document.body.appendChild(overlay)
      window.setTimeout(cleanup, 1100)
    }

    const onPower = () => {
      if (overlay) cleanup()
      overlay = document.createElement('div')
      overlay.className = 'crt-boot-overlay crt-poweroff'
      overlay.innerHTML = '<div class="crt-poweroff-text">SYSTEM HALT</div>'
      document.body.appendChild(overlay)
      window.setTimeout(() => {
        cleanup()
        try {
          sessionStorage.removeItem('crt_booted')
        } catch (e) {
          /* ignore */
        }
        window.location.reload()
      }, 520)
    }

    window.addEventListener('crt:poweroff', onPower)

    let booted = false
    try {
      booted = sessionStorage.getItem('crt_booted') === '1'
    } catch (e) {
      /* ignore */
    }
    if (!booted) {
      try {
        sessionStorage.setItem('crt_booted', '1')
      } catch (e) {
        /* ignore */
      }
      // 延迟到首帧后播放，避免与首屏绘制抢时间
      window.setTimeout(playBoot, 60)
    }

    return () => {
      window.removeEventListener('crt:poweroff', onPower)
      cleanup()
    }
  }, [])

  return null
}
