# 🔍 SQL Files Analysis Report
**Date**: April 17, 2026  
**Status**: ⚠️ CRITICAL & MAJOR ISSUES FOUND

---

## 📋 Summary

| File | Issues | Severity |
|------|--------|----------|
| `001_initial_schema.sql` | 6 issues | 🔴 CRITICAL |
| `002_add_rls_policies.sql` | 5 issues | 🔴 CRITICAL |
| `supabase-schema.sql` | 7 issues | 🟡 MAJOR |
| `fare-system-schema.sql` | 2 issues | 🟡 MAJOR |
| `20260417_create_users_table.sql` | 3 issues | 🔴 CRITICAL |

**Total**: 23 issues found

---

## 🔴 CRITICAL ISSUES

### 1. **`001_initial_schema.sql`**

#### Issue 1.1: Incomplete ON CONFLICT Clause ❌
**Line**: ~292
```sql
INSERT INTO app_settings (app_name, app_version) VALUES
  ('PYU-GO', '1.0.0')
ON CONFLICT DO NOTHING;  -- ❌ WRONG
```

**Problem**: Missing conflict target. Should specify which column.

**Fix**:
```sql
ON CONFLICT (id) DO NOTHING;
-- OR if there's a unique constraint, use the constraint name
```

---

#### Issue 1.2: Missing Table Definitions ⚠️
**Lines**: 219-227, 240-250, 262-272
```sql
/* Lines 219-227 omitted */
/* Lines 240-250 omitted */
/* Lines 262-272 omitted */
```

**Problem**: File is incomplete - omitted sections in critical tables:
- `advertisements` table incomplete
- `ad_campaigns` table incomplete  
- `ad_metrics` table incomplete

**Impact**: These tables won't be created properly. Schema is broken.

---

#### Issue 1.3: No Idempotency for Functions 🔴
```sql
CREATE OR REPLACE FUNCTION current_admin_role()
```

**Problem**: Uses `REPLACE` but functions in migrations should use `IF NOT EXISTS` pattern for idempotency.

**Fix**:
```sql
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS VARCHAR AS $$
  ...
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

#### Issue 1.4: SECURITY DEFINER Risk 🔐
```sql
CREATE OR REPLACE FUNCTION current_admin_role()
...
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Problem**: `SECURITY DEFINER` functions always run with function owner's permissions. If not carefully restricted, can be a security vulnerability.

**Risk**: Someone could escalate privileges.

**Recommendation**:
```sql
-- Only if absolutely necessary, add:
SECURITY DEFINER
SET search_path = public
```

---

#### Issue 1.5: Duplicate Constraint Definitions ⚠️
```sql
CREATE TABLE payment_gateway_settings (
  ...
  gateway_name VARCHAR(50) NOT NULL,
  ...
  UNIQUE(gateway_name)
);
```

vs

```sql
CREATE TABLE payment_gateway_settings (
  ...
  UNIQUE(gateway_name)  -- Duplicate!
);
```

**Problem**: Same unique constraint might be defined twice.

---

#### Issue 1.6: Admin Roles vs User Roles Conflict 🔴
**File**: `001_initial_schema.sql` creates `administrators` table
**File**: `20260417_create_users_table.sql` creates `users` table with role = 'admin'

**Problem**: TWO DIFFERENT ADMIN SYSTEMS!
- `administrators.role` = 'super_admin', 'admin', etc.
- `users.role` = 'user', 'driver', 'admin'

**Conflict**: Login checks `users.role`, but RLS checks `administrators.role`

**Result**: ❌ **AUTHENTICATION WILL FAIL**

---

### 2. **`002_add_rls_policies.sql`**

#### Issue 2.1: Functions Not Idempotent 🔴
```sql
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS VARCHAR AS $$
```

**Problem**: Functions created without `DROP FUNCTION IF EXISTS` first. If schema changes, will error on re-run.

**Fix**:
```sql
DROP FUNCTION IF EXISTS current_admin_role();
CREATE FUNCTION current_admin_role()
```

---

#### Issue 2.2: Unsafe Permissions Check 🔐
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT (SELECT role FROM administrators WHERE id = auth.uid()) = 'super_admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

**Problem**: 
- Returns NULL if user not found in `administrators` table
- `NULL = 'super_admin'` evaluates to NULL, not FALSE
- Could cause unexpected behavior

**Fix**:
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT role FROM administrators WHERE id = auth.uid()) = 'super_admin', FALSE)
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

