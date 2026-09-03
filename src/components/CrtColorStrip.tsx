import { useState } from 'react'
import { getCrt, setCrt, type CrtPalette } from '../lib/theme'

const PALETTES: { v: CrtPalette; cls: string; title: string }[] = [
  { v: 'green', cls: 'crt-dot-green', title: 'PHOSPHOR.GREEN 磷光绿' },
  { v: 'amber', cls: 'crt-dot-amber', title: 'PHOSPHOR.AMBER 琥珀' },
  { v: 'blue', cls: 'crt-dot-blue', title: 'PHOSPHOR.BLUE 蓝磷' },
]

/** 右下角常驻 CRT 配色切换条（绿/琥珀/蓝磷） + 电源键 */
export default function CrtColorStrip() {
  const [crt, setState] = useState<CrtPalette>(() => getCrt())

  const onClick = (v: CrtPalette) => {
    setCrt(v)
    setState(v)
  }

  const onPower = () => {
    window.dispatchEvent(new CustomEvent('crt:poweroff'))
  }

  return (
    <div className="crt-strip" aria-label="CRT 配色切换">
      {PALETTES.map(p => (
        <button
          key={p.v}
          type="button"
          title={p.title}
          aria-label={p.title}
          className={'crt-dot ' + p.cls + (crt === p.v ? ' active' : '')}
          onClick={() => onClick(p.v)}
        />
      ))}
      <button type="button" title="电源 / 重启动画" aria-label="电源" className="crt-power" onClick={onPower}>
        ⏻
      </button>
    </div>
  )
}
