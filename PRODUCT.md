# Sekar Jagad 43 — Product Definition

## Brand Identity

| Field | Value |
|-------|-------|
| **Company** | Sekar Jagad 43 |
| **Industry** | Hajj & Umrah Services — Airport Handling |
| **Market** | Indonesian travel agencies, B2B partnerships |
| **Founded** | 2015 |
| **Register** | product (design serves operation, not vice versa) |
| **Platform** | web |

## What It Does

Airport ground-handling logistics for umrah travel groups across Saudi Arabia (Jeddah, Makkah, Madinah).

**Core services:**
- Express immigration processing
- Baggage handling, porter service
- Ground transport coordination
- Catering provision
- 24/7 guest assistance

**Business model:** B2B. Travel agencies book per-pax pricing (95–100 SAR). All contact via WhatsApp; no online booking system.

## User Personas

1. **Travel Agency Manager**
   - Age 35–55, Indonesian travel operator
   - Needs proof of reliability, experience, local expertise
   - Decision-making window: fast (calls/WA)
   - Pain: coordination complexity, last-minute changes

2. **Admin/Receptionist**
   - Handling day-to-day inquiries via WhatsApp
   - Needs simple, clear pricing & service breakdowns to quote fast

## What This Website Must Do

1. **Build trust** — "We've been here 9+ years, handled 50k+ guests"
2. **Clarify service tiers** — Show what's included in each price point (95 vs 100 SAR)
3. **Drive leads** — Easy WhatsApp contact, clear CTA on every section
4. **Show legitimacy** — Gallery (future: real photos), testimonials from known travel brands

## Current State Issues

**Design debt:**
- Palette = AI default (navy+cream+gold saturation 2026)
- Identical 6-card grid (services) — no differentiation
- Serif display font overused (all headings)
- Scaled "featured" package card (105%) is visual noise
- Section eyebrows (.section-tag) — uppercase + tracking = 2023 AI scaffold

**Content gaps:**
- Gallery = placeholders only
- Testimonials = 3 hardcoded (should scale)
- Blog/services pages referenced but not built

**UX friction:**
- Hero stats gap (60px) wastes space on tablet
- CTA buttons stack inconsistently mobile
- No form—only WhatsApp (fine for B2B, but no capture path)

## Success Metrics

✅ **Loaded in <3s** (currently unoptimized images)  
✅ **WCAG AA contrast** minimum  
✅ **Mobile-first responsive** tested at 3 breakpoints  
✅ **No eyeballs think "AI template"** (palette + grid + motion audit)  
✅ **WhatsApp CTA visible above fold** on every device  

## Scope

- Homepage + about + gallery + FAQ pages only
- No backend, no form processing, no new pages
- CSS/HTML refactor → style.css only (responsive digabung di dalamnya)
- JS improvements: animations, motion, interactivity
- Design system: tokens, palette, typography

---

*Priority: Design taste + motion + visual hierarchy overhaul. Ship clean, bold, human-made look.*
