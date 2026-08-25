<script setup>
import { computed } from 'vue'

const props = defineProps({
  store: { type: Object, required: true },
})
const emit = defineEmits(['navigate'])

const {
  state,
  orgEnablerGroups,
  learningCultureItemGroups,
  valueItemGroups,
  someonePctBucket,
  someonePctIndividuals,
  someonePctBadges,
} = props.store

const svgW = 1500
const svgH = 560

// The road is a single U: down the left side, around a wide shallow bowl,
// back up the right side — start and goal sit at the same height, at the
// two open ends of the U.
const xLeft = 150
const xRight = 1350
const yTop = 60
const yShoulder = 110 // where the straight sides give way to the curve
const bowlDepth = 330 // how far the bottom of the U dips below the shoulders
const cx = (xLeft + xRight) / 2
const rx = (xRight - xLeft) / 2

// Raw (non-arc-length) parametrization of the U, u in [0, 3]:
// [0,1] left side, [1,2] bottom bowl, [2,3] right side.
function rawPoint(u) {
  if (u <= 1) {
    const t = u
    return [xLeft, yTop + (yShoulder - yTop) * t]
  }
  if (u <= 2) {
    const angle = Math.PI * (1 - (u - 1))
    return [cx + rx * Math.cos(angle), yShoulder + bowlDepth * Math.sin(angle)]
  }
  const t = u - 2
  return [xRight, yShoulder + (yTop - yShoulder) * t]
}

const ARC_SAMPLES = 400
const sampled = (() => {
  const pts = []
  const dist = [0]
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    pts.push(rawPoint((3 * i) / ARC_SAMPLES))
    if (i > 0) {
      const [px, py] = pts[i - 1]
      const [x, y] = pts[i]
      dist.push(dist[i - 1] + Math.hypot(x - px, y - py))
    }
  }
  return { pts, dist, total: dist[dist.length - 1] }
})()

// Point at a given fraction (0..1) of the way along the U, by arc length —
// so five equally-spaced stops land equal distances apart on the road.
function pointAtFraction(f) {
  const target = f * sampled.total
  let lo = 0
  let hi = sampled.dist.length - 1
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2)
    if (sampled.dist[mid] < target) lo = mid
    else hi = mid
  }
  const segLen = sampled.dist[hi] - sampled.dist[lo] || 1
  const segT = (target - sampled.dist[lo]) / segLen
  const [x0, y0] = sampled.pts[lo]
  const [x1, y1] = sampled.pts[hi]
  return { x: x0 + (x1 - x0) * segT, y: y0 + (y1 - y0) * segT }
}

const stopDefs = [
  { label: 'Foundational enablers', tab: 'organization', color: '#2ecc40' },
  { label: 'Learning culture', tab: 'learning-culture', color: '#5c2d91' },
  { label: 'Individual experiences', tab: 'individual', color: '#0099e5' },
  { label: 'Badges', tab: 'badges', color: '#e4002b' },
  { label: 'Benefits showcase', tab: 'value', color: '#ff6b35' },
]

const stops = computed(() => {
  const pctByTab = {
    organization: someonePctBucket(state.organization, orgEnablerGroups),
    'learning-culture': someonePctBucket(state.learningCulture, learningCultureItemGroups),
    individual: someonePctIndividuals(),
    value: someonePctBucket(state.value, valueItemGroups),
    badges: someonePctBadges(),
  }
  return stopDefs.map((def, i) => {
    const { x, y } = pointAtFraction(i / (stopDefs.length - 1))
    return { ...def, x, y, pct: pctByTab[def.tab] }
  })
})

const overallPct = computed(() => {
  if (!stops.value.length) return 0
  const sum = stops.value.reduce((total, s) => total + s.pct, 0)
  return Math.round(sum / stops.value.length)
})

const roadPath = computed(() => {
  return (
    `M ${xLeft} ${yTop} L ${xLeft} ${yShoulder} ` +
    `A ${rx} ${bowlDepth} 0 0 0 ${xRight} ${yShoulder} ` +
    `L ${xRight} ${yTop}`
  )
})

const quotePos = { x: cx, y: yTop + 30 }

function cardStyle(stop) {
  const left = (stop.x / svgW) * 100
  const top = (stop.y / svgH) * 100
  const isBottom = stop.y > yShoulder + bowlDepth * 0.7
  let transform
  if (isBottom) {
    transform = 'translate(-50%, 26px)'
  } else if (stop.x < cx) {
    transform = 'translate(26px, -50%)'
  } else {
    transform = 'translate(calc(-100% - 26px), -50%)'
  }
  return {
    left: left + '%',
    top: top + '%',
    '--accent': stop.color,
    transform,
  }
}
</script>

