# Golden Hour Studio — Photography Booking Website

An original, fully functional booking website for a fictional photography studio: a home page with filterable galleries and a working lightbox, a sessions & pricing page where every package states its length, photo count, and full price, and a booking page where package, date, time slot, and add-ons update a live summary — ending in a real confirmation with a booking reference.

**Live demo:** https://brittanynation.github.io/golden-hour-studio/
- Home & Gallery: https://brittanynation.github.io/golden-hour-studio/
- Sessions & Pricing: https://brittanynation.github.io/golden-hour-studio/sessions.html
- Book a Session: https://brittanynation.github.io/golden-hour-studio/book.html

## Roles this supports

Built to support applications for **Front-End Designer**, **Web Designer**, and **Website Designer** roles — front-end design work: designing websites and building them with real code.

## What it demonstrates

- **Booking information architecture** — one job per page: Home ("what does their work look like"), Sessions ("what does each session include and cost"), Book ("pick, price, and confirm in one pass")
- **A booking flow that actually works** — package cards update the price live; choosing a date generates that day's start times with two honestly marked as booked; add-on checkboxes update the total, the 25% deposit, and the session-day balance in the summary as you go
- **Honest availability and rules, in the UI** — booked slots are crossed out and disabled, past dates are rejected, and Sundays (studio closed) return a plain-word error instead of silently failing
- **Real validation and a real end state** — name, email, and phone validate inline with specific messages; a valid booking ends in a confirmation panel with a generated booking reference (e.g. GH-XXXXXX), the full session details, and the deposit/balance split, and the booking is saved in the browser (localStorage)
- **A gallery that works, not a grid that poses** — category filters (Family / Portrait / Branding) actually filter the six galleries, and the lightbox steps through the *filtered* set with Previous/Next buttons, arrow keys, and Escape to close
- **Choices carry across pages** — "Book this session" on the Sessions page preselects that package in the booking form (URL parameter + localStorage)
- **Accessibility-minded choices** — selected states use words and weight, never colour alone; `aria-pressed` on package, slot, and filter buttons; real labels on every field; skip link, `aria-current` navigation, live-region status announcements, and native `<details>` FAQs
- **Responsive layout** — package, gallery, and note grids step down cleanly on small screens, and the booking summary stacks below the form on mobile
- **Semantic, framework-free build** — hand-written HTML/CSS with vanilla JavaScript for all booking and gallery logic, one stylesheet, no external images; all visuals are CSS gradients

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Amber Glow | `#D98E2B` | Golden-hour accent, stat band, primary actions, prices |
| Charcoal Ink | `#25211C` | Header, headings, summary panel, footer |
| Warm Cream | `#FDF6E9` | Page background |
| Olive Grove | `#66704A` | Confirmation state, nature/gallery accents |
| Clay Rose | `#B65D4A` | Portrait accents, dusk gradient |
| Soft Sand | `#EADFC6` | Chips, soft surfaces |

## Contents

| Page | What it covers |
| --- | --- |
| `index.html` | Home & Gallery — hero with pricing promise, at-a-glance stat band, six filterable galleries with a working lightbox, and a three-step how-booking-works section |
| `sessions.html` | Sessions & Pricing — four session cards, a side-by-side comparison table, add-ons priced in the open, and plain-word FAQs |
| `book.html` | Book a Session — package picker, date + generated time slots, group size and location, priced add-ons, validated details form, live summary with deposit/balance, and a confirmation state |

## Workflow note

My design workflow runs in **Sketch and Webflow**, where I design websites and systems visually. This demo is hand-built in HTML/CSS/JS to show the same front-end design thinking — honest pricing, real availability, and plain words — expressed directly in code.

## Files

- `index.html` — home & gallery page for the concept
- `sessions.html` — sessions & pricing page
- `book.html` — booking page with confirmation state
- `styles.css` — design tokens and all component styles
- `studio.js` — gallery filter + lightbox, package/slot/add-on state, live totals, validation, and confirmation logic
- `og-image.png` — 1200×627 social preview image in the project palette

## Note

This is an original portfolio concept created by Brittany Nation. Golden Hour Studio is a fictional business; this project is not affiliated with any real photography studio. All names, prices, availability, and figures shown are sample data, and the site takes no real bookings and processes no payments — bookings are stored only in the visitor's browser.
