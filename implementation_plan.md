# Implementation Plan - Spielnova VR Website

## Goal Description
Create a premium, high-performance website for **Spielnova**, a VR entertainment center. The website will serve as a marketing platform to showcase experiences (VR Shooters, Escape Rooms, Simulators) and a functional booking engine for the 2 VR arenas.
Key goals:
- **Premium Aesthetic**: "Wow" factor with animations, dark mode, and vibrant colors.
- **Booking System**: Online booking for VR Arenas (Time slots + Payment).
- **Informational**: Clear presentation of games, prices, and contact info.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Selection**: I am proposing **Next.js 14+ (App Router)** with **Tailwind CSS** and **Supabase** (PostgreSQL) for the backend/database.
> **Payment Provider**: I propose **Stripe** for handling online payments. You will need a Stripe account.
> **Booking Logic**: We will build a custom booking flow specific to your "2 Arenas" constraint.

## Proposed Architecture & Tech Stack

### Frontend
- **Framework**: Next.js (React) - for SEO, performance, and server-side rendering.
- **Styling**: Tailwind CSS - for rapid, custom styling.
- **Animations**: Framer Motion - for the "dynamic" and "premium" feel.
- **UI Library**: Shadcn/ui (Radix Primitives) - for accessible, high-quality components.
- **Icons**: Lucide React.
- **Fonts**: Modern sans-serif (e.g., *Inter* or *Outfit*) to match the VR/Tech theme.

### Backend / Data
- **Database**: Supabase (PostgreSQL). We need to store:
    - **Bookings**: (Date, Time, Arena ID, Customer Details, Payment Status).
    - **Games/Experiences**: (Title, Description, Type, Images - *optional, can be hardcoded initially as per your doc, but DB is better for scaling*).
- **API**: Next.js API Routes (Serverless functions).
- **Payment**: Stripe Checkout (Secure, easy integration).

### Website Structure (Sitemap Implementation)
Based on your architecture document:
1.  **Home** (`/`)
2.  **Booking** (`/buchen`)
3.  **Experiences**:
    -   `/shooter_games` + `/experience/[slug]`
    -   `/escaperooms` + `/experience/[slug]`
    -   `/simulators`
    -   `/arcade`
4.  **Info**: `/preise`, `/gutscheine`, `/faq`, `/events/*`
5.  **Contact**: `/kontakt`
6.  **Legal**: `/agb`, `/impressum`, `/datenschutz`, `/epilepsie`

## Step-by-Step Approach

### Phase 0: Environment & Account Setup (Pre-requisites)
Since you are new to web development, this phase ensures you have the necessary tools and accounts.

#### 1. Software Installation
*   **VS Code**: You are likely already using this. It's the code editor.
*   **Node.js (LTS Version)**: Required to run the website.
    *   *Action*: Open your terminal (PowerShell) and type `node -v` to check if it's installed. If not, download the "LTS" version from [nodejs.org](https://nodejs.org/).
*   **Git**: Version control system.
    *   *Action*: Type `git --version` in terminal. If not installed, download from [git-scm.com](https://git-scm.com/).

#### 2. Service Accounts (You need to create these)
*   **Supabase (Database)**:
    1.  Go to [supabase.com](https://supabase.com/) and "Start your project".
    2.  Sign up (GitHub account recommended).
    3.  Create a new project named "Spielnova".
    4.  **Save the Database Password!** You will need it later.
    5.  Once created, find the `Project URL` and `API Key (anon/public)` in Project Settings > API.
*   **Stripe (Payments)**:
    1.  Go to [stripe.com](https://stripe.com/) and Sign up.
    2.  This will be used for testing payments initially (Test Mode).
    3.  Get your `Publishable Key` and `Secret Key` from the Developers > API Keys section.

### Phase 1: Foundation & Design
1.  **Setup Project**: Initialize Next.js project.
2.  **Design System**: Configure Tailwind colors (Neon/Dark theme), Fonts, and Animations.
3.  **Global Layout**: Build the Navigation Bar (responsive) and Footer.

### Phase 2: Core Pages (Static Content)
1.  **Home Page**: High-impact Hero section, Category teasers.
2.  **Experience Pages**:
    -   Create a reusable "Experience Detail" template.
    -   Populate contents for Shooters and Escape Rooms.
    -   Create showcases for Simulators and Arcade (non-bookable).
3.  **Info Pages**: Implement standard pages (Pricing, FAQ, Contact).

### Phase 3: Booking System (The "Engine")
1.  **Database Setup**: Create Supabase project and `bookings` table.
2.  **Booking API**: Create endpoints to:
    -   `GET /api/availability`: Check free slots (30-min intervals) for Arena 1 & 2.
    -   `POST /api/create-booking`: Reserve a slot.
    -   **Rules**:
        -   Mon-Fri: 14:00-20:00, Sat: 10:00-20:00, Sun: Closed.
        -   Slot Length: 30 minutes.
        -   Price: 15€ (Weekday) / 20€ (Saturday) per player.
        -   Capacity: Max 4 players per arena. If > 4, require 2 arenas.
3.  **Frontend Logic**:
    -   **Step 1**: Choose Mode (Shooter vs Escape).
    -   **Step 2**: Choose Game (Video preview in new tab).
    -   **Step 3**: Select Player Count & Time.
    -   **Step 4**: User Details & Payment.
    -   Form for user details.
4.  **Stripe Integration**:
    -   Create Checkout Session on booking.
    -   Redirect user to Stripe.
    -   Handle success/cancel callbacks.
    -   Verify session and update Booking status to 'confirmed'.

### Phase 4: Verification & Polish
1.  **Testing**: Verify booking flow, mobile responsiveness.
2.  **SEO**: Add metadata, OpenGraph tags.
3.  **Deploy**: Deploy to Vercel (recommended) or your preferred host.

## Verification Plan

### Automated Tests
- We will verify the build using `npm run build`.
- We will use `npm run lint` to accept code quality.

### Manual Verification
- **Booking Flow**: I will simulate a booking process (using Stripe Test Mode) to ensure:
    -   Slots are correctly blocked after booking.
    -   Confirmation emails (mocked or real) are triggered.
    -   Payment status is updated.
- **Responsive Check**: Verify layout on Mobile vs Desktop sizes.
- **Visual Check**: Ensure animations are smooth and the "premium" feel is achieved.
