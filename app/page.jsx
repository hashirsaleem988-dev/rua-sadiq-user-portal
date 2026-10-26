'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Shield,
  Package,
  LayoutDashboard,
  ArrowRight,
  FolderOpen,
  Layers,
  Tag,
  Send,
  Boxes,
  ShieldCheck,
  RefreshCw,
  ListChecks,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react'

const STATS = [
  { value: '100%', label: 'Bilingual by default' },
  { value: '3', label: 'Content modules' },
  { value: '24/7', label: 'Secure access' },
]

// Unified theme color across all segments (matches the site's amber accent).
// Hover effects still work per-segment via --seg-color, they just all share this base color now.
const THEME_COLOR = '#f5a524'

const PETALS = [
  { id: '01', icon: Package, title: 'Add Products', color: THEME_COLOR },
  { id: '02', icon: FolderOpen, title: 'Organize Categories', color: THEME_COLOR },
  { id: '03', icon: Layers, title: 'Manage Inventory', color: THEME_COLOR },
  { id: '04', icon: Tag, title: 'Set Pricing', color: THEME_COLOR },
  { id: '05', icon: Send, title: 'Publish & Sync', color: THEME_COLOR },
]

const LEFT_CALLOUTS = [
  { icon: Boxes, title: 'Smart Categories', desc: 'Group your products with custom filters and layouts.' },
  { icon: FolderOpen, title: 'Easy Browsing', desc: 'Help users find what they need, faster.' },
  { icon: ListChecks, title: 'Structured Flow', desc: 'Keep your catalogue clean and organized.' },
]

const RIGHT_CALLOUTS = [
  { icon: Layers, title: 'Multi-Platform', desc: 'Publish and sync your catalogue across all platforms.' },
  { icon: RefreshCw, title: 'Instant Sync', desc: 'Real-time updates everywhere.' },
  { icon: Send, title: 'Wider Reach', desc: 'Reach more customers with perfect control.' },
]

const TRUST_ROW = [
  { icon: ShieldCheck, title: 'Real-time Updates', desc: 'See changes instantly across your system.' },
  { icon: Lock, title: 'Secure & Reliable', desc: 'Your data is safe with enterprise-grade security.' },
  { icon: Clock, title: '24/7 Access', desc: 'Manage your catalogue anytime, anywhere.' },
]

// ---------------------------------------------------------------------------
// Mobile-only radial hub data. The mobile layout is a distinct visual (a full
// closed 6-segment ring, followed by a connected two-column list, followed by
// the trust row) rather than a shrunk copy of the desktop fan layout, so it
// gets its own geometry + item set. It reuses the same icons/colors/copy.
// ---------------------------------------------------------------------------
const MOBILE_RING_ITEMS = [
  { id: '01', icon: Package, title: 'Add Products', color: THEME_COLOR },
  { id: '02', icon: Tag, title: 'Set Pricing', color: THEME_COLOR },
  { id: '03', icon: Send, title: 'Publish & Sync', color: THEME_COLOR },
  { id: '04', icon: Layers, title: 'Manage Inventory', color: THEME_COLOR },
  { id: '05', icon: FolderOpen, title: 'Organize Categories', color: THEME_COLOR },
  { id: '06', icon: Boxes, title: 'Multi-Platform', color: THEME_COLOR },
]

// Pairs rows to visually match the reference screenshot's two-column list.
const MOBILE_ROWS = [
  [LEFT_CALLOUTS[0], LEFT_CALLOUTS[1]],
  [LEFT_CALLOUTS[2], RIGHT_CALLOUTS[1]],
  [RIGHT_CALLOUTS[0], RIGHT_CALLOUTS[2]],
]

// Per-segment position overrides for the mobile ring — each item controls its own
// number / icon / label placement independently (radius = distance from center,
// angle = degrees clockwise from top). Edit any of these to nudge that one piece.
// `width` on the label controls where its text wraps.
const MOBILE_RING_POSITIONS = [
  // 01 — Add Products (top)
  { number: { r: 150, angle: 0 }, icon: { r: 120, angle: 0 }, label: { r: 90, angle: 0, width: 62 } },
  // 02 — Set Pricing
  { number: { r: 145, angle: 60 }, icon: { r: 123, angle: 60 }, label: { r: 118, angle: 76, width: 52 } },
  // 03 — Publish & Sync
  { number: { r: 145, angle: 100 }, icon: { r: 123, angle: 116 }, label: { r: 138, angle: 132, width: 52 } },
  // 04 — Manage Inventory (bottom)
  { number: { r: 150, angle: 180 }, icon: { r: 100, angle: 180 }, label: { r: 130, angle: 180, width: 62 } },
  // 05 — Organize Categories
  { number: { r: 145, angle: 258 }, icon: { r: 120, angle: 247 }, label: { r: 130, angle: 230, width: 52 } },
  // 06 — Multi-Platform
  { number: { r: 145, angle: 320 }, icon: { r: 123, angle: 310 }, label: { r: 115, angle: 290, width: 52 } },
]