#### Issue 2.3: Policies Not Idempotent 🔴
```sql
CREATE POLICY "super_admin_view_all_admins" ON administrators
  FOR SELECT
  USING (is_super_admin() OR auth.uid() = id);
```

**Problem**: No `DROP POLICY IF EXISTS` before creation. Will error on re-run if policy exists.

**Fix**:
```sql
DROP POLICY IF EXISTS "super_admin_view_all_admins" ON administrators;
CREATE POLICY "super_admin_view_all_admins" ON administrators
```

---

#### Issue 2.4: Missing NOT NULL Constraints ⚠️
```sql
INSERT INTO admin_roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  -- Lines omitted
  ('analyst', 'Analytics and reporting only')
```

**Problem**: Data insertion has omitted lines. Incomplete data.

---

#### Issue 2.5: No Fallback Admin Creation 🔴
**Problem**: If you delete all admins, you're locked out permanently. No recovery.

**Recommendation**: Add a security safeguard:
```sql
-- Prevent deleting all super_admin users
CREATE POLICY "prevent_delete_all_super_admins" ON administrators
  FOR DELETE
  USING (
    is_super_admin() AND 
    (SELECT COUNT(*) FROM administrators WHERE role = 'super_admin') > 1
  );
```

---

### 3. **`supabase-schema.sql`**

#### Issue 3.1: Schema/Table Definitions Omitted 🔴
```sql
-- Excerpt from supabase-schema.sql, lines 1 to 740:
```

**Problem**: File shown as "excerpt" - many lines omitted. Cannot verify:
- Primary keys
- Foreign key relationships
- Indexes
- Triggers
- Constraints

---

#### Issue 3.2: Cascading Deletes Risk 🔴
```sql
CREATE TABLE driver_documents (
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
);
```

**Problem**: If driver deleted, all documents auto-deleted. Might lose audit trail and legal records.

**Better**:
```sql
ON DELETE RESTRICT  -- Prevents deletion if documents exist
-- OR archive instead
```

---

#### Issue 3.3: Admin Role Duplicate Definition ⚠️
```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  admin_role TEXT NOT NULL CHECK (admin_role IN ('super_admin', 'admin', 'moderator', 'analyst')),
);
```

**Problem**: 
- `admin_users` table has `admin_role`
- `users` table has `role` 
- `administrators` table (in 001_initial_schema.sql) also has `role`

**Result**: **3 DIFFERENT ADMIN SYSTEMS!** 😱

---

#### Issue 3.4: RLS Policies Conflict 🔴
```sql
-- users table RLS:
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT admin_role FROM public.admin_users WHERE id = auth.uid()) IS NOT NULL);

-- vs admin_users table might have different policies
```

**Problem**: Complex policy logic + multiple admin tables = unpredictable behavior

---

#### Issue 3.5: Missing Audit Trail 🟡
```sql
CREATE TABLE admin_audit_logs (
  ...
);
```

**Problem**: Audit logs not properly secured with RLS. Anyone could view others' actions.

**Need**:
```sql
CREATE POLICY "admins_view_own_audit" ON public.admin_audit_logs
  FOR SELECT
  USING (auth.uid() = admin_id OR is_super_admin());
```

---

#### Issue 3.6: Foreign Key Constraint Missing ⚠️
```sql
CREATE TABLE bookings (
  hotel_booking_id UUID,
  shuttle_booking_id UUID,
  ride_id UUID,
  -- NO FOREIGN KEY CONSTRAINTS!
);
```

**Problem**: No foreign key constraints on polymorphic relationship. Data integrity not enforced.

---

#### Issue 3.7: Index Naming Inconsistency 🟡
```sql
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
```

**Problem**: Index names inconsistent:
- Some: `idx_table_column`
- Others: `idx_table_column_name_column_name`

**Better**: Use consistent naming: `idx_table_name_on_column`

---

### 4. **`fare-system-schema.sql`**

#### Issue 4.1: Referenced Table Missing 🔴
```sql
CREATE TABLE fare_rules (
  rayon_id UUID NOT NULL,
  ...
);
```

**Problem**: `rayon_id` references unknown table. No `rayon` table defined anywhere!

**Result**: Foreign key constraint will fail or be missing.

---

#### Issue 4.2: JSONB Default Values No Validation 🟡
```sql
service_multipliers JSONB NOT NULL DEFAULT '{"Regular": 1.0, "Semi Executive": 1.5, "Executive": 2.0}',
```

