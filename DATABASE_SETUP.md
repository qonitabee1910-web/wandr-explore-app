## 🗄️ Database Setup Guide

To use PYU-GO with Supabase, you need to set up the database schema. Follow these steps:

### ✅ Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **wandr-explore-app**
3. Click **Settings** → **API** (in the sidebar)
4. Under **Project API keys**, copy the **service_role secret** key
5. Add it to your `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### ✅ Step 2: Apply Database Migrations

Choose one of the following methods:

#### **Method A: Automatic Setup (Recommended)**
```bash
node setup-database.js
```

#### **Method B: Manual Setup via Supabase Dashboard**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (in the sidebar)
4. Click **New Query**
5. Copy and paste the SQL from `supabase/migrations/20260417_create_users_table.sql`
6. Click **Run**

#### **Method C: Using Supabase CLI**
```bash
supabase db push
```

### ✅ Step 3: Verify Setup

The following tables and policies should be created:

**Tables:**
- `users` - User profiles linked to auth.users
  - Columns: id, email, full_name, phone, role, status, profile_picture_url, permissions, created_at, updated_at

**RLS Policies:**
- Users can read their own profile
- Users can insert their own profile
- Users can update their own profile
- Service role can read/write all users

### ✅ Step 4: Test the Setup

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:8080

3. Click **Sign up** and create a test account

4. You should be redirected to the login page after email verification

5. Login with your test account

### 🔐 Security Notes

- **Service Role Key**: Only use this on your backend/dev machine. Never commit it to version control.
- **RLS Policies**: All tables in the public schema have Row Level Security enabled. Users can only access their own data.
- **Never expose service keys in frontend code** - they can only be used via edge functions or backend servers.

### 🆘 Troubleshooting

**Q: Getting 403 Forbidden errors?**
- A: The RLS policies might not be applied. Run the migrations again or check the Supabase dashboard.

**Q: Table creation failed?**
- A: Make sure your service role key is correct. Check the Supabase dashboard SQL editor for errors.

**Q: Auth redirects to /login instead of home?**
- A: Clear browser cache and try again. Your session might be outdated.

---

For more help, see the [Supabase Documentation](https://supabase.com/docs).
