# Design system & UI consistency — Auryn

**Mandatory** rules for all client-facing work: web, mobile, dashboards, AI chat, recovery flows, onboarding, and admin panels. The goal is **one** visual and interaction language — a next-generation personalized wellness operating system — **not** a collection of disconnected screens.

---

## Unified visual identity

All surfaces must share:

- The same **spacing system**
- The same **typography scale**
- The same **border radius** tokens
- The same **shadow** tokens
- The same **card** patterns
- The same **icon** style (family, stroke/fill, sizing)
- The same **animation** behavior (duration, easing, reduced-motion respect)
- The same **interaction** patterns (focus, hover, press, disabled states)

Avoid feature-specific one-offs that break rhythm or introduce competing patterns.

---

## Color system

- **Centralize** the palette in theme configuration (e.g. Tailwind `theme.extend.colors` or CSS variables consumed by Tailwind).
- Use **semantic names** only in components — never arbitrary hex/rgb in JSX/CSS modules except in the token definition layer.

### Recommended semantic tokens (extend as needed)

| Token        | Typical role                                      |
| ------------ | ------------------------------------------------- |
| `primary`    | Brand emphasis, key actions                       |
| `secondary`  | Supporting actions, secondary surfaces           |
| `background` | App canvas                                        |
| `surface`    | Cards, panels, elevated regions                  |
| `muted`      | De-emphasized text, subtle fills                  |
| `accent`     | Highlights, wellness accents (use sparingly)    |
| `success`    | Positive confirmation                             |
| `warning`    | Caution, non-blocking alerts                      |
| `error`      | Errors, destructive emphasis                      |
| `border`     | Dividers, outlines                                |

### Do not

- Scatter random hex values inside components
- Introduce inconsistent shades per feature
- Let “local” palettes diverge from global tokens

---

## Typography

- Enforce a **clear heading hierarchy** (e.g. display / h1–h4 / body / caption) via theme + reusable components or utility classes.
- Preserve **readability** (line length, line-height, contrast) and **accessibility** (minimum contrast, scalable type, respect for system font scaling on mobile).

---

## Component system

Build **reusable primitives** and compose screens from them. Shared UI should power at minimum:

- Cards  
- Buttons  
- Inputs  
- Chat bubbles  
- Metrics  
- Recovery widgets  
- AI insight panels  
- Modals  
- Navigation  

**Prefer composition** over copy-pasted styling. Duplicated layout/styling should trigger a refactor toward shared primitives.

---

## Mobile-first

- **All layouts start mobile-first**, then enhance for larger breakpoints.
- Aim for **consistent** behavior and density across **iOS**, **Android**, and **web** (within platform conventions — use native primitives on mobile where appropriate, but tokens and semantics stay aligned).

---

## Design philosophy

Auryn should feel:

- Calm, intelligent, **premium**, modern  
- Wellness-centered, **emotionally comfortable**  
- **Minimal but powerful**  

Implementation should reinforce that identity in every screen.

---

## Implementation guidance

- **Tailwind:** extend `theme` for colors, spacing, radii, shadows, font sizes, and motion; reference tokens in markup (`bg-surface`, `text-muted`, etc.) — not raw values in feature code.
- **Primitives first:** e.g. `Button`, `Card`, `Text`, `Input`, `Modal`, `ChatBubble` — thin wrappers around tokenized styles.
- **Scalable architecture:** colocate design-system primitives in a dedicated package or folder (e.g. `packages/ui` or `apps/web/src/components/ui`) as the monorepo matures.

---

## PR checklist (UI)

- [ ] No hardcoded colors outside token/theme definitions  
- [ ] Spacing, type, radius, shadow from shared scale  
- [ ] New UI reuses existing primitives or extends them deliberately  
- [ ] Mobile-first layout verified  
- [ ] Contrast and focus states acceptable for accessibility  

---

## Related

- Agent summary: `AGENTS.md`  
- Product reference: *Auryn / PhysicianOS Design & Product Flow* (in-repo spec)  