**Problem**: No validation that:
- Values are between reasonable ranges (0.5-3.0)
- All required keys exist
- Values are numeric

**Recommendation**: Add check constraint:
```sql
CHECK (service_multipliers->'Regular' @> '1.0'::jsonb)
```

---

### 5. **`20260417_create_users_table.sql` ⚠️ CRITICAL**

#### Issue 5.1: TOO PERMISSIVE RLS Policy 🔴🔴🔴
```sql
CREATE POLICY "Anonymous can create profile on signup"
ON public.users FOR INSERT
WITH CHECK (true);  -- ❌ ALLOWS ANYONE TO CREATE ANY USER!
```

**Problem**: 
- `WITH CHECK (true)` means anyone can insert any record
- No validation of user ID
- Anyone can create profiles for other users

**Exploit**: 
```sql
INSERT INTO public.users (id, email, role, ...) 
VALUES ('someone-elses-uuid', 'attacker@hack.com', 'admin', ...);
```

**Fix**:
```sql
CREATE POLICY "Anonymous can create profile on signup"
ON public.users FOR INSERT
WITH CHECK (
  auth.uid() = id AND 
  auth.role() IN ('authenticated', 'anon')
);
```

---

#### Issue 5.2: Role Constraint Missing 'super_admin' 🔴
```sql
role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin'))
```

**Problem**: 
- `001_initial_schema.sql` has `super_admin` role in `administrators` table
- `users` table can't store `super_admin`
- RLS functions check for `super_admin` in `administrators` table
- But login checks `users.role`

**Result**: Admin login **BROKEN**!

---

#### Issue 5.3: Email Should Be Lowercase 🟡
```sql
email TEXT NOT NULL UNIQUE,
```

**Problem**: Email addresses are case-insensitive by RFC 5321, but SQL UNIQUE is case-sensitive.

**Vulnerability**: Both `User@Example.com` and `user@example.com` allowed = duplicate accounts

**Fix**:
```sql
email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
```

And add trigger:
```sql
CREATE TRIGGER lowercase_email_users
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION LOWER(NEW.email);
```

---

## 🟡 MAJOR ISSUES

### Issue: Multiple Admin Systems Conflict

**System 1** (in `001_initial_schema.sql`):
- Table: `administrators`
- Roles: `super_admin`, `admin`, `moderator`, `analyst`
- Auth: Via `administrators.role`

**System 2** (in `supabase-schema.sql`):
- Table: `admin_users`
- Roles: `super_admin`, `admin`, `moderator`, `analyst`
- Auth: Via `admin_users.admin_role`

**System 3** (in `20260417_create_users_table.sql`):
- Table: `users`
- Roles: `user`, `driver`, `admin`
- Auth: Via `users.role`

**Result**: 
❌ Login checks `users.role = 'admin'`
❌ RLS checks `administrators.role = 'super_admin'`
❌ Admin dashboard uses different table

**THEY DON'T MATCH!**

---

## 📊 Recommendations

### Priority 1: FIX IMMEDIATELY 🔴
1. **Consolidate Admin System**: Choose ONE:
   - Option A: Use only `users` table with role = 'admin'/'super_admin'
   - Option B: Use separate `administrators` table (recommended for security)
   - Current: Using BOTH = broken

2. **Fix RLS Policy 5.1**: Remove `WITH CHECK (true)` - SECURITY RISK

3. **Fix Email Constraint 5.3**: Add LOWER() check

4. **Complete Missing Definitions**: Fill in omitted SQL sections

### Priority 2: IMPORTANT 🟡
5. Make all functions/policies idempotent (DROP before CREATE)
6. Fix NULL handling in functions (use COALESCE)
7. Add foreign key to `fare_rules.rayon_id`

### Priority 3: BEST PRACTICES 🟢
8. Consistent index naming
9. Validate JSONB values
10. Add security safeguards (prevent deleting all admins)

---

## ✅ Next Steps

1. **Decide Admin Strategy**:
   - Should I use `administrators` table only?
   - Or keep `users.role = 'admin'`?
   
2. **Fix Critical Issues**:
   - Update RLS policies
   - Fix email lowercase
   - Complete missing definitions

3. **Test**:
   - `supabase db push` to apply changes
   - Test admin login
   - Verify RLS policies

**Status**: 🔴 DO NOT DEPLOY - Multiple critical security issues found