const MOBILE_RING_CX = 170
const MOBILE_RING_CY = 170
const MOBILE_RING_INNER = 76
const MOBILE_RING_OUTER = 164
const MOBILE_SEG_ANGLE = 60
const MOBILE_SEG_PAD = 2
const MOBILE_SEGMENT_ANGLES = [0, 60, 120, 180, 240, 300]

function mobilePolarPoint(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: MOBILE_RING_CX + r * Math.sin(rad),
    y: MOBILE_RING_CY - r * Math.cos(rad),
  }
}

function mobileAnnulusSectorPath(rIn, rOut, startAngle, endAngle) {
  const p1 = mobilePolarPoint(rOut, startAngle)
  const p2 = mobilePolarPoint(rOut, endAngle)
  const p3 = mobilePolarPoint(rIn, endAngle)
  const p4 = mobilePolarPoint(rIn, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}

const RING_CX = 210
const RING_CY = 210
const RING_INNER = 92
const RING_OUTER = 198
const SEG_ANGLE = 54
const SEG_PAD = 1.8
const SEGMENT_ANGLES = [0, -54, -108, 54, 108]

function polarPoint(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: RING_CX + r * Math.sin(rad),
    y: RING_CY - r * Math.cos(rad),
  }
}

function annulusSectorPath(rIn, rOut, startAngle, endAngle) {
  const p1 = polarPoint(rOut, startAngle)
  const p2 = polarPoint(rOut, endAngle)
  const p3 = polarPoint(rIn, endAngle)
  const p4 = polarPoint(rIn, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}

function RingSegments({ hoveredIdx }) {
  return (
    <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full pointer-events-none">
      <defs>
        {PETALS.map((petal, i) => (
          <linearGradient
            key={petal.id}
            id={`ring-grad-${i}`}
            x1="0"
            y1="1"
            x2="0"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={petal.color} stopOpacity="0.07" />
            <stop offset="100%" stopColor={petal.color} stopOpacity="0.30" />
          </linearGradient>
        ))}
        {PETALS.map((petal, i) => (
          <filter key={`glow-${i}`} id={`seg-glow-${i}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {PETALS.map((petal, i) => {
        const center = SEGMENT_ANGLES[i]
        const start = center - SEG_ANGLE / 2 + SEG_PAD
        const end = center + SEG_ANGLE / 2 - SEG_PAD
        const isHovered = hoveredIdx === i
        return (
          <path
            key={petal.id}
            d={annulusSectorPath(RING_INNER, RING_OUTER, start, end)}
            fill={`url(#ring-grad-${i})`}
            stroke={petal.color}
            strokeOpacity={isHovered ? 1 : 0.55}
            strokeWidth={isHovered ? 2 : 1.5}
            filter={isHovered ? `url(#seg-glow-${i})` : undefined}
            className="ring-segment"
            style={{
              animationDelay: `${i * 90}ms`,
              '--segment-color': petal.color,
              transition: 'stroke-opacity 0.3s ease, stroke-width 0.3s ease',
            }}
          />
        )
      })}

      {/* Static dots at the inner boundary of the ring (around center circle → each feature) */}
      {SEGMENT_ANGLES.map((angle, i) => {
        const pt = polarPoint(RING_INNER, angle)
        return (
          <circle
            key={`inner-dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="2.6"
            fill="#fcd34d"
            className="static-dot"
          />
        )
      })}
    </svg>
  )
}

function RingContent({ onHover }) {
  const positions = [
    { number: { r: 182, angle: 0 }, icon: { r: 155, angle: 0 }, label: { r: 118, angle: 0 } },
    { number: { r: 178, angle: -54 }, icon: { r: 147, angle: -50 }, label: { r: 128, angle: -67 } },
    { number: { r: 178, angle: -91 }, icon: { r: 138, angle: -101 }, label: { r: 148, angle: -118 } },
    { number: { r: 178, angle: 44 }, icon: { r: 149, angle: 54 }, label: { r: 138, angle: 67 } },
    { number: { r: 178, angle: 92 }, icon: { r: 142, angle: 99 }, label: { r: 152, angle: 114 } },
  ]

  return (
    <>
      {PETALS.map((petal, i) => {
        const Icon = petal.icon
        const pos = positions[i]
        const numberPt = polarPoint(pos.number.r, pos.number.angle)
        const iconPt = polarPoint(pos.icon.r, pos.icon.angle)
        const labelPt = polarPoint(pos.label.r, pos.label.angle)
        const delay = `${180 + i * 80}ms`

        return (
          <div
            key={petal.id}
            className="segment-group"
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            style={{ '--seg-color': petal.color }}
          >
            {/* Number */}
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold tracking-wider ring-pop segment-number"
              style={{ left: numberPt.x, top: numberPt.y, color: petal.color, animationDelay: delay }}
            >
              {petal.id}
            </span>

            {/* Icon circle */}
            <div
              className="ring-icon absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border ring-pop segment-icon"
              style={{
                left: iconPt.x,
                top: iconPt.y,
                borderColor: petal.color,
                backgroundColor: `${petal.color}18`,
                '--icon-color': petal.color,
                animationDelay: delay,
              }}
            >
              <Icon className="h-4 w-4" style={{ color: petal.color }} />
            </div>

            {/* Label */}
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-semibold leading-tight text-white ring-pop segment-label"
              style={{ left: labelPt.x, top: labelPt.y, width: 90, maxWidth: 90, animationDelay: delay }}
            >
              {petal.title}
            </span>
          </div>
        )
      })}
    </>
  )
}

function SideCallout({ item, side, index }) {
  const Icon = item.icon
  return (
    <div
      className={`side-callout relative flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}
      style={{ animationDelay: `${index * 140}ms` }}
    >
      <div className="callout-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-slate-900/70">
        <Icon className="h-4 w-4 text-amber-400" />
      </div>
      <div className={side === 'right' ? 'text-right' : ''}>
        <p className="text-sm font-bold text-white">{item.title}</p>
        <p className="text-xs text-slate-400 max-w-[190px] leading-relaxed">{item.desc}</p>
      </div>
    </div>
  )
}

// Curved connector: smooth bezier lines fanning out from a single point near the
// ring to each of the 3 side items, instead of hard right angles.
function SideConnector({ side }) {
  const isLeft = side === 'left'
  const SVG_W = 90
  const circleX = isLeft ? SVG_W - (-34) : -34
  const spineX = isLeft ? 35 : SVG_W - 35
  const itemsX = isLeft ? 0 : SVG_W

  // y-positions of the 3 items (top / middle / bottom), matching the
  // flex justify-between layout of the callout column.
  const targetYs = [40, 210, 380]

  const paths = targetYs.map(
    (y) => `M${circleX} 210 C ${spineX} 210, ${spineX} ${y}, ${itemsX} ${y}`
  )

  const staticDots = [
    { cx: circleX, cy: 210 },
    ...targetYs.map((y) => ({ cx: itemsX, cy: y })),
  ]

  return (
<svg
  className={`hidden lg:block absolute top-0 h-full pointer-events-none side-connector z-10 ${
    isLeft ? 'right-0' : 'left-0'
  }`}
  style={{ width: SVG_W, overflow: 'visible' }}
  viewBox={`0 0 ${SVG_W} 420`}
  preserveAspectRatio="none"
>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#f5a524"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          className="connector-path"
        />
      ))}

      {staticDots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r="2.6"
          fill="#fcd34d"
          className="static-dot"
        />
      ))}
    </svg>
  )
}

function RadialHub() {
  const [visible, setVisible] = useState(false)
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`px-6 pb-16 feature-section ${visible ? 'is-visible' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Desktop — unchanged */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="relative h-[420px] flex flex-col justify-between pr-14 z-10">
            <SideConnector side="left" />
            {LEFT_CALLOUTS.map((item, i) => (
              <SideCallout key={item.title} item={item} side="left" index={i} />
            ))}
          </div>

          <div className="relative h-[420px] w-[420px] mx-auto">
            <RingSegments hoveredIdx={hoveredSegment} />
            <RingContent onHover={setHoveredSegment} />

            <div className="center-hub absolute left-1/2 top-1/2 h-[156px] w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/50 bg-slate-950 flex flex-col items-center justify-center gap-1 z-20">
              <div className="center-icon flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-500/10">
                <Package className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-sm font-bold text-white">Your Catalogue</span>
              <span className="text-[10px] text-slate-500">Full control. Real-time.</span>
            </div>
          </div>

          <div className="relative h-[420px] flex flex-col justify-between pl-14 z-10">
            <SideConnector side="right" />
            {RIGHT_CALLOUTS.map((item, i) => (
              <SideCallout key={item.title} item={item} side="right" index={i} />
            ))}
          </div>
        </div>

        {/* Mobile — full closed 6-segment ring, connected two-column list, trust row */}
        <div className="lg:hidden">
          <div className="relative mx-auto w-full max-w-[340px] aspect-square">
            <svg viewBox="0 0 340 340" className="absolute inset-0 h-full w-full pointer-events-none">
              <defs>
                {MOBILE_RING_ITEMS.map((item, i) => (
                  <linearGradient
                    key={item.id}
                    id={`mobile-ring-grad-${i}`}
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor={item.color} stopOpacity="0.07" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="0.30" />
                  </linearGradient>
                ))}
              </defs>

              {MOBILE_RING_ITEMS.map((item, i) => {
                const center = MOBILE_SEGMENT_ANGLES[i]
                const start = center - MOBILE_SEG_ANGLE / 2 + MOBILE_SEG_PAD
                const end = center + MOBILE_SEG_ANGLE / 2 - MOBILE_SEG_PAD
                return (
                  <path
                    key={item.id}
                    d={mobileAnnulusSectorPath(MOBILE_RING_INNER, MOBILE_RING_OUTER, start, end)}
                    fill={`url(#mobile-ring-grad-${i})`}
                    stroke={item.color}
                    strokeOpacity={0.55}
                    strokeWidth={1.5}
                    className="ring-segment"
                    style={{ animationDelay: `${i * 90}ms`, '--segment-color': item.color }}
                  />
                )
              })}

              {MOBILE_SEGMENT_ANGLES.map((angle, i) => {
                const pt = mobilePolarPoint(MOBILE_RING_INNER, angle)
                return (
                  <circle
                    key={`mobile-inner-dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.4"
                    fill="#fcd34d"
                    className="static-dot"
                  />
                )
              })}
            </svg>

            {MOBILE_RING_ITEMS.map((item, i) => {
              const Icon = item.icon
              const pos = MOBILE_RING_POSITIONS[i]
              const numberPt = mobilePolarPoint(pos.number.r, pos.number.angle)
              const iconPt = mobilePolarPoint(pos.icon.r, pos.icon.angle)
              const labelPt = mobilePolarPoint(pos.label.r, pos.label.angle)
              const labelW = pos.label.width
              const delay = `${180 + i * 80}ms`
              return (
                <div key={item.id} className="absolute inset-0 pointer-events-none">
                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider ring-pop segment-number"
                    style={{
                      left: `${(numberPt.x / 340) * 100}%`,
                      top: `${(numberPt.y / 340) * 100}%`,
                      color: item.color,
                      animationDelay: delay,
                    }}
                  >
                    {item.id}
                  </span>

                  <div
                    className="ring-icon absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border ring-pop segment-icon"
                    style={{
                      left: `${(iconPt.x / 340) * 100}%`,
                      top: `${(iconPt.y / 340) * 100}%`,
                      borderColor: item.color,
                      backgroundColor: `${item.color}18`,
                      '--icon-color': item.color,
                      animationDelay: delay,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                  </div>

                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-[9px] font-semibold leading-tight text-white ring-pop segment-label"
                    style={{
                      left: `${(labelPt.x / 340) * 100}%`,
                      top: `${(labelPt.y / 340) * 100}%`,
                      width: labelW,
                      maxWidth: labelW,
                      display: 'flex',
                      justifyContent: 'center',
                      animationDelay: delay,
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              )
            })}

            <div className="center-hub absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/50 bg-slate-950 flex flex-col items-center justify-center gap-1 z-20">
              <div className="center-icon flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-500/10">
                <Package className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-white">Your Catalogue</span>
              <span className="text-[9px] text-slate-500 text-center px-3 leading-snug">
                Full control. Real-time.
              </span>
            </div>
          </div>

          {/* Stem connecting the ring down into the list */}
          <div className="relative h-8 flex justify-center">
            <div className="w-px h-full bg-gradient-to-b from-amber-500/60 to-amber-500/30 connector-path" />
          </div>

          {/* Connected two-column list */}
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/30 to-amber-500/50" />
            <div className="space-y-4">
              {MOBILE_ROWS.map((row, ri) => (
                <div key={ri} className="relative grid grid-cols-2 gap-3">
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(245,165,36,0.5)] z-10 static-dot" />
                  {row.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="side-callout flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 p-2.5"
                        style={{ animationDelay: `${ri * 140}ms` }}
                      >
                        <div className="callout-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-slate-900/70">
                          <Icon className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white leading-tight">{item.title}</p>
                          <p className="text-[9px] text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div className="relative mt-10 lg:mt-4 pt-4">
          <svg
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-stem"
            style={{ top: -180 }}
            width="768"
            height="200"
            viewBox="0 0 768 200"
          >
            {/*
              x-positions (120 / 384 / 648) are the exact horizontal centers of the
              3 trust-row columns inside the max-w-3xl (768px) mx-auto grid with gap-6,
              so each dot lands directly above its icon.
            */}
            <path
              d="M384 0 V160
                 M384 160 H120
                 M384 160 H648
                 M120 160 V190
                 M384 160 V190
                 M648 160 V190"
              fill="none"
              stroke="#f5a524"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              className="connector-path"
            />

            {/* Static dots at every junction, aligned above each icon */}
            {[
              { cx: 384, cy: 0 },
              { cx: 384, cy: 160 },
              { cx: 120, cy: 160 },
              { cx: 648, cy: 160 },
              { cx: 120, cy: 190 },
              { cx: 384, cy: 190 },
              { cx: 648, cy: 190 },
            ].map((dot, i) => (
              <circle
                key={i}
                cx={dot.cx}
                cy={dot.cy}
                r="2.6"
                fill="#fcd34d"
                className="static-dot"
              />
            ))}
          </svg>

          {/* Mobile trust connector: full-width so its 3 stems line up with the grid-cols-3 icons below */}
          <svg
            className="lg:hidden absolute left-0 right-0 w-full pointer-events-none"
            style={{ top: -28, height: 32 }}
            viewBox="0 0 300 32"
            preserveAspectRatio="none"
          >
            <path
              d="M150 0 V16
                 M150 16 H50
                 M150 16 H250
                 M50 16 V32
                 M150 16 V32
                 M250 16 V32"
              fill="none"
              stroke="#f5a524"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              className="connector-path"
              vectorEffect="non-scaling-stroke"
            />
            {[
              { cx: 150, cy: 0 },
              { cx: 150, cy: 16 },
              { cx: 50, cy: 16 },
              { cx: 250, cy: 16 },
              { cx: 50, cy: 32 },
              { cx: 150, cy: 32 },
              { cx: 250, cy: 32 },
            ].map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy} r="2.4" fill="#fcd34d" className="static-dot" />
            ))}
          </svg>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto pt-2">
            {TRUST_ROW.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="trust-item flex flex-col items-center text-center gap-2"
                  style={{ animationDelay: `${420 + i * 110}ms` }}
                >
                  <div className="trust-icon flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/50 bg-slate-900/70">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== ANIMATIONS ========== */}
      <style jsx>{`
        /* Section entrance */
        .feature-section {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Ring segments */
        .ring-segment {
          opacity: 0;
          transform-origin: 210px 210px;
          transform: scale(0.7);
          filter: drop-shadow(0 0 6px var(--segment-color));
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.3s ease,
            stroke-opacity 0.3s ease;
        }
        .feature-section.is-visible .ring-segment {
          opacity: 1;
          transform: scale(1);
        }

        /* Segment hover */
        .segment-group {
          position: contents;
        }
        .segment-group:hover .segment-icon {
          box-shadow:
            0 0 0 2px var(--seg-color),
            0 0 22px var(--seg-color),
            0 0 44px color-mix(in srgb, var(--seg-color) 60%, transparent);
          border-color: var(--seg-color) !important;
          transform: translate(-50%, -50%) scale(1.22);
        }
        .segment-group:hover .segment-number {
          text-shadow:
            0 0 8px var(--seg-color),
            0 0 20px var(--seg-color);
          filter: brightness(1.4);
        }
        .segment-group:hover .segment-label {
          text-shadow: 0 0 10px var(--seg-color);
          color: #ffffff;
          filter: brightness(1.3);
        }

        /* Pop animation */
        .ring-pop {
          opacity: 0;
          animation: ringPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-play-state: paused;
        }
        .feature-section.is-visible .ring-pop {
          animation-play-state: running;
        }
        @keyframes ringPop {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          70%  { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Icon glow */
        .ring-icon {
          transition:
            box-shadow 0.3s ease,
            border-color 0.3s ease,
            transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 8px var(--icon-color);
        }

        /* Centre hub */
        .center-hub {
          box-shadow: 0 0 36px rgba(245, 165, 36, 0.28);
          transition:
            transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.4s ease;
          animation: hubPulse 3.2s ease-in-out infinite;
        }
        .center-hub:hover {
          transform: translate(-50%, -50%) scale(1.07);
          box-shadow: 0 0 70px rgba(245, 165, 36, 0.65);
        }
        .center-hub:hover .center-icon {
          box-shadow: 0 0 24px rgba(245, 165, 36, 0.65);
          border-color: rgba(245, 165, 36, 0.95);
        }
        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 36px rgba(245, 165, 36, 0.28); }
          50%       { box-shadow: 0 0 60px rgba(245, 165, 36, 0.48); }
        }

        /* Side callouts */
        .side-callout {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.6s ease-out,
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-section.is-visible .side-callout {
          opacity: 1;
          transform: translateY(0);
        }
        .callout-icon {
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
          box-shadow: 0 0 8px rgba(245, 165, 36, 0.22);
        }
        .callout-icon:hover {
          transform: scale(1.16);
          border-color: rgba(245, 165, 36, 0.95);
          box-shadow:
            0 0 18px rgba(245, 165, 36, 0.55),
            0 0 36px rgba(245, 165, 36, 0.25);
        }

        /* Trust row */
        .trust-item {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 0.55s ease-out,
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-section.is-visible .trust-item {
          opacity: 1;
          transform: translateY(0);
        }
        .trust-icon {
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
          box-shadow: 0 0 8px rgba(245, 165, 36, 0.22);
        }
        .trust-icon:hover {
          transform: scale(1.16);
          border-color: rgba(245, 165, 36, 0.95);
          box-shadow:
            0 0 18px rgba(245, 165, 36, 0.55),
            0 0 36px rgba(245, 165, 36, 0.25);
        }

        /* Connector lines */
        .connector-path {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
        }
        .feature-section.is-visible .connector-path {
          stroke-dashoffset: 0;
        }

        /* Static dots (no movement) */
        .static-dot {
          filter: drop-shadow(0 0 4px #fcd34d) drop-shadow(0 0 9px rgba(245, 165, 36, 0.7));
          opacity: 0;
          transition: opacity 0.4s ease 0.8s;
        }
        .feature-section.is-visible .static-dot {
          opacity: 1;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .feature-section,
          .ring-segment,
          .ring-pop,
          .side-callout,
          .trust-item,
          .connector-path,
          .center-hub,
          .ring-icon,
          .callout-icon,
          .trust-icon,
          .static-dot {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: translate(-50%, -50%) !important;
            stroke-dashoffset: 0 !important;
            filter: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </section>
  )
}

export default function PortalLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="relative flex flex-col min-h-screen">
        <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-6 w-6 text-amber-400" />
              <span className="absolute inset-0 -z-10 blur-md bg-amber-400/40 animate-pulse-slow rounded-full" />
            </div>
            <span className="font-semibold tracking-wide">Portal</span>
          </div>
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition hover:shadow-lg hover:shadow-amber-500/20"
          >
            Sign in
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-2xl text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Product Management System
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Manage your catalogue with
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
                speed &amp; control
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Create, edit, and delete products. Upload images, update prices and details — all from a
              single secure dashboard built.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-12 pt-6">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${150 + i * 100}ms` }}
                >
                  <p className="text-xl sm:text-2xl font-bold text-amber-400">{s.value}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <RadialHub />

        <footer className="text-center text-xs text-slate-500 py-6 border-t border-white/5">
          Rua Sadiq Trading · Admin Portal
        </footer>
      </div>
    </div>
  )
}