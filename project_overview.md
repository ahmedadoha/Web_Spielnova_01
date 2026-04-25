# Spielnova Repository Overview

This repository contains a modern web application for **Spielnova**, a virtual reality (VR) and entertainment center (located in West Park Ingolstadt). It serves both as a presentation website to showcase their experiences and as a fully integrated online booking platform.

## Technology Stack

- **Framework:** Next.js (App Router), React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS v4, `clsx`, `tailwind-merge`
- **UI Components:** Radix UI primitives (via Shadcn UI pattern), Framer Motion for animations, Lucide React for icons
- **Backend/Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Forms/Validation:** React Hook Form, Zod

## Core Features

1. **Experience Showcases:** Detailed pages for various attractions including VR Shooter Arenas, VR Escape Rooms, Simulators, and Arcade Games.
2. **Online Booking System:** A complete user flow to book slots for specific arenas.
3. **Availability Checking:** Live calculation of available 30-minute timeslots based on existing bookings in the database, with logic to handle opening hours and closed days (e.g., Sundays).
4. **Payment Integration:** Secure checkout via Stripe to finalize bookings.
5. **Responsive & Themed UI:** Includes dark mode support via `next-themes` and a heavily stylized "cyberpunk/neon" aesthetic fitting for a VR arcade.

## Project Structure & Key Files

### `/app` Directory
The core routing directory of the application, utilizing Next.js App Router.

- `page.tsx`: The main landing page featuring a hero section, an introduction to the different game categories, and a call-to-action for the booking system.
- `layout.tsx`: Global layout wrapping all pages, providing the `Navbar`, `Footer`, and Theme settings.
- **Experience Routes:** 
  - `/arcade`, `/escaperooms`, `/shooter_games`, `/simulators`, `/experience` (contains detailed views for individual games).
- **Booking Flow (`/buchen`):** Contains the interactive booking calendar, time slot selection, and checkout initiation form.
- **Information/Legal Routes:**
  - `/agb`, `/datenschutz`, `/epilepsie`, `/impressum`, `/kontakt`, `/oeffnungszeiten`, `/preise`
- **API Routes (`/app/api`):**
  - `/api/availability/route.ts`: Endpoint that generates available time slots for a given date, fetches existing bookings from Supabase, and calculates which slots are free for the arenas.
  - `/api/bookings/confirm/route.ts`: Endpoint that handles successful Stripe checkout sessions, updating the booking status in the database to 'confirmed'.

### `/components` Directory
Contains all reusable React components.

- `/ui`: Atomic UI components built with Radix UI (e.g., Button, Dialog, Select, Popover).
- **Core Components:**
  - `hero-section.tsx`: The animated introduction banner on the homepage.
  - `game-card.tsx`: Reusable cards to display game information with images and stats (duration, players, difficulty).
  - `navbar.tsx` & `footer.tsx`: Navigation and footer elements.
  - `mode-toggle.tsx` & `theme-provider.tsx`: Theme management components.

### `/lib` Directory
Configuration and utility files.

- `supabase.ts`: Initializes and exports the Supabase client.
- `stripe.ts`: Initializes and exports the Stripe client.
- `utils.ts`: Helper functions (e.g., Tailwind class merging).

### `/supabase` Directory
Database configuration.

- `schema.sql`: Contains the SQL script to generate the necessary `bookings` table. It defines columns such as `start_time`, `end_time`, `arena_id`, `customer_name`, `status`, and `payment_id`, and sets up basic Row Level Security (RLS) policies allowing public read and insert access for the booking flow.

### Configuration Files
- `package.json`: Defines the scripts (`dev`, `build`, `start`) and dependencies.
- `next.config.ts`, `tailwind.config.ts` / `postcss.config.mjs`, `tsconfig.json`: Standard configuration for Next.js, styling, and TypeScript.

## Summary of the Data Flow (Booking)

1. The user navigates to `/buchen` and selects a date.
2. The frontend calls `/api/availability?date=...`.
3. The API generates potential time slots based on opening hours and queries Supabase to filter out already booked slots.
4. The user selects an available time slot and submits their details.
5. A Stripe Checkout session is created (handled by a backend route not fully detailed here, likely within a `POST` to `/api/bookings`).
6. After payment, the user is redirected back, and `/api/bookings/confirm` validates the Stripe session and marks the Supabase booking record as `confirmed`.