<template>
  <div class="tab-panel">
    <div class="tab-intro">
      <div class="tab-intro__text">
        <h2>Journey</h2>
        <p>
          The road from foundational enablers to a recognized, AI-native way of working. Each stop
          shows the "someone" percentage — the share of tracked items already true for at least one
          person or place in the org. Click a stop to jump to its tab.
        </p>
      </div>
      <div class="overall-pct">
        <span class="overall-pct__num">{{ overallPct }}%</span>
        <span class="overall-pct__label">overall</span>
      </div>
    </div>

    <div class="road-wrap">
      <svg class="road-svg" :viewBox="`0 0 ${svgW} ${svgH}`" preserveAspectRatio="xMidYMid meet">
        <path :d="roadPath" fill="none" stroke="#c8c8c8" stroke-width="70" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" />
        <path :d="roadPath" fill="none" stroke="#3a3a4a" stroke-width="62" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="roadPath" fill="none" stroke="#ffe066" stroke-width="3" stroke-dasharray="22 16" stroke-linecap="round" />
        <circle v-for="(s, i) in stops" :key="'ring' + i" :cx="s.x" :cy="s.y" r="34" :fill="s.color" fill-opacity="0.16" :stroke="s.color" stroke-width="2.5" />
        <circle v-for="(s, i) in stops" :key="'dot' + i" :cx="s.x" :cy="s.y" r="20" :fill="s.color" stroke="#fff" stroke-width="3.5" />
        <text v-for="(s, i) in stops" :key="'num' + i" :x="s.x" :y="s.y + 7" text-anchor="middle" font-size="19" font-weight="700" fill="#fff">{{ i + 1 }}</text>
        <text :x="stops[0].x - 16" :y="stops[0].y - 44" font-size="12" font-weight="700" fill="#2ecc40" letter-spacing="1.5">START</text>
        <text :x="stops[stops.length - 1].x - 32" :y="stops[stops.length - 1].y - 44" font-size="12" font-weight="700" fill="#e4002b" letter-spacing="1.5">GOAL</text>
      </svg>

      <div class="quote-card" :style="{ left: (quotePos.x / svgW) * 100 + '%', top: (quotePos.y / svgH) * 100 + '%' }">
        <p class="quote-text">
          87% of digital workers now use AI at work. 75% say it makes them more productive,
          saving them roughly 11 hours each per week through automation alone. Yet only 13% say
          their organization is performing significantly better as a result.
        </p>
        <p class="quote-source">— Work AI Institute 2026</p>
      </div>

      <div class="stops-overlay">
        <button
          v-for="(s, i) in stops"
          :key="s.tab"
          type="button"
          class="stop-card"
          :style="cardStyle(s)"
          @click="emit('navigate', s.tab)"
        >
          <span class="stop-number" :style="{ background: s.color }">{{ i + 1 }}</span>
          <span class="stop-label">{{ s.label }}</span>
          <span class="stop-pct" :style="{ color: s.color, background: `color-mix(in srgb, ${s.color} 14%, transparent)` }">
            {{ s.pct }}%
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  max-width: 1100px;
}

.tab-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.tab-intro__text {
  flex: 1;
}

.tab-intro h2 {
  margin: 0 0 0.4rem;
  color: var(--cgi-grey-900);
}

.tab-intro p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  max-width: 68ch;
}

.overall-pct {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.6rem 1.1rem;
}

.overall-pct__num {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--cgi-purple);
  line-height: 1;
}

.overall-pct__label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.road-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1500 / 560;
}

.road-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.quote-card {
  position: absolute;
  transform: translate(-50%, 0);
  width: 260px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  border-left: 3px solid var(--cgi-grey-500);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  pointer-events: none;
}

.quote-text {
  margin: 0 0 0.4rem;
  font-size: 0.8rem;
  line-height: 1.55;
  color: #333;
  font-style: italic;
}

.quote-source {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
}

.stops-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stop-card {
  position: absolute;
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 230px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--accent);
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1);
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.stop-card:hover {
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.16);
}

.stop-number {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--cgi-white);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stop-label {
  flex: 1;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stop-pct {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
  white-space: nowrap;
}
</style>
