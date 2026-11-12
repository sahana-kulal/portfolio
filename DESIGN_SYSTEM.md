# Sahana Kulal — Portfolio Design System

> Direction: **Bold & Creative** · Violet → Cyan gradients · Serif display + sans · Dark + Light · Rich but purposeful motion
> Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion + Lenis** · Deploy: **Vercel**

---

## 1. Design principles

1. **Engineering made visible.** Every project is shown as an animated system (data flowing, robots moving, queries healing) rather than as a screenshot.
2. **Bold surface, calm structure.** Expressive gradients and big serif type sit on a strict grid with generous whitespace.
3. **Motion explains.** Every animation either shows how something works or guides attention. No decoration-only loops.
4. **Numbers are heroes.** Metrics (1000+, 99.9%, 90%, 95%) get large type and count-up animation.
5. **Fast and accessible.** LCP < 2s, everything respects `prefers-reduced-motion`, WCAG AA contrast in both themes.

---

## 2. Colour

### Brand
| Token | Value | Use |
|---|---|---|
| `--violet` | `#7C3AED` (light theme: `#6D28D9`) | Primary, LLM project |
| `--blue` | `#3B82F6` (light: `#2563EB`) | Mid-gradient, MTS project |
| `--cyan` | `#06B6D4` (light: `#0891B2`) | Secondary, Sanjaya project |
| `--pink` | `#F472B6` | Sparing accent: highlights, cursor glow |
| `--success` | `#22C55E` | "validated", "online" states in mockups |
| `--danger` | `#F43F5E` | "failed → retry" states in mockups |

**Signature gradient**
```css
--gradient-brand: linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #06B6D4 100%);
--gradient-text:  linear-gradient(90deg,  #A78BFA 0%, #60A5FA 50%, #22D3EE 100%); /* brighter, for text on dark */
```

### Neutrals (semantic tokens, switched by theme)
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0A0A12` | `#FAFAFC` |
| `--surface` | `#12121C` | `#FFFFFF` |
| `--surface-2` | `#1A1A28` | `#F1F1F6` |
| `--border` | `rgba(255,255,255,0.08)` | `rgba(10,10,18,0.08)` |
| `--text` | `#F4F4F8` | `#0A0A12` |
| `--text-muted` | `#A1A1B5` | `#4B4B5E` |
| `--text-subtle` | `#6B6B80` | `#8A8A9C` |

### Per-project tint (all within the brand palette)
| Project | Lead colour | Gradient |
|---|---|---|
| Sanjaya Analytics | Cyan | cyan → blue |
| Material Tracking System | Blue | blue → violet |
| LLM Reporting Workflow | Violet | violet → pink |

Backgrounds use 2–3 slowly drifting **blurred gradient blobs** (opacity 0.25 dark / 0.15 light) plus a fine **noise texture** (≈3% opacity) so the gradients don't band.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display | **Instrument Serif** (regular + *italic*) | Hero, section titles, big metrics. Italic + gradient for emphasis words. |
| Body / UI | **Inter** (variable) | Paragraphs, nav, buttons |
| Mono | **JetBrains Mono** | Labels, tags, metric units, code/SQL in mockups |

Loaded via `next/font` (self-hosted, no layout shift).

### Fluid scale
| Token | Size | Font |
|---|---|---|
| `display-xl` | `clamp(3.5rem, 11vw, 10rem)`, lh 0.9, tracking -0.03em | Serif (hero name) |
| `display-lg` | `clamp(2.75rem, 6vw, 5.5rem)`, lh 1.0 | Serif (section titles) |
| `display-md` | `clamp(2rem, 4vw, 3.5rem)`, lh 1.05 | Serif (project titles, metrics) |
| `h3` | `1.5rem`, lh 1.3, weight 600 | Inter |
| `body-lg` | `1.25rem`, lh 1.6 | Inter |
| `body` | `1rem`, lh 1.65 | Inter |
| `label` | `0.75rem`, uppercase, tracking 0.12em | JetBrains Mono |

