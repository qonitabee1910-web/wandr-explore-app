## 🗄️ Database Migration Review - PYU-GO

### Overview
The application uses Supabase PostgreSQL with migrations in two locations:
1. **Admin Dashboard Migrations** (`src/admin/migrations/`) - Admin panel schema
2. **User Auth Migration** (`supabase/migrations/`) - User authentication schema

---

## 📋 Migration Files

### **Location 1: Admin Dashboard Migrations**

#### `src/admin/migrations/001_initial_schema.sql`
**Purpose**: Create admin panel infrastructure tables

**Tables Created**:
- `admin_roles` - Define admin role types (super_admin, admin, viewer)
- `admin_permissions` - Map permissions to roles
- `administrators` - Admin user accounts linked to auth.users
- `payment_gateway_settings` - Payment processor configuration
- `email_settings` - SMTP configuration for emails
- `notification_templates` - Email/SMS template storage
- `app_settings` - Global app configuration

**Status**: ✅ Working (has appropriate IF NOT EXISTS checks)

---

#### `src/admin/migrations/002_add_rls_policies.sql`
**Purpose**: Add Row-Level Security and helper functions for admin dashboard

**Helper Functions**:
- `current_admin_role()` - Get current user's admin role
- `is_super_admin()` - Check if user is super admin
- `is_admin_or_super()` - Check if user has admin privileges

**RLS Policies**:
- **administrators**: Super admins only, or self
- **admin_roles**: Super admins full access
- **admin_permissions**: Role-based access
- **payment_gateway_settings**: Super admin only
- **email_settings**: Super admin only
- **notification_templates**: Super admin read/write
- **app_settings**: Super admin only

**Status**: ✅ Working (uses CREATE OR REPLACE and conditional checks)

---

### **Location 2: User Authentication Migration**

#### `supabase/migrations/20260417_create_users_table.sql` ⚠️ **NOW FIXED**
**Purpose**: Create user profiles table with RLS for public auth

**Tables Created**:
- `users` - User profile data
  - id (references auth.users)
  - email (unique)
  - full_name
  - phone
  - role (user, driver, admin) 
  - status (active, inactive, suspended)
  - profile_picture_url
  - permissions (array)
  - timestamps (created_at, updated_at)

**Indexes Created**:
- idx_users_email - Fast email lookups
- idx_users_role - Fast role-based queries
- idx_users_status - Fast status filtering

**RLS Policies**:
- Users can read their own profile
- Users can insert their own profile
- Users can update their own profile
- Service role (backend) can read all users
- Service role can update all users
- Service role can insert users

**Triggers**:
- update_users_updated_at - Auto-update timestamp on record changes

**Status**: ✅ **FIXED** - Now fully idempotent

---

## 🔧 **Issues Found & Fixed**

### **Issue 1: Non-Idempotent Index Creation**
```sql
-- ❌ BEFORE (would fail on re-run)
CREATE INDEX idx_users_email ON public.users(email);

-- ✅ AFTER (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
```

### **Issue 2: Duplicate Policy Creation**
```sql
-- ❌ BEFORE (policies already existed)
CREATE POLICY "Users can read..." ON public.users ...;

-- ✅ AFTER (drop first, then create)
DROP POLICY IF EXISTS "Users can read..." ON public.users;
CREATE POLICY "Users can read..." ON public.users ...;
```

### **Issue 3: Duplicate Trigger**
```sql
-- ❌ BEFORE (trigger could duplicate on re-run)
CREATE TRIGGER update_users_updated_at_trigger ...;

-- ✅ AFTER (drop first, then create)
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON public.users;
CREATE TRIGGER update_users_updated_at_trigger ...;
```

---

## 🔒 Security Review

### ✅ **RLS (Row Level Security)**
- All exposed schema tables have RLS enabled
- Policies follow least-privilege principle
- Service role properly separated from public access
- User metadata NOT used for authorization (only in app_metadata)

### ✅ **Data Integrity**
- Foreign keys properly set with CASCADE delete
- Unique constraints on email addresses
- CHECK constraints on enums (role, status)
- Timestamps auto-managed via triggers

### ✅ **Performance**
- Indexes on frequently queried columns (email, role, status)
- Proper primary key definitions
- No N+1 query risks in schema design

### ⚠️ **Future Improvements**
- Consider partitioning large audit tables if needed
- Monitor index performance as data grows
- Regular vacuum and analyze runs recommended

---

## 📊 **Migration Dependency Graph**

```
Auth.users (Supabase built-in)
    ↓
    ├→ users (20260417_create_users_table.sql) ← User profiles
    │
    └→ administrators (001_initial_schema.sql) ← Admin accounts
        ↓
        └→ RLS policies (002_add_rls_policies.sql)
```

---

## 🚀 **Running Migrations**

### Method 1: Supabase CLI (Recommended)
```bash
supabase db push
```

### Method 2: Manual via Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy & paste each migration file in order
3. Execute

### Method 3: Via Setup Script
```bash
node setup-database.js
```

---

## ✅ **Migration Checklist**

- [x] All migrations idempotent (can run multiple times safely)
- [x] Proper error handling (IF NOT EXISTS, DROP IF EXISTS)
- [x] RLS enabled on all exposed tables
- [x] Foreign key constraints proper
- [x] Timestamps auto-managed
- [x] Indexes on performance-critical columns
- [x] Comments for documentation
- [x] No hardcoded secrets in migrations

---

## 🆘 **If Migrations Fail**

### Error: "relation already exists"
→ Indexes are already created. Use `IF NOT EXISTS` (now fixed)

### Error: "policy already exists"  
→ RLS policies already applied. Drop before recreating (now fixed)

### Error: "constraint already exists"
→ Check for duplicate migrations being applied

### Solution: Start Fresh
```bash
# Reset local database
supabase db reset

# Push all migrations again
supabase db push
```

---

## 📝 **Next Steps**

1. ✅ Run migrations: `supabase db push`
2. ✅ Test authentication: Create test user via signup
3. ⏭️ Create additional tables as needed:
   - rides
   - drivers
   - shuttles
   - promotions
   - etc.

---

**Last Updated**: April 17, 2026  
**Status**: ✅ All migrations reviewed and fixed
