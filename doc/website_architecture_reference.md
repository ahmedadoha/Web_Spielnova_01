# Website Architecture & Content Blueprint
*(Generic reference inspired by a VR / Escape / Experience center website)*

> ⚠️ This document describes **structure, architecture, and content types only**.
> No names, trademarks, texts, or branding are copied.

---

## 1. Global Website Architecture

### 1.1 Global Layout (Shared Across Pages)

- **Top Navigation (Main Menu)**
  - Spielnova (home)
  - Infos
    - Prices & Discounts
    - Vouchers
    - FAQ
    - Tournaments / Giveaways
    - Birthdays & Events
    - Kids Birthday
  - VR Escape Rooms
	- Escape Room Game 1
	- Escape Room Game 2
	- Escape Room Game 3
	- Escape Room Game 4
	- Escape Room Game 5
	- Escape Room Game 6
  - VR Games / Shooter
	- Shooter Game 1
	- Shooter Game 2
	- Shooter Game 3
	- Shooter Game 4
	- Shooter Game 5
	- Shooter Game 6
  - VR Arena Buchen
  - Simulators
  - Arcade Games
  - Kontakt

- ** Title and welcome message: "SpielNova" VR Erlebnis

- **Global Call-To-Action**
  - “Jetzt Buchen” button visible on most pages
  
- ** in the background of the page some videos of VR Games

- ** below the call to action: some short sentences about the Games

- **Footer**
  - Address, phone, email
  - Social media links
  - Legal pages:
    - AGB
    - Impressum
    - Datenschutz
    - Epilepsy Warning

- **Other Global Elements**
  - Cookie consent banner
  - Optional chat / WhatsApp entry

---

## 2. Sitemap Overview

/
├── buchen
├── VR Shooter Games
│   └── experience/<slug>
├── VR Escape Rooms
│   └── experience/<slug>
├── VR Simulators
├── Arcade Games
├── preise
├── gutscheine
├── faq
├── events
│   ├── turniere
│   ├── geburtstag
│   └── kindergeburtstag
├── kontakt
├── agb
├── impressum
├── datenschutz
└── epilepsie

---

## 3. Page-by-Page Content Description

### 3.1 Home Page (/)

Purpose:
Immediate value proposition + funnel users to booking.

Content Blocks:
1. Hero section
2. Intro section
3. Booking concept explanation
4. Category teasers
5. FAQ teaser
6. Prices teaser
7. Final booking CTA

---

### 3.2 Booking Page (/buchen)

- Time-based booking
- Payment options (online / on-site)
- Cancellation policy
- Group booking instructions
- Embedded booking widget or internal booking flow

---

### 3.3 VR Games / Shooter Section (/shooter_games)

- Marketing-focused game presentation
- Detail pages share the same structure as escape rooms

---

### 3.4 Escape Rooms Overview (/escaperooms)

- Category description
- Grid of escape room cards
- CTA to booking

---
### 3.5 VR Simulators

- Category description
- Paraglider: Photos and videos
- Super Fighter: Photos and videos

---
### 3.6 Arcade Games

- Category description
- Photos and videos:  Basketball machine, Air hockey table, Motorcycle game, Helicopter game

---

### 3.7 Experience Detail Pages (/experience/<slug>)

- Hero image
- Title
- Story description
- Duration
- Player count
- Difficulty / intensity
- Booking CTA

---

### 3.7 Info Pages

Prices (/preise):
- Pricing explanation
- Discounts

Vouchers (/gutscheine):
- Gift vouchers
- Redemption explanation

FAQ (/faq):
- Question / answer layout

---

### 3.8 Events Pages (/events/*)

- Tournaments
- Birthdays & corporate events
- Kids birthday offers

---

### 3.9 Contact Page (/kontakt)

- Address
- Phone
- Email
- Opening hours
- Contact form

---

### 3.10 Legal Pages

- AGB
- Impressum
- Datenschutz
- Epilepsy Warning

---

## 4. Recommended Data Model

Experience:
- id
- slug
- type
- title
- description
- duration
- players
- tags

Booking:
- id
- dateTime
- duration
- players
- paymentStatus

---

## 5. Booking Logic

- Time-based booking (recommended)
- Game selection on-site

---

## 6. Architecture Principles

- Data-driven content
- Reusable page templates
- Simple navigation
- Booking isolated from content

---

End of document
