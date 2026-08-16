# CommunityFix — UI/UX Design README

## 0. Design thesis

Most reporting-tool UIs treat the map as decoration and the form as the product. We flip that: **the map is the product, the ripple is the feedback loop.**

The signature pattern — introduced in the logo — is **Ripple Reveal**: every meaningful action in the interface (a new report, a confirmation, a status change) visibly ripples outward from its origin point on the map, the same way the brand mark shows a pin dissolving into concentric rings. This isn't decoration; it's how the product explains its own value in motion — "one report creates spreading impact" — without needing a paragraph of copy to say so.

---

## 1. Design tokens

**Color**
| Token | Hex | Use |
|---|---|---|
| `ink` | `#173A40` | Primary text, pin fills, headers |
| `amber` | `#F2A93B` | Primary action color, "reported" state, CTA |
| `slate` | `#7A94A0` | Secondary text, ripple strokes, borders |
| `paper` | `#F7F5F0` | Background |
| `moss` | `#4C7A5B` | "Resolved" status |
| `rust` | `#C1543C` | "Urgent / long-ignored" status (reports open 30+ days) |

**Type**
- Display: a geometric-humanist sans with some personality (Manrope or Poppins), used bold and large — headlines only
- Body: a clean grotesk (Inter or General Sans) for readability at small sizes
- Data/utility: a monospace (JetBrains Mono or IBM Plex Mono) for coordinates, timestamps, report IDs — signals "this is verifiable data," not just copy

**Spacing & shape**
- 8px base grid
- Radius: 20px on cards/modals (soft, approachable — not fully rounded, not sharp institutional edges)
- Elevation: soft, warm-toned shadows (never pure black) — shadows tinted with `ink` at low opacity

**Motion**
- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo-ish — quick start, gentle settle, feels responsive not floaty)
- Ripple animation: 3 concentric rings, staggered 80ms apart, fading over 900ms
- Respect `prefers-reduced-motion`: ripple becomes a single opacity pulse, no scaling rings

---

## 2. Landing page layout

Map-first, not hero-image-first. The map *is* the hero.

```
┌─────────────────────────────────────────────┐
│  logo          [Report an Issue]  [Browse]   │  ← thin nav, transparent over map
├─────────────────────────────────────────────┤
│                                               │
│         LIVE MAP (full viewport)             │
│         — real pins, real ripple pulses      │
│         — subtle auto-pan/zoom on load        │
│                                               │
│   ┌──────────────────────┐                   │
│   │ "1,204 issues        │  ← floating stat   │
│   │  reported. 340 fixed."│    card, glass bg │
│   └──────────────────────┘                   │
│                                               │
│              [ ▶ See how it works ]           │ ← triggers 3D modal
└─────────────────────────────────────────────┘
```

Below the fold: three short panels (Report → Confirm → Resolve), each with a small looping micro-animation of the ripple pattern, not a numbered "01/02/03" list — the ripple itself communicates sequence, so a literal number badge would be redundant.

---

## 3. The 3D illustration modal (landing page demo)

**Concept:** a stylized isometric street diorama — a small block with a pothole, a dark streetlight, a scattered waste pile. Clicking "See how it works" opens a modal containing this 3D scene. As the user scrolls or clicks through 3 short beats inside the modal, the scene animates itself fixing: the pothole fills in, the streetlight turns on, the waste pile clears — each transition triggered by the same ripple-reveal animation, scaled up to 3D (a literal ripple of light sweeping across the object as it "resolves").

**Interaction flow**
1. User clicks "See how it works" → modal fades in (backdrop blur on `paper`, not pure black scrim) with the 3D scene centered
2. Scene loads with a subtle idle rotation (very slow, ~20s per revolution) so it feels alive without being distracting
3. Three tappable hotspots hover over the pothole, streetlight, and waste pile — each labeled with a small pill ("Pothole", "Streetlight", "Waste")
4. Clicking a hotspot triggers that object's "fix" animation (1.5–2s) plus a light-ripple sweep and a short caption beneath the scene ("Reported → Confirmed by 12 neighbors → Fixed in 9 days")
5. Close button top-right; clicking outside the modal or `Esc` also closes it

