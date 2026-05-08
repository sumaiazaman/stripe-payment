# Stripe Payment Gateway

A complete Stripe payment integration built with Next.js, MySQL, and Prisma. This guide walks you through everything from zero to a fully working payment system — both locally and in production.

---

## Quick Start (5 minutes)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd stripe-payment

# 2. Install dependencies
npm install

# 3. Copy environment files and fill in your values
cp .env.example .env
cp .env.local.example .env.local

# 4. Create MySQL database named: stripe_payment (via phpMyAdmin)

# 5. Create database tables
npx prisma db push

# 6. Start the app
npm run dev
```

Open **http://localhost:3000** — done.

> For webhooks and full local testing, follow the detailed guide below.

---

## What You Will Build

- Product landing page with pricing
- Stripe-powered checkout form
- Payment status tracking (`pending` → `completed` → `failed`)
- Webhook integration for real-time status updates
- MySQL database to persist all payment records
- Live debug monitor to watch payments in real time

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | Frontend + API routes |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| Stripe | Payment processing |
| MySQL | Database |
| Prisma ORM | Database client |
| Stripe CLI | Local webhook forwarding |

---

## Prerequisites

Before starting, make sure you have:

- [ ] **Node.js >= 20.9.0** — check with `node --version`
- [ ] **npm** — check with `npm --version`
- [ ] **MySQL** running locally (phpMyAdmin recommended)
- [ ] **A Stripe account** — free at https://stripe.com

---

# PART 1 — LOCAL SETUP

---

## Step 1 — Get Your Stripe API Keys

1. Go to **https://dashboard.stripe.com**
2. Click **Developers** (top right corner)
3. Click **API Keys** in the left sidebar
4. You will see two keys — copy both:

```
Publishable key:  pk_test_xxxxxxxxxxxxxxxxxxxx
Secret key:       sk_test_xxxxxxxxxxxxxxxxxxxx  ← click "Reveal" to see it
```

> These are **test keys** — no real money is charged.

---

## Step 2 — Create MySQL Database

1. Open **http://localhost/phpmyadmin** in your browser
2. Click **New** in the left sidebar
3. Enter database name: `stripe_payment`
4. Click **Create**

---

## Step 3 — Install Node.js 22 (if not installed)

Check your Node version:

```bash
node --version
```

If it is below 20, install Node 22 via nvm:

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc

# Install and use Node 22
nvm install 22
nvm use 22
nvm alias default 22
```

Verify:

```bash
node --version
# v22.x.x
```

---

## Step 4 — Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd stripe-payment
npm install
```

---

## Step 5 — Configure Environment Variables

### Create `.env` file (database connection)

```bash
touch .env
```

Add this content — replace `YOUR_PASSWORD` with your MySQL password:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/stripe_payment"
```

Example with password `123456`:

```env
DATABASE_URL="mysql://root:123456@localhost:3306/stripe_payment"
```

### Create `.env.local` file (Stripe keys)

```bash
touch .env.local
```

Add this content — replace with your actual keys from Step 1:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

> You will get the `STRIPE_WEBHOOK_SECRET` in Step 8. Leave it as a placeholder for now.

---

## Step 6 — Setup Database Tables

Run this command to create the `Payment` table in MySQL:

```bash
npx prisma db push
```

Expected output:

```
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

Verify in phpMyAdmin:
- Open `http://localhost/phpmyadmin`
- Click `stripe_payment` database
- You should see a `Payment` table

---

## Step 7 — Start the Dev Server

```bash
npm run dev
```

App is now running at **http://localhost:3000**

---

## Step 8 — Install Stripe CLI & Get Webhook Secret

The Stripe CLI forwards Stripe webhook events to your local machine. Without it, payment status won't update from `pending` to `completed` via webhooks (though the app also checks Stripe directly as a fallback).

### Install Stripe CLI

**Mac (Apple Silicon / M1 / M2 / M3):**

```bash
curl -fsSL https://github.com/stripe/stripe-cli/releases/download/v1.40.9/stripe_1.40.9_mac-os_arm64.tar.gz \
  -o /tmp/stripe.tar.gz \
  && tar -xzf /tmp/stripe.tar.gz -C /tmp \
  && chmod +x /tmp/stripe \
  && mkdir -p ~/.local/bin \
  && cp /tmp/stripe ~/.local/bin/stripe
```

**Add to PATH (so `stripe` command works everywhere):**

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**Verify installation:**

```bash
stripe --version
# stripe version 1.40.9
```

### Login to Stripe CLI

```bash
stripe login
```

This opens your browser — click **Allow access**.

### Start Webhook Forwarding

Open a **new terminal** and run (keep this running while testing):

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

