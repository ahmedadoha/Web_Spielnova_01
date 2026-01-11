# Spielnova Website - Verification Walkthrough

This document guides you through verifying the features of the new Spielnova website.

## 1. How to Start the Website (For Testing)
If you haven't started the website yet, follow these steps:
1.  Open your terminal (PowerShell or Command Prompt).
2.  Navigate to the folder: `cd C:\github\Web_Spielnova_01`
3.  Run this command to start the server: `npm run dev`
4.  Wait for it to say "Ready" (about 5-10 seconds).
5.  Open your web browser (Chrome, Edge, Safari) and go to: **[http://localhost:3000](http://localhost:3000)**

## 2. Prerequisites
- [x] **Database**: `bookings` table created in Supabase.
- [x] **Payments**: Stripe Test Keys configured in `.env.local`.
- [x] **Server**: Ensure the dev server is running (`npm run dev`).

## 2. Feature Checklist & Testing Steps

### A. Booking System (The Core Feature)
1.  **Navigate to Booking**: Click "Jetzt Buchen" on the Home Page or "Buchen" in the menu.
2.  **Step 1: Game Selection**:
    -   Select "VR Shooter" or "VR Escape Room".
    -   Choose a specific game (e.g., "Zombie Apocalypse").
    -   *Observe*: Selection should highlight under Neon effect.
3.  **Step 2: Options**:
    -   Select **4 Players** (Standard).
    -   Select a **Date** (e.g., next Saturday).
    -   *Observe*: 
        -   Price should update (20€/person on Sat = 80€ total).
        -   Available time slots appear below.
    -   *Test*: Select **6 Players**. Warning about "2 Arenas" should appear.
4.  **Step 3: Details & Payment**:
    -   Enter Name and Email.
    -   Click "Jetzt Buchen & Bezahlen".
    -   *Expected*: Redirect to **Stripe Checkout** page.
5.  **Step 4: Payment (Test Mode)**:
    -   Use Stripe Test Card: `4242 4242 4242 4242`, Exp: `12/30`, CVC: `123`.
    -   Complete payment.
    -   *Expected*: Redirect back to `/buchen/success` with a "Buchung Bestätigt" message.

### B. Content & Design
1.  **Home Page**:
    -   Check the Hero Animation (Neon visuals).
    -   Verify "Öffnungszeiten" link works.
2.  **Opening Hours**:
    -   Verify the table matches the documented hours (Mon-Fri 14-20, Sat 10-20, Sun Closed).
3.  **Legal Pages**:
    -   Check Footer links: Impressum, Datenschutz, AGB.
4.  **Mobile Responsiveness**:
    -   Resize browser window to mobile width.
    -   Verify the **Hamburger Menu** works in the Navbar.
    -   Ensure cards stack vertically.

## 3. Known Limitations (MVP)
-   **Emails**: Confirmation emails are not actually sent (requires an email service like Resend/SendGrid).
-   **Real Payments**: Currently in Test Mode. Switch keys in `.env.local` to Live keys for production.
-   **Admin Dashboard**: Not built yet (bookings can be viewed in Supabase Dashboard).

## 4. Next Steps
-   [ ] Deploy to Vercel (Production).
-   [ ] Swap Stripe Keys to Live Mode.
-   [ ] Add Email Service (optional but recommended).
