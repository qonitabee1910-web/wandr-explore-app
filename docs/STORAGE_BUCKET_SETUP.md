# Storage Buckets & RLS Policy Setup Guide

## 📋 Overview

Panduan ini menjelaskan cara setup storage bucket dan RLS (Row Level Security) policies untuk image uploads di Supabase.

### ✅ What's Included

1. **Migration File**: `supabase/migrations/20260427_9_setup_storage_buckets.sql`
   - Creates `seat-layouts` storage bucket
   - Configures RLS policies for public read access
   - Sets up authenticated user permissions

2. **Setup Script**: `setup-storage-buckets.js`
   - Automated script untuk run migration
   - Verification checks
   - Error handling

---

## 🚀 Quick Setup (3 Options)

### **Option 1: Via Dashboard (Recommended for Beginners)**

1. **Go ke Supabase Dashboard**
   - https://app.supabase.com
   - Select your project

2. **Create Storage Bucket**
   - Click **Storage** (left sidebar)
   - Click **Create new bucket**
   - Name: `seat-layouts`
   - Check **Make bucket public**
   - Click **Create bucket**

3. **Copy RLS Policies**
   - Go to **SQL Editor**
   - Click **New Query**
   - Copy SQL dari: `supabase/migrations/20260427_9_setup_storage_buckets.sql`
   - Paste in editor dan click **Run**

### **Option 2: Via Node Script**

```bash
# Run the setup script
node setup-storage-buckets.js
```

**Requirements:**
- `.env.local` must have:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

### **Option 3: Via Supabase CLI**

```bash
# Apply the migration
supabase migration up

# Or manually:
supabase db push
```

---

## 📊 Migration Details

### SQL File: `20260427_9_setup_storage_buckets.sql`

#### 1. Bucket Creation
```sql
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types)
VALUES ('seat-layouts', 'seat-layouts', NULL, true, 52428800, ARRAY[...])
```

**Properties:**
- **ID**: `seat-layouts`
- **Public**: `true` (allows unauthenticated read access)
- **File Size Limit**: 50MB
- **Allowed Types**: PNG, JPEG, WebP, GIF

#### 2. RLS Policies

| Policy | Action | Who | Allows |
|--------|--------|-----|--------|
| Allow public read | SELECT | Everyone | Read/download images |
| Allow authenticated upload | INSERT | Authenticated users | Upload new images |
| Allow authenticated update | UPDATE | Authenticated users | Modify images |
| Allow authenticated delete | DELETE | Authenticated users | Delete images |

---

## 🔧 Usage Examples

### Upload Image (dari Code)

```typescript
import { supabase } from '@/lib/supabase';

const uploadImage = async (file: File) => {
  const filename = `layout-${Date.now()}.png`;
  
  const { data, error } = await supabase.storage
    .from('seat-layouts')
    .upload(filename, file, { cacheControl: '3600' });
    
  if (error) throw error;
  
  // Get public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/seat-layouts/${filename}`;
  return publicUrl;
};
```

### Access Image (Public URL)

```
https://your-project.supabase.co/storage/v1/object/public/seat-layouts/layout-1234567890.png
```

### Create Signed URL (Private Buckets)

```typescript
const { data } = await supabase.storage
  .from('seat-layouts')
  .createSignedUrl('filename.png', 3600); // Valid for 1 hour
```

---

## ✅ Verification Checklist

### Step 1: Check Bucket Exists
```bash
# Query via dashboard SQL Editor
SELECT id, name, public FROM storage.buckets WHERE id = 'seat-layouts';
```

**Expected Output:**
```
id               | name          | public
seat-layouts     | seat-layouts  | true
```

### Step 2: Verify Policies
```bash
# Check RLS policies are enabled
SELECT schemaname, tablename, policyname, permissive 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%seat-layouts%';
```

### Step 3: Test Public Access
1. Upload image via app
2. Get the public URL
3. Open URL in browser
4. Image should display ✅

---

## 🐛 Troubleshooting

### Problem: Image URL returns 404

**Solution:**
1. Verify bucket is PUBLIC (not private)
2. Check bucket name matches URL: `seat-layouts`
3. Verify file was uploaded successfully
4. Check URL format: `https://{project}.supabase.co/storage/v1/object/public/seat-layouts/{filename}`

### Problem: Upload fails with 403 (Forbidden)

**Solution:**
1. Verify user is authenticated (`auth.role() = 'authenticated'`)
2. Check RLS policy allows INSERT
3. Verify anon key is in `.env.local`

### Problem: Script fails to run

**Solution:**
1. Install dependencies: `npm install`
2. Check `.env.local` has service role key
3. Try manual SQL execution via dashboard
4. Check Supabase project is active

### Problem: Bucket already exists

**Solution:**
- SQL uses `ON CONFLICT DO UPDATE`
- Existing bucket will be updated to `public = true`
- Safe to run multiple times

---

## 🔐 Security Considerations

### Public Read Access ✅
- Anyone can read seat layout images
- No authentication required
- Good for displaying layouts

### Authenticated Write Access ✅
- Only logged-in admin/driver can upload
- Prevents unauthorized uploads
- Controlled via RLS policies

### Alternative: Private Bucket
To make bucket private, change migration:
```sql
-- Change public = true to public = false
INSERT INTO storage.buckets (id, name, owner, public, ...)
VALUES (..., false, ...) -- Private bucket
```

Then use signed URLs to access:
```typescript
const { data } = supabase.storage.from('seat-layouts').createSignedUrl(filename, 3600);
```

---

## 📚 Related Files

- **Migration**: `supabase/migrations/20260427_9_setup_storage_buckets.sql`
- **Setup Script**: `setup-storage-buckets.js`
- **Upload Service**: `src/admin/services/seatLayoutService.ts`
- **Upload Component**: `src/admin/pages/SeatLayoutEditor.tsx`
- **Supabase Config**: `src/lib/supabase.ts`

---

## 🔗 Useful Links

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://app.supabase.com)
- [Create Signed URLs](https://supabase.com/docs/guides/storage/serving/signed-urls)

---

## 🎯 Next Steps

1. ✅ Run migration (Option 1, 2, or 3)
2. ✅ Verify bucket in dashboard
3. ✅ Test upload via app
4. ✅ Verify image displays on canvas
5. ✅ Deploy to production

---

**Last Updated**: 2026-04-27
**Version**: 1.0
