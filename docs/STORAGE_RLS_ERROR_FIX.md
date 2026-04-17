# Storage RLS Error - Quick Fix Guide

## 🔴 Error You're Getting

```
StorageApiError: new row violates row-level security policy
Failed to load resource: 400
```

## 🎯 Cause

RLS (Row Level Security) is enabled on storage.objects but the policies are too restrictive for uploads.

---

## ✅ Quick Fix: Use Supabase Storage UI (Correct Way)

**Why SQL doesn't work:** `storage.objects` is a system table — you can't ALTER it via SQL directly.

### ✅ **CORRECT FIX: Use Storage Dashboard**

**Step 1**: Open Supabase Dashboard
- Go to https://app.supabase.com
- Select your project

**Step 2**: Navigate to Storage
- Click "Storage" (left sidebar)
- Click "seat-layouts" bucket

**Step 3**: Open Bucket Policies
- Click the three dots (⋯) menu on the bucket
- Select "Policies"

**Step 4**: Add/Edit Policies
- Look for existing policies
- If policies exist and blocking uploads, click delete on restrictive ones
- Add new policy: Click "New Policy"

**Step 5**: Add Policy for Upload

Click "+ New Policy" and select "For authenticated users"
```
Policy: Allow authenticated users to upload
Statement: FOR INSERT
With Check: true (allow all)
```

Then click "Review" → "Save policy"

**Step 6**: Add Policy for Read (if needed)

Click "+ New Policy" and select "For all users" 
```
Policy: Allow public read
Statement: FOR SELECT  
With Check: true (allow all)
```

Then click "Review" → "Save policy"

**Step 7**: Test Upload
- Go back to Wandr app
- Try uploading image in Seat Layout Editor
- Should work now! ✓

---

### Alternative: Delete ALL Policies & Use Public Bucket

If bucket policies are too complex:

1. Go to Storage → seat-layouts bucket
2. Click Policies
3. Delete ALL policies (click trash icon on each)
4. Go to bucket "Settings" tab
5. Make sure bucket is "PUBLIC" (not private)
6. Click Save

This removes all restrictions and allows public uploads.

---

## 🧪 Test After Fix

### Test Upload:
```
1. Open Seat Layout Editor
2. Click "Upload denah area"
3. Select PNG/JPG image
4. Should upload successfully ✓
5. Image should display in canvas ✓
```

### Test Persistence:
```
1. Upload image
2. Click "Save Layout"
3. Press F5 to reload
4. Image should still be there ✓
```

---

## 🐛 If Still Getting Error

### Check 1: Verify bucket exists and is PUBLIC
```
Supabase Dashboard → Storage
- See "seat-layouts" bucket? ✓
- Click bucket, check Settings
- Visibility = PUBLIC? ✓
```

### Check 2: Check bucket settings
```
Supabase Dashboard → Storage → seat-layouts
- Click the info/settings icon
- Make sure PUBLIC is selected (not private)
```

### Check 3: Check RLS status
```
Supabase SQL Editor, run:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'objects';
```

Should show: `rowsecurity = false` (RLS disabled) or `t` (RLS enabled but policies allow it)

### Check 4: Check policies
```
Supabase SQL Editor, run:
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

Should show policies for bucket_id = 'seat-layouts'

---

## 📊 Comparison: RLS Options

| Approach | Security | Complexity | Recommended For |
|----------|----------|-----------|-----------------|
| **RLS Disabled** | Public bucket | Simple ✓ | Public image storage (this case) |
| **RLS with Policies** | Controlled access | Medium | If need fine-grained control |
| **RLS + Auth Check** | High security | Complex | Multi-tenant systems |

For a **public image storage bucket**, **disabling RLS is fine and simpler**.

---

## 🚀 After Fix Works

1. ✅ Images upload successfully
2. ✅ Images persist across reloads
3. ✅ Images display in canvas

---

## 📝 Updated SQL File

The file `supabase/sql/setup_storage_seat_layouts.sql` has been updated with the corrected approach.

---

## 💡 Key Points

- **RLS Error**: Policies too restrictive
- **Solution**: Either disable RLS or use correct policies
- **Public Bucket**: RLS disabled is simpler & cleaner
- **Private Bucket**: Need proper RLS policies

---

## ⏱️ Expected Time: 2-3 minutes

1. Open SQL Editor: 30 seconds
2. Run SQL fix: 30 seconds
3. Test upload: 1-2 minutes
4. Done! ✓