Section titles follow one pattern: a mono label (`01 — EXPERIENCE`), then a serif title with one gradient-italic word.

---

## 4. Layout & spacing

- **Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192
- **Container:** max-width 1280px, side padding `clamp(1.25rem, 5vw, 4rem)`
- **Grid:** 12 columns desktop / 4 columns mobile, 24px gutter
- **Section rhythm:** `padding-block: clamp(6rem, 15vh, 12rem)`
- **Radius:** `sm 8px` · `md 14px` · `lg 24px` · `full`
- **Breakpoints:** Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`)

### Surfaces
- **Glass card:** `--surface` at 60% opacity + `backdrop-blur(16px)` + 1px `--border` + inner top highlight
- **Gradient border:** 1px gradient ring (mask technique) for featured cards and the project-mockup frames
- **Glow:** `box-shadow: 0 0 80px -20px var(--project-color)` on active project visuals

---

## 5. Motion

### Tokens
| Token | Value | Use |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default reveals |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Morphs, pinned transitions |
| `spring` | `{ stiffness: 300, damping: 30 }` | Hover, cursor, toggles |
| `dur-fast` | 150ms | Hover/press |
| `dur-base` | 400ms | UI transitions |
| `dur-slow` | 800ms | Section reveals |
| `dur-hero` | 1200ms | Hero type entrance |
| `stagger` | 60ms (letters 30ms) | Lists, split text |

### Patterns
- **Reveal:** fade + 24px rise + slight blur(8px→0), triggered once at 20% in view
- **Split-text:** headings animate per word (hero: per letter) with a masked slide-up
- **Count-up:** metrics animate 0 → value over 1.6s with ease-out-expo when in view
- **Scroll-linked:** Framer `useScroll` + `useTransform` drives the timeline line
- **Smooth scroll:** Lenis (`lerp 0.1`), disabled on touch devices and under reduced motion
- **Custom cursor:** 12px dot + 40px trailing gradient ring (spring). Grows to 80px with a "View" label over projects; hidden on touch devices.
- **Reduced motion:** all reveals become simple opacity fades, pinned stories become static stacked blocks, blobs stop moving, cursor and Lenis turn off.

---

## 6. Page structure (single page)

```
┌ Nav (sticky, glass) ─ KB logo · About · Experience · Work · Skills · Contact · ◐ theme · Resume ↓
│
├ 00 HERO ── kinetic typography
│   "Kaishav" / "Basodiya" (serif, display-xl), letters animate in, morph on hover
│   Rotating role line: "Software Engineer → builds robot analytics → ships AI workflows"
│   Gradient blobs follow the cursor slowly · scroll cue
│
├ 01 ABOUT ── short bio + 3–4 headline metric tiles (count-up)
│   1000+ users · 99.9% uptime · 90% less manual work · 95% query success
│
├ 02 EXPERIENCE ── vertical scroll-drawn timeline
│   ArtSpot (2023) → Ati Motors Intern (2024) → Ati Motors SWE (2024–now)
│   Line fills with gradient as you scroll; each node expands with role, dates, highlights, tech chips
│   Intern-era work (UI library, HMI, React Native app) lives here
│
├ 03 SELECTED WORK ── 3 project stories (see §7)
│
├ 04 SKILLS ── grouped clusters (Languages · Frontend · Backend · Data · DevOps)
│   Chips with hover glow; two slow opposing marquees of tech names behind
│
├ 05 CONTACT ── giant serif CTA "Let's build something."
│   Email (click to copy) · LinkedIn · GitHub · LeetCode · Download Resume
│
└ Footer ── © 2026 · built with Next.js · local time in Bengaluru
```

---

## 7. Project stories (click/autoplay steps, stylised NDA-safe mockups)

Layout: **left = text steps** (title, role/stack chips, 3 steps that highlight in turn), **right = animated visual** that changes state per step. Each project is one viewport tall; steps change on click or autoplay (every 3s while in view), not on scroll. On mobile: the visual sits on top, steps stack below.

### A. Sanjaya: Analytics & Monitoring Platform (cyan)
Visual: a stylised **analytics dashboard** in a browser frame.
1. **Built from scratch:** the dashboard skeleton assembles (sidebar, KPI cards, chart panels slide in)
2. **Fast React + Zustand:** charts draw (line path stroke, bars grow, a utilization heatmap fills in); a "load time −40%" badge appears
3. **Live at scale:** a "LIVE" dot pulses, the data streams, and counters show **1000+ users** and **99.9% uptime**

### B. Material Tracking System (blue)
Visual: a top-down **factory floor map** with staging areas.
1. **Full-stack architecture:** layered diagram (React → FastAPI → PostgreSQL / Redis → external servers) with packets flowing
2. **Request fulfilment logic:** a material request card fires, a staging area highlights, a container is picked, and a trip is booked
3. **Automation:** a robot icon travels the path and delivers, then the counter **90% less manual intervention** appears

### C. LLM-Powered Reporting Workflow (violet)
Visual: an **n8n-style node graph**.
1. **Natural language in:** a prompt types itself ("Weekly robot utilization by site…") into an LLM-agent node with a memory badge
2. **Self-healing SQL:** SQL types out, goes to the MCP validate node, fails (red), loops back to retry, then passes (green) → **95% success**
3. **Delivered everywhere:** a cron trigger fires and the report fans out to Email / Webhook / Chat icons → **100+ users · 65% fewer errors**

All mockups are built with **SVG + Framer Motion** (no images or video), so they stay sharp, adapt to the theme, and stay light to load.

---

## 8. Components

| Component | Notes |
|---|---|
| `Nav` | Sticky glass bar, hides on scroll down and shows on scroll up, active-section indicator |
| `ThemeToggle` | Sun/moon morph, uses `next-themes`, no flash on load |
| `SectionHeader` | Mono index label + serif title with gradient-italic word |
| `SplitText` | Word/letter split reveal |
| `Counter` | In-view count-up with suffix/prefix |
| `MetricTile` | Big serif number + mono label, glass card |
| `Chip` | Tech tag, mono, hover glow |
| `GlassCard` / `GradientBorder` | Surface primitives |
| `TimelineItem` | Node + content, scroll-linked activation |
| `ProjectStory` | Full-screen container, click/autoplay step tracking, renders a `visual` component per step |
| `SanjayaVisual` / `MtsVisual` / `LlmVisual` | Step-driven SVG mockups |
| `Cursor` | Custom cursor with hover-state context |
| `GradientBlobs` | Animated background |
| `Button` | Primary (gradient fill), Ghost (border), Link (underline-slide) |

---

## 9. Proposed file structure

```
portfolio/
├─ app/
│  ├─ layout.tsx          fonts, ThemeProvider, Lenis, Cursor
│  ├─ page.tsx            sections in order
│  └─ globals.css         CSS variables (tokens), base styles
├─ components/
│  ├─ ui/                 Button, Chip, GlassCard, Counter, SplitText…
│  ├─ layout/             Nav, Footer, Cursor, GradientBlobs, ThemeToggle
│  ├─ sections/           Hero, About, Experience, Projects, Skills, Contact
│  └─ visuals/            SanjayaVisual, MtsVisual, LlmVisual
├─ content/
│  └─ data.ts             all text: bio, experience, projects, skills, links
├─ lib/                   motion tokens, hooks (useReducedMotion, useActiveSection)
├─ public/
│  └─ Sahana_Resume.pdf
└─ tailwind.config.ts     maps tokens → Tailwind theme
```

All copy lives in `content/data.ts`, so you can edit text without touching components.