You will see:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx
```

Copy the `whsec_...` value and update your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

Restart the dev server:

```bash
npm run dev
```

---

## Step 9 — Test a Payment

### Open two browser tabs:

**Tab 1 — Live payment monitor:**
```
http://localhost:3000/debug
```

**Tab 2 — Checkout:**
```
http://localhost:3000/checkout
```

### Use these test card details:

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry date | `12/26` |
| CVC | `123` |
| Name | Any name |
| ZIP | Any 5 digits |

### What you should see:

1. Payment entry appears in debug monitor with status `pending`
2. After submitting — Stripe redirects to `/success`
3. Webhook fires — status changes to `completed` in the debug monitor
4. phpMyAdmin → `Payment` table shows `status = completed`

---

## Test Cards

Use these cards to test different payment scenarios (no real money charged):

| Scenario | Card Number |
|----------|-------------|
| Payment succeeds | `4242 4242 4242 4242` |
| Payment declined | `4000 0000 0000 0002` |
| Requires 3D Secure auth | `4000 0025 0000 3155` |
| Insufficient funds | `4000 0000 0000 9995` |

All test cards use:
- Any future expiry date (e.g. `12/26`)
- Any 3-digit CVC (e.g. `123`)

---

## Available Pages

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Product landing page |
| `http://localhost:3000/checkout` | Payment form |
| `http://localhost:3000/success` | Payment result page |
| `http://localhost:3000/debug` | Live payment status monitor |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create-payment-intent` | Creates Stripe PaymentIntent, saves as `pending` in DB |
| `POST` | `/api/webhook` | Receives Stripe events, updates payment status |
| `GET` | `/api/payment-status/:id` | Returns current payment status |
| `GET` | `/api/payments` | Lists all payments (debug use) |

---

## How Payment Status Works

```
User visits /checkout
        ↓
POST /api/create-payment-intent
        ↓
Stripe creates PaymentIntent
        ↓
Saved in MySQL as status: PENDING
        ↓
User enters card & submits
        ↓
Stripe processes payment
        ↓
Stripe redirects to /success
        ↓
Two things happen simultaneously:

[Webhook path]                    [Fallback path]
Stripe calls /api/webhook         /success page polls /api/payment-status/:id
        ↓                                 ↓
Signature verified                 Checks MySQL first
        ↓                                 ↓
MySQL updated to: COMPLETED        If still pending → queries Stripe API directly
                                          ↓
                                   MySQL updated to: COMPLETED
```

> The fallback path ensures the status always updates correctly even if the webhook is delayed or not configured.

---

# PART 2 — PRODUCTION SETUP

---

## Step 1 — Get Live Stripe API Keys

1. Go to **https://dashboard.stripe.com**
2. Toggle from **Test mode** to **Live mode** (top right switch)
3. Click **Developers** → **API Keys**
4. Copy your live keys:

```
Publishable key:  pk_live_xxxxxxxxxxxxxxxxxxxx
Secret key:       sk_live_xxxxxxxxxxxxxxxxxxxx
```

> Live keys charge **real money**. Only use them after testing is complete.

---

## Step 2 — Deploy the Application

Deploy to your hosting provider (Vercel, Railway, DigitalOcean, etc.) and set these environment variables in your hosting dashboard:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
DATABASE_URL=mysql://user:password@your-db-host:3306/stripe_payment
```

---

## Step 3 — Add Webhook Endpoint in Stripe Dashboard

1. Go to **https://dashboard.stripe.com**
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Fill in:
   - **Endpoint URL**: `https://yourdomain.com/api/webhook`
   - **Events to send**: select these two:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. On the endpoint page, click **Reveal** under **Signing secret**
7. Copy the `whsec_...` value → add to your production environment as `STRIPE_WEBHOOK_SECRET`

---

## Step 4 — Run Database Migration

On your production server:

```bash
npx prisma db push
```

---

## Step 5 — Verify Production Webhook

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click your endpoint
3. Click **Send test webhook**
4. Select `payment_intent.succeeded`
5. Click **Send**
6. Check that your server logs show `[webhook] ✅ Payment → COMPLETED`

---

## Environment Variables Summary

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `mysql://root:password@localhost:3306/stripe_payment` | Your production DB URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` CLI output | From Stripe Dashboard → Webhooks |

---

## Troubleshooting

### `zsh: command not found: stripe`
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

### `@tailwindcss/oxide` native binding error
Means Node.js version is too old. Fix:
```bash
nvm use 22
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Payment status stuck on `pending`
- Make sure `stripe listen` is running in a separate terminal
- Make sure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches what `stripe listen` printed
- The app queries Stripe API directly as a fallback — status will still update without webhook

### Two payment entries in database
- Fixed by `sessionStorage` caching — refreshing checkout page reuses the same PaymentIntent
- Old entries from before the fix can be deleted from phpMyAdmin

### `P1001: Can't reach database server`
- Make sure MySQL is running
- Check your `DATABASE_URL` credentials in `.env`
- Verify the database `stripe_payment` exists in phpMyAdmin

### Webhook signature verification failed (production)
- Make sure `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe Dashboard → Webhooks → your endpoint
- Do not use the CLI `whsec_` in production — use the one from the Dashboard

---

## Quick Start Checklist

### Local
- [ ] Node.js 22 installed (`nvm use 22`)
- [ ] MySQL running + `stripe_payment` database created
- [ ] `.env` created with `DATABASE_URL`
- [ ] `.env.local` created with Stripe test keys
- [ ] `npm install` completed
- [ ] `npx prisma db push` completed
- [ ] `npm run dev` running on Terminal 1
- [ ] `stripe login` done
- [ ] `stripe listen --forward-to localhost:3000/api/webhook` running on Terminal 2
- [ ] `STRIPE_WEBHOOK_SECRET` updated in `.env.local`
- [ ] Test payment made with card `4242 4242 4242 4242`

### Production
- [ ] App deployed with live environment variables
- [ ] Production database migrated (`npx prisma db push`)
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Production `STRIPE_WEBHOOK_SECRET` set from Dashboard
- [ ] Test webhook sent from Stripe Dashboard and verified
