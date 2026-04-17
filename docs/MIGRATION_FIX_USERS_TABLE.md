## 🔧 Migration Order Fix - Users Table Dependency

### ❌ Problem
Migration `20260417112648_seat_layout_manager.sql` failed because it referenced `public.users` table which didn't exist yet.

### ✅ Solution Implemented
1. Created new migration: `20260401_0_create_users_table_first.sql` with EARLIER timestamp
2. Updated old migration: `20260419_1_create_users_table.sql` to comment it out (to avoid duplicate)

### 📋 Migration Execution Order (After Fix)

```
1. 20260401_0_create_users_table_first.sql    ✅ Creates users table
2. 20260417112648_seat_layout_manager.sql     ✅ References users (now exists)
3. 20260417125756_add_seat_dimensions.sql     ✅ Other tables
4. 20260418_0_cleanup.sql                     ✅
5. ... (others in date order)
```

---

## 🚀 How to Apply Migration Fix

### **Option 1: Via Supabase CLI (Recommended)**

```bash
# Reset and re-run all migrations
cd d:\PROYEK WEB MASTER\wandr-explore-app
supabase migration down --all
supabase migration up
```

**OR** if you want to keep existing data:

```bash
# Apply only the new migration
supabase migration up
```

### **Option 2: Manual SQL Execution**

1. Go to **https://app.supabase.com** → Your Project
2. Click **SQL Editor** → **New Query**
3. Copy SQL from: `supabase/migrations/20260401_0_create_users_table_first.sql`
4. Paste and click **Run**
5. Repeat for other migrations in order

### **Option 3: Via Node Script**

```bash
# Run all pending migrations
node run-migrations.js
```

---

## ✅ Verification Checklist

After running migrations, verify:

```sql
-- Check users table exists
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';

-- Check seat_layouts table exists
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seat_layouts';

-- Check all tables are created
\dt public.
```

Expected output:
```
users
seat_layouts
seat_categories
seats
layout_history
(and other tables)
```

---

## 📊 Files Modified

| File | Change |
|------|--------|
| `20260401_0_create_users_table_first.sql` | ✅ NEW - Early users table |
| `20260419_1_create_users_table.sql` | 🔄 UPDATED - Commented out (deprecated) |

---

## ⚠️ Important Notes

1. **CREATE TABLE IF NOT EXISTS** - All migrations use this, so running them multiple times is safe
2. **Dependency Order** - Users table MUST exist before seat_layout_manager
3. **Service Role Key** - Required if running via Supabase CLI
   - Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`
   - Get from: https://app.supabase.com → Settings → API → Service Role

---

## 🔍 Migration Dependencies

```
auth.users (Supabase built-in)
    ↓
public.users (NEW early migration)
    ↓
public.seat_layouts (references users for RLS)
public.layout_history (references users)
    ↓
Other tables
```

---

## 🎯 Next Steps

1. ✅ Run migrations using one of the 3 options above
2. ✅ Verify all tables are created
3. ✅ Setup storage bucket (see: `docs/STORAGE_BUCKET_SETUP.md`)
4. ✅ Test image upload and display

---

**Created**: 2026-04-27
**Last Updated**: 2026-04-27
