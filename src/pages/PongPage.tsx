import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'

/* ============ PHOSPHOR PONG —— 纯手写 WebGL1（无外部库） ============ */

const W = 960
const H = 540
const PAD_W = 10
const PAD_H = 64
const PAD_OFF = 44
const BALL_R = 6
const WIN_SCORE = 5

const VS = `
attribute vec2 a_pos;
uniform vec2 u_center;
uniform vec2 u_half;
uniform vec2 u_res;
void main() {
  vec2 p = u_center + a_pos * u_half;
  vec2 ndc = vec2(p.x * 2.0 / u_res.x - 1.0, 1.0 - p.y * 2.0 / u_res.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

const FS = `
precision mediump float;
uniform vec2 u_res;
uniform vec2 u_pos;
uniform float u_shape; // 0 = circle, 1 = rect
uniform float u_r;
uniform float u_glow;
uniform vec3 u_rgb;
void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  float d = 0.0;
  float core = 0.0;
  float glow = 0.0;
  if (u_shape > 0.5) {
    vec2 q = abs(p - u_pos) - u_half;
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    core = d <= 0.0 ? 1.0 : 0.0;
    glow = exp(-d / u_glow) * 0.85;
  } else {
    d = length(p - u_pos);
    core = smoothstep(u_r, u_r - 2.0, d);
    glow = exp(-d / u_glow) * 0.9;
  }
  vec3 col = u_rgb * (glow + core);
  col += vec3(1.0) * core * 0.3;
  gl_FragColor = vec4(col, 1.0);
}
`

interface GameState {
  status: 'ready' | 'run' | 'pause' | 'over'
  p1y: number
  p2y: number
  bx: number
  by: number
  bvx: number
  bvy: number
  s1: number
  s2: number
  last: number
  aiSpeed: number
}

const GREEN = [0.29, 0.878, 0.51]

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const msgRef = useRef<HTMLDivElement>(null)
  const score1Ref = useRef<HTMLSpanElement>(null)
  const score2Ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setPageMeta('WebGL 试玩：PHOSPHOR PONG - 萌神小天', '萌神小天博客内置 WebGL 小游戏：磷光 CRT 风格 PONG，纯手写渲染')
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = (canvas.getContext('webgl', { antialias: false }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    const msg = msgRef.current
    if (!gl || !msg) {
      if (msg) msg.textContent = '当前环境不支持 WebGL'
      return
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)
      if (!sh) throw new Error('create shader fail')
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) || 'shader compile fail')
      }
      return sh
    }
    const prog = gl.createProgram()
    if (!prog) return
    const vs = compile(gl.VERTEX_SHADER, VS)
    const fs = compile(gl.FRAGMENT_SHADER, FS)
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW)
    const locPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(locPos)
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uCenter = gl.getUniformLocation(prog, 'u_center')
    const uHalf = gl.getUniformLocation(prog, 'u_half')
    const uPos = gl.getUniformLocation(prog, 'u_pos')
    const uShape = gl.getUniformLocation(prog, 'u_shape')
    const uR = gl.getUniformLocation(prog, 'u_r')
    const uGlow = gl.getUniformLocation(prog, 'u_glow')
    const uRgb = gl.getUniformLocation(prog, 'u_rgb')
    gl.uniform2f(uRes, W, H)

    const drawRect = (cx: number, cy: number, hw: number, hh: number, rgb: number[], glow = 4) => {
      gl.uniform2f(uCenter, cx, cy)
      gl.uniform2f(uHalf, hw, hh)
      gl.uniform2f(uPos, cx, cy)
      gl.uniform1f(uShape, 1)
      gl.uniform1f(uGlow, glow)
      gl.uniform3f(uRgb, rgb[0], rgb[1], rgb[2])
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const drawBall = (cx: number, cy: number, r: number, rgb: number[]) => {
      gl.uniform2f(uCenter, cx, cy)
      gl.uniform2f(uHalf, r, r)
      gl.uniform2f(uPos, cx, cy)
      gl.uniform1f(uShape, 0)
      gl.uniform1f(uR, r)
      gl.uniform1f(uGlow, r * 1.9)
      gl.uniform3f(uRgb, rgb[0], rgb[1], rgb[2])
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const resetBall = (dir: number) => {
      s.bx = W / 2
      s.by = H / 2
      const ang = (Math.random() - 0.5) * 0.7
      s.bvx = dir * Math.cos(ang) * 4.6
      s.bvy = Math.sin(ang) * 3.2
      if (Math.abs(s.bvy) < 1.2) s.bvy = s.bvy >= 0 ? 1.2 : -1.2
    }

    const s: GameState = {
      status: 'ready',
      p1y: H / 2 - PAD_H / 2,
      p2y: H / 2 - PAD_H / 2,
      bx: W / 2,
      by: H / 2,
      bvx: 0,
      bvy: 0,
      s1: 0,
      s2: 0,
      last: 0,
      aiSpeed: 3.6,
    }

    const keys = new Set<string>()
    const setMsg = (t: string) => {
      if (msg.textContent !== t) msg.textContent = t
    }
    const syncScore = () => {
      const a = score1Ref.current
      const b = score2Ref.current
      if (a) a.textContent = String(s.s1).padStart(2, '0')
      if (b) b.textContent = String(s.s2).padStart(2, '0')
    }

    const start = () => {
      s.status = 'run'
      setMsg('')
      if (s.bvx === 0) resetBall(Math.random() > 0.5 ? 1 : -1)
    }
    const pause = () => {
      if (s.status === 'run') {
        s.status = 'pause'
        setMsg('PAUSED — 按 SPACE 继续')
      } else if (s.status === 'ready' || s.status === 'pause') {
        start()
      }
    }
    const reset = () => {
      s.status = 'ready'
      s.s1 = 0
      s.s2 = 0
      s.p1y = H / 2 - PAD_H / 2
      s.p2y = H / 2 - PAD_H / 2
      s.bvx = 0
      s.bvy = 0
      resetBall(-1)
      s.status = 'run'
      syncScore()
      setMsg('')
    }

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowup' || k === 'w') keys.add('up')
      if (k === 'arrowdown' || k === 's') keys.add('down')
      if (k === ' ' || k === 'enter') {
        e.preventDefault()
        if (s.status === 'over') reset()
        else pause()
      }
      if (k === 'r') reset()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowup' || k === 'w') keys.delete('up')
      if (k === 'arrowdown' || k === 's') keys.delete('down')
    }
    const onVis = () => {
      if (document.hidden && s.status === 'run') {
        s.status = 'pause'
        setMsg('PAUSED — 按 SPACE 继续')
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVis)

    const update = (dt: number) => {
      if (s.status !== 'run') return
      const move = 5.4 * dt * 60
      if (keys.has('up')) s.p1y -= move
      if (keys.has('down')) s.p1y += move
      s.p1y = Math.max(8, Math.min(H - PAD_H - 8, s.p1y))

      // AI：跟随球，限速
      const target = s.by - PAD_H / 2
      const diff = target - s.p2y
      const step = s.aiSpeed * dt * 60
      s.p2y += Math.abs(diff) <= step ? diff : Math.sign(diff) * step
      s.p2y = Math.max(8, Math.min(H - PAD_H - 8, s.p2y))

      s.bx += s.bvx * dt * 60
      s.by += s.bvy * dt * 60

      if (s.by < BALL_R) {
        s.by = BALL_R
        s.bvy = Math.abs(s.bvy)
      } else if (s.by > H - BALL_R) {
        s.by = H - BALL_R
        s.bvy = -Math.abs(s.bvy)
      }

      const hitPaddle = (px: number, pady: number) => {
        const cx = px + PAD_W / 2
        const cy = pady + PAD_H / 2
        return (
          s.bx + BALL_R > cx - PAD_W / 2 &&
          s.bx - BALL_R < cx + PAD_W / 2 &&
          s.by + BALL_R > cy - PAD_H / 2 &&
          s.by - BALL_R < cy + PAD_H / 2
        )
      }
      if (s.bvx < 0 && s.bx - BALL_R < PAD_OFF + PAD_W && hitPaddle(PAD_OFF, s.p1y)) {
        s.bx = PAD_OFF + PAD_W + BALL_R + 0.1
        s.bvx = Math.min(8, Math.abs(s.bvx) + 0.35)
        s.bvy = s.bvy * 1.04 + (s.by - (s.p1y + PAD_H / 2)) * 0.012
        if (Math.abs(s.bvy) < 1) s.bvy = s.bvy >= 0 ? 1 : -1
      } else if (s.bvx > 0 && s.bx + BALL_R > W - PAD_OFF - PAD_W && hitPaddle(W - PAD_OFF - PAD_W, s.p2y)) {
        s.bx = W - PAD_OFF - PAD_W - BALL_R - 0.1
        s.bvx = -Math.min(8, Math.abs(s.bvx) + 0.35)
        s.bvy = s.bvy * 1.04 + (s.by - (s.p2y + PAD_H / 2)) * 0.012
        if (Math.abs(s.bvy) < 1) s.bvy = s.bvy >= 0 ? 1 : -1
      }

      if (s.bx < -20) {
        s.s2++
        syncScore()
        if (s.s2 >= WIN_SCORE) {
          s.status = 'over'
          setMsg('PLAYER 2 WINS — 按 R 重来')
        } else resetBall(1)
      } else if (s.bx > W + 20) {
        s.s1++
        syncScore()
        if (s.s1 >= WIN_SCORE) {
          s.status = 'over'
          setMsg('PLAYER 1 WINS — 按 R 重来')
        } else resetBall(-1)
      }
    }

    const render = () => {
      gl.viewport(0, 0, W, H)
      gl.clearColor(0.004, 0.018, 0.012, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      drawRect(PAD_OFF, s.p1y, PAD_W / 2, PAD_H / 2, GREEN, 5)
      drawRect(W - PAD_OFF, s.p2y, PAD_W / 2, PAD_H / 2, GREEN, 5)

      // 中线虚线（10 段）
      for (let i = 0; i < 10; i++) {
        const y = 30 + i * ((H - 60) / 10)
        drawRect(W / 2, y, 2, 8, [0.1, 0.45, 0.22], 2)
      }

      if (s.status === 'run' || s.status === 'pause') {
        drawBall(s.bx, s.by, BALL_R, GREEN)
      }
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (t - s.last) / 1000 || 0.016))
      s.last = t
      if (s.status === 'ready') setMsg('按 SPACE / ENTER 开始  ·  ↑↓ 或 W/S 移动  ·  R 重来')
      update(dt)
      render()
      raf = requestAnimationFrame(loop)
    }

    syncScore()
    let raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>WebGL 试玩 / PLAY.SYS</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <div className="play-page">
        <div className="play-header">
          <span className="play-brand">PHOSPHOR PONG</span>
          <div className="play-score">
            <span ref={score1Ref} className="play-score-num">00</span>
            <span className="play-score-colon">:</span>
            <span ref={score2Ref} className="play-score-num">00</span>
          </div>
          <span className="play-tip">↑↓ / W S · SPACE · R</span>
        </div>
        <div className="play-screen">
          <canvas ref={canvasRef} width={W} height={H} className="play-canvas" />
          <div className="play-msg" ref={msgRef}></div>
        </div>
        <p className="play-foot">
          手写 WebGL1 渲染 · 辉光 + 扫描线 CRT 效果 · 先得 {WIN_SCORE} 分获胜
        </p>
      </div>
    </>
  )
}