**Technical approach**
- Build the 3D scene with **React Three Fiber** (Three.js wrapper for React) since the rest of the stack is already Next.js/React
- Keep the model low-poly / stylized (not photorealistic) — matches the flat, warm brand palette better than realism, and keeps file size and load time down
- Lazy-load the 3D bundle only when the modal is triggered (`next/dynamic` with `ssr: false`), so it never impacts initial page load or Core Web Vitals
- Preload a static poster image (a simple isometric illustration in the same style) as the modal's initial paint, swap to the interactive canvas once Three.js is ready — avoids a blank/loading modal
- **Mobile fallback:** on small screens or low-power devices, replace the interactive 3D canvas with a short looped video/GIF of the same animation sequence — same visual payoff, none of the WebGL performance risk on low-end phones common in the target market
- **Reduced motion:** if `prefers-reduced-motion` is set, skip auto-rotation and animated transitions; hotspots simply swap to a static "after" state on click

---

## 4. Core component patterns

**Pin markers (map)**
- Color-coded by category (pothole = rust, streetlight = amber, waste = moss-adjacent brown, drainage = slate)
- New pins entering the map play the ripple animation once on arrival, then settle to a static dot
- Pins with high upvotes get a subtle pulsing ring (slow, low-opacity) — visually distinguishes "this one matters" without needing a badge or number overlay

**Report card (list/modal view)**
- Photo thumbnail, category pill, status pill (color from token table), relative timestamp in the mono utility face ("Reported 6d ago")
- Upvote button uses the ripple pattern on click — small ring expands from the button, confirms the action landed

**Status pills**
- Reported → amber outline
- In Progress → slate fill
- Resolved → moss fill, with a small checkmark
- Never use red for "reported" — red is reserved for `rust` (long-ignored/urgent), so the palette itself signals neglect over time, not just category

**Buttons**
- Primary: solid `amber`, `ink` text, ripple-on-click micro-interaction
- Secondary: `ink` outline, transparent fill
- No gradients, no drop-shadow-heavy skeuomorphism — flat fills with the tinted-shadow elevation system only

---

## 5. Accessibility & responsiveness

- Full keyboard navigation for map pins, modal, and hotspots (tab order follows visual order; modal traps focus while open)
- Color is never the only signal — status pills carry text labels, not just color
- Minimum 4.5:1 contrast for all text against `paper` and `ink` backgrounds
- 3D modal always has a non-interactive fallback path (poster image or looped video) for reduced-motion and low-power devices
- Map and report form both usable at 320px viewport width; floating stat card stacks below map on mobile rather than overlapping it

---

## 6. Implementation stack notes

- **Framework:** Next.js (App Router) — already the project's chosen stack
- **Styling:** Tailwind, with design tokens above defined as CSS variables / Tailwind theme extensions (not ad hoc hex values in components)
- **3D:** `@react-three/fiber` + `@react-three/drei` for helpers (OrbitControls limited to a gentle auto-rotate, no free-drag to keep the demo focused)
- **Micro-interactions/ripple system:** Framer Motion for 2D UI ripples; a small custom shader or animated ring mesh for the 3D light-ripple sweep
- **Modal:** Radix UI Dialog primitive (accessible focus-trap and escape handling out of the box) styled to match tokens above

---

## 7. What NOT to do

- No numbered "01/02/03" step badges — the ripple motif already encodes sequence and impact
- No generic dashboard-blue-and-white palette — it undercuts the civic/community warmth the brand is built on
- No hyperrealistic 3D — stylized/low-poly keeps load times fast and matches the flat brand palette
- No modal that blocks the page with a hard black scrim — use the warm blurred-paper backdrop so it still feels like part of the same product, not a bolted-on lightbox
