## 🚀 Quick Start Guide - Authentication Setup

### Complete these steps to get Supabase authentication working:

---

## 📋 Step 1: Get Your Service Role Key (5 minutes)

1. **Open Supabase Dashboard**: https://app.supabase.com
2. **Select project**: wandr-explore-app
3. **Go to Settings → API** (left sidebar)
4. **Find "Project API keys"** section
5. **Copy** the `service_role secret` (the long key, not the `anon` key)
6. **Add to `.env.local`**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sk_...
   ```

---

## 🗄️ Step 2: Create Database Tables (2 minutes)

### Option A: Automatic (Easy)
```bash
node setup-database.js
```

### Option B: Manual via Dashboard (Visual)
1. Go to Supabase → **SQL Editor**
2. Create new query
3. Copy-paste from `supabase/migrations/20260417_create_users_table.sql`
4. Click **Run**

---

## ✅ Step 3: Start Development (30 seconds)

```bash
npm run dev
```

Visit: **http://localhost:8080**

---

## 🧪 Step 4: Test Authentication

1. Click **Sign up**
2. Enter:
   - Full Name: Test User
   - Email: test@example.com
   - Phone: (optional)
   - Password: password123
   - Confirm Password: password123
3. Click **Sign up**
4. Check your email for verification link
5. Click link in email
6. Login with email & password

---

## ✨ What You Get

After setup, your app has:

✅ **User Registration** - Email verification required
✅ **User Login** - Secure password authentication  
✅ **Admin Login** - Special access at `/login?type=admin`
✅ **Protected Routes** - Auto-redirects to login if not authenticated
✅ **User Profiles** - Stored in `public.users` table
✅ **Role Management** - user, driver, admin roles
✅ **RLS Security** - Users can only access their own data

---

## 🛠️ Environment Variables

**Public (safe in frontend):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

**Secret (never in frontend):**
```
SUPABASE_SERVICE_ROLE_KEY  ← Only for setup script
```

---

## 🆘 Common Issues

### "406 Not Acceptable" or "403 Forbidden"?
→ Database tables not created. Run `node setup-database.js`

### "Property does not exist"?
→ TypeScript error, already fixed. Run `npm run dev` again

### Can't signup?
→ Make sure email verification is enabled in Supabase auth settings

### Stuck on login page?
→ Clear browser cookies, try again

---

## 📚 Next Steps

After authentication is working:

1. **Phase 2.2**: Enhance Drivers page
2. **Phase 2.3**: Enhance Rides page  
3. **Phase 2.4**: Enhance Shuttles page
4. **Phase 3**: Admin features (approvals, reporting, etc.)

---

Need help? Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed guide.
