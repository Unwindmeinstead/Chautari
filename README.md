# Chautari 🌳

**Pennsylvania Home Health & Home Care Agency Switching Platform**

Chautari helps Medicaid and Medicare patients in Pennsylvania find and switch to the right home care agency — guided, simple, and free.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **Deployment**: Vercel
- **i18n**: English, Nepali, Hindi

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Unwindmeinstead/chautari.git
cd chautari
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lojwlghvqojdygaxhxuy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qVfzGNYhE6hd1BAySLXicg_gJajbqjv
PHI_ENCRYPTION_KEY=your-32-character-min-secret-key
```

### 3. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Login, register, verify, reset
│   ├── dashboard/          # Patient dashboard
│   ├── agency/             # Agency portal
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Design system primitives
│   ├── layout/             # Header, sidebar, footer
│   ├── forms/              # Form components
│   └── auth/               # Auth-specific components
├── lib/
│   ├── supabase/           # Supabase clients (browser, server, middleware)
│   ├── auth.ts             # Auth server actions
│   └── utils.ts            # Utilities
├── types/
│   └── database.ts         # TypeScript types from Supabase schema
└── styles/
    └── globals.css         # Global styles + design tokens
```

## Design System

**Colors**: Forest green (`#1A3D2B`) + Cream (`#FFF8E7`) + Amber (`#E8933A`)  
**Typography**: Fraunces (display) + DM Sans (body)  
**Components**: Button, Input, Card, Badge, Toast, Logo, Stepper

## Supabase Database

Project ID: `lojwlghvqojdygaxhxuy`  
Region: `us-east-1`

Tables: `profiles`, `patient_details`, `agencies`, `agency_members`, `switch_requests`, `documents`, `e_signatures`, `messages`, `notifications`, `audit_logs`, `session_events`

Full HIPAA-compliant schema with RLS, encrypted PHI, and audit logging.

---

## Build Blocks

- [x] **Block 1**: Next.js scaffold + design system + auth pages
- [ ] **Block 2**: Patient onboarding wizard + eligibility check
- [ ] **Block 3**: Agency search + directory
- [ ] **Block 4**: Switch request wizard
- [ ] **Block 5**: Patient dashboard
- [ ] **Block 6**: Agency portal
- [ ] **Block 7**: Secure messaging
- [ ] **Block 8**: Document upload + e-signature
- [ ] **Block 9**: Admin dashboard
- [ ] **Block 10**: i18n (Nepali + Hindi)
