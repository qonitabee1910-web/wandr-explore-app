# ⚡ Quick Migration Setup Checklist

**Time Estimate**: 15-20 minutes  
**Difficulty**: ⭐ Easy  
**Status**: Ready to execute  

---

## 📋 Step-by-Step Execution

### Step 1: Prepare (2 min)

- [ ] Open Supabase Dashboard: https://app.supabase.com
- [ ] Navigate to project: `isuyxglnkqkszsfymkjl`
- [ ] Go to **SQL Editor** tab
- [ ] Click **New Query** button

### Step 2: Run Migration 001 (2 min)

**File**: `20260418_001_create_auth_and_users.sql`

```
1. Open file in VS Code
2. Select All (Ctrl+A) and Copy (Ctrl+C)
3. Paste into SQL Editor
4. Click RUN button
5. ✅ Wait for success message
```

**Verify**:
```sql
SELECT COUNT(*) FROM pg_tables WHERE tablename = 'users';
-- Should return: 1
```

### Step 3: Run Migration 002 (2 min)

**File**: `20260418_002_create_core_domain_tables.sql`

```
1. Clear previous SQL (Select All → Delete)
2. Copy migration 002 SQL
3. Paste into editor
4. Click RUN
5. ✅ Wait for success
```

**Verify**:
```sql
SELECT COUNT(*) FROM pg_tables 
WHERE tablename IN ('rides', 'shuttles', 'bookings', 'promos');
-- Should return: 4 (or more)
```

### Step 4: Run Migration 003 (2 min)

**File**: `20260418_003_create_pricing_and_surge_tables.sql`

```
1. Clear editor
2. Copy migration 003 SQL
3. Paste & RUN
4. ✅ Wait for success
```

**Verify**:
```sql
SELECT COUNT(*) FROM public.fare_multipliers;
-- Should return: 9 (default multipliers seeded)
```

### Step 5: Run Migration 004 (2 min)

**File**: `20260418_004_create_admin_and_settings_tables.sql`

```
1. Clear editor
2. Copy migration 004 SQL
3. Paste & RUN
4. ✅ Wait for success
```

**Verify**:
```sql
SELECT app_name, currency FROM public.app_settings LIMIT 1;
-- Should return: PYU-GO | IDR
```

### Step 6: Run Migration 005 (2 min)

**File**: `20260418_005_create_storage_buckets.sql`

```
1. Clear editor
2. Copy migration 005 SQL
3. Paste & RUN
4. ✅ Wait for success
```

**Verify**:
```sql
SELECT id, public FROM storage.buckets 
WHERE id = 'seat-layouts';
-- Should return: seat-layouts | true
```

### Step 7: Run Migration 006 (2 min)

**File**: `20260418_006_configure_rls_policies.sql`

```
1. Clear editor
2. Copy migration 006 SQL
3. Paste & RUN
4. ✅ Wait for success (largest file, may take longer)
```

**Verify**:
```sql
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public';
-- Should return: 50+ policies
```

### Step 8: Run Migration 007 (2 min)

**File**: `20260418_007_helper_functions_and_utilities.sql`

```
1. Clear editor
2. Copy migration 007 SQL
3. Paste & RUN
4. ✅ Wait for success
```

**Verify**:
```sql
SELECT COUNT(*) FROM pg_proc 
WHERE proname LIKE 'calculate_%' 
   OR proname LIKE 'get_%'
   OR proname LIKE 'apply_%';
-- Should return: 8 functions
```

---

## ✅ Final Verification

Run this comprehensive check:

```sql
-- 1. Count tables
SELECT COUNT(*) as total_tables 
FROM pg_tables 
WHERE schemaname = 'public';
-- Expected: 20+

-- 2. Count functions
SELECT COUNT(*) as total_functions 
FROM pg_proc 
WHERE proname ~ '^(calculate|get_|apply_|create_|log_|check_)';
-- Expected: 8+

-- 3. Count views
SELECT COUNT(*) as total_views 
FROM pg_views 
WHERE schemaname = 'public' AND viewname LIKE 'v_%';
-- Expected: 4

-- 4. Check RLS enabled
SELECT COUNT(*) as tables_with_rls 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 20+

-- 5. Count policies
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
-- Expected: 50+

-- 6. Check storage buckets
SELECT COUNT(*) as storage_buckets 
FROM storage.buckets 
WHERE id IN ('seat-layouts', 'driver-documents', 'user-profiles');
-- Expected: 3
```

---

## 🎯 Quick Test After Setup

### Test 1: Create a test user (via Supabase Auth)

```sql
-- After user signs up via auth, verify profile created
SELECT id, email, full_name, role FROM public.users 
WHERE email = 'test@example.com';
-- Should return: 1 row with auto-created profile
```

### Test 2: Check admin audit log function

```sql
-- Admin creates audit log
SELECT public.create_audit_log(
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
  'CREATE',
  'test',
  NULL,
  NULL,
  '{"test": true}'::jsonb,
  'Testing audit function'
);
-- Should return: UUID of new audit log
```

### Test 3: Test fare calculation

```sql
-- Calculate fare for sample ride
SELECT * FROM public.calculate_ride_fare(
  10::DECIMAL,      -- 10 km
  30::INTEGER,      -- 30 minutes
  1.5::DECIMAL,     -- service multiplier
  1.2::DECIMAL,     -- vehicle multiplier
  1.0::DECIMAL,     -- no surge
  1.0::DECIMAL      -- adult passenger
);
-- Should return: fare breakdown with total
```

### Test 4: Check RLS (verify as non-admin)

```sql
-- Switch to anonymous/user context
-- Public should see published seat layouts
SELECT id, name, status FROM public.seat_layouts 
WHERE status = 'published';
-- Should return: only published layouts
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "relation does not exist" error | Ensure migrations run 001→007 in order |
| "function does not exist" on migration 002 | Migration 001 must complete first |
| Storage bucket still private | Check Dashboard > Storage > seat-layouts > click "Make public" |
| RLS policy errors | All tables should have RLS enabled (migration 006) |
| Audit log insert fails | Make sure user exists and has admin role |
| Seat layout view shows nothing | Layout must be published (status='published') |

---

## 🚀 What's Now Ready

After migrations complete:

✅ **Database**
- 20+ tables with proper relationships
- 40+ strategic indexes
- Auto-update triggers on timestamps
- Auth integration with auto-profile creation

✅ **Security**
- RLS enabled on all tables
- 50+ security policies
- Storage bucket access control
- Audit logging for admin actions

✅ **Features**
- Ride booking system
- Shuttle management & booking
- Pricing rules & surge multipliers
- Promo code system
- Admin dashboard backend

✅ **Utilities**
- 8 helper functions
- 4 useful views
- 3 storage buckets

---

## 🎉 Next Steps

1. ✅ Verify all migrations executed
2. ✅ Run test queries above
3. ✅ Check storage bucket is public
4. ✅ Test image upload from app
5. ✅ Verify images display on canvas
6. ✅ Create admin user for dashboard
7. ✅ Deploy to production

---

**Status**: 🟢 Ready to Execute  
**Last Updated**: 2026-04-18  
**Estimated Duration**: 15-20 minutes  

**Ready? Let's go! 🚀**
