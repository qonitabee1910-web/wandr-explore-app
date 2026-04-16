# Supabase Configuration Guide

## Setup Instructions

### 1. Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (choose database password carefully)
3. Wait for project initialization

### 2. Environment Variables
Create `.env.local` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (NEVER expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get these values:**
1. In Supabase Dashboard → Settings → API
2. Copy `Project URL` → `VITE_SUPABASE_URL`
3. Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 3. Setup Database Schema

#### Option A: Using Supabase Dashboard
1. Go to SQL Editor
2. Create new query
3. Paste entire content from `docs/supabase-schema.sql`
4. Click "Run"

#### Option B: Using CLI
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 4. Configure Authentication

**Email Verification:**
1. Settings → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates for verification

**Social Providers (Optional):**
- Settings → Authentication → Providers
- Enable Google, GitHub, etc.
- Add OAuth credentials

### 5. Configure Row Level Security (RLS)

The schema.sql already includes RLS policies. To enable:

1. Settings → Database → Replication
2. For each table, enable RLS
3. Policies are auto-created by schema.sql

### 6. Setup Realtime (Optional)

For real-time features (driver location, ride status):

1. Settings → Realtime
2. Enable "Realtime" for desired tables
3. Configuration already in code

### 7. Create Storage Buckets

For uploads (documents, photos):

```sql
-- In SQL Editor

-- Create buckets
INSERT INTO storage.buckets (id, name)
VALUES ('driver-documents', 'driver-documents'),
       ('user-profiles', 'user-profiles'),
       ('hotel-images', 'hotel-images');

-- Set RLS policies for each bucket
```

## Testing Connection

```typescript
import { supabase } from '@/lib/supabase';

// Test connection
async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('count()')
    .single();
  
  if (error) console.error('Connection failed:', error);
  else console.log('Connected successfully!');
}
```

## Next Steps

1. ✅ Schema created
2. ✅ Auth configured
3. ⏭️ Create auth service (src/services/authService.ts)
4. ⏭️ Migrate client services to use Supabase
5. ⏭️ Update components to use real data
