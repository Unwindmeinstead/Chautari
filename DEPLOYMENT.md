# Chautari — Deployment Guide

## Stack
- **Frontend**: Next.js 14 on Vercel (iad1 / us-east-1)
- **Database & Auth**: Supabase (lojwlghvqojdygaxhxuy, us-east-1)
- **Storage**: Supabase Storage (private `documents` bucket)
- **Realtime**: Supabase Realtime (messaging)

---

## 1. Run All Migrations

Run these in order in the Supabase SQL Editor (Dashboard → SQL Editor):

```
supabase/block4-migration.sql   — e_signatures, switch_requests updates
supabase/block5-migration.sql   — notifications
supabase/block6-migration.sql   — agency_members, agency portal
supabase/block7-migration.sql   — conversations, messages, Realtime
supabase/block8-migration.sql   — documents, storage bucket
supabase/block9-migration.sql   — audit_logs, admin RLS, is_approved column
```

After block7-migration.sql, enable Realtime for `messages` and `conversations` in:
Dashboard → Database → Replication → Source Tables → add both tables

---

## 2. Supabase Storage

After block8-migration.sql, verify the `documents` bucket was created:
- Dashboard → Storage → should see a `documents` bucket
- Confirm it is set to **Private** (not public)
- File size limit: 10MB

---

## 3. Promote Your First Admin

```sql
UPDATE profiles SET role = 'chautari_admin'
WHERE id = 'your-user-uuid-here';
```

Then visit `/admin` to access the Chautari admin console.

---

## 4. Vercel Deployment

### Prerequisites
- Vercel account (vercel.com)
- GitHub repo connected

### Steps

1. **Import project** in Vercel Dashboard → Add New → Project → select your GitHub repo

2. **Framework**: Next.js (auto-detected)

3. **Root directory**: `.` (the repo root)

4. **Environment variables** — add these in Vercel Dashboard → Project → Settings → Environment Variables:

   | Variable | Value | Environment |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lojwlghvqojdygaxhxuy.supabase.co` | All |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | All |
   | `NEXT_PUBLIC_APP_URL` | `https://chautari.health` | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://chautari-preview.vercel.app` | Preview |

   Get your publishable key from: Supabase Dashboard → Settings → API → **Publishable key** (starts with `sb_publishable_`)

5. **Deploy**: Click Deploy — Vercel builds and deploys automatically

6. **Custom domain**: Vercel Dashboard → Project → Domains → Add `chautari.health`
   - Add DNS records as shown by Vercel (A record + CNAME)
   - SSL is automatic via Let's Encrypt

### Post-Deploy

After first deploy, add your Vercel production URL to Supabase:
- Dashboard → Authentication → URL Configuration
- **Site URL**: `https://chautari.health`
- **Redirect URLs**: add `https://chautari.health/**` and `https://*.vercel.app/**`

---

## 5. Supabase Auth Email Templates (Optional)

Customize auth emails for Nepali/Hindi users:
- Dashboard → Authentication → Email Templates
- Update "Confirm signup" and "Reset password" templates

---

## 6. Health Check URLs

After deploying, verify these routes work:

| Route | Expected |
|---|---|
| `/` | Landing page |
| `/auth/login` | Login form |
| `/auth/register` | Registration |
| `/dashboard` | Redirects to login if unauthed |
| `/admin` | Redirects to dashboard if not chautari_admin |
| `/agencies` | Agency search directory |

---

## 7. Monitoring

- **Vercel**: Dashboard → Project → Analytics (Core Web Vitals)
- **Vercel**: Dashboard → Project → Functions (serverless logs)
- **Supabase**: Dashboard → Reports (database, auth, storage metrics)
- **Supabase**: Dashboard → Database → Logs (query logs)

---

## Security Checklist

- [ ] All RLS policies enabled on all tables ✓ (applied in migrations)
- [ ] `documents` storage bucket is private ✓
- [ ] Admin routes protected by server-side role check ✓
- [ ] HIPAA-compliant messaging with no PII in notification bodies ✓
- [ ] E-signature checksum recorded for audit ✓
- [ ] HTTPS enforced via HSTS header (vercel.json) ✓
- [ ] No API keys exposed in client code ✓ (publishable key only)

---

## i18n

The app supports English, Nepali (नेपाली), and Hindi (हिन्दी). Language is:
1. Stored in user's profile (`preferred_lang` column)
2. Cached in a `chautari_lang` cookie (30-day expiry)
3. Read server-side from the cookie in `app/layout.tsx`

Users change language via the globe icon (🌐) in the top nav. Changing language saves to their profile and reloads the page to apply server-rendered translations.

Translation strings live in `src/lib/i18n.ts`.
