# Seat Layout Image Upload - Fix & Setup Guide

## 🐛 Problem Found & Fixed

### Issue:
Image uploads in Seat Layout Editor were not displaying/persisting.

### Root Cause:
```typescript
// OLD APPROACH (Broken)
const reader = new FileReader();
reader.onload = (event) => {
  setLayout(prev => ({ ...prev, base_map_url: event.target?.result as string }));
};
reader.readAsDataURL(file);
```

**Why broken**:
1. Converts image to base64 data URL (e.g., `data:image/png;base64,iVBORw0KGgo...` - hundreds of KB)
2. Stores entire data URL in database `base_map_url` VARCHAR(500) field
3. Data URL is **too large** (can be 500KB+) for VARCHAR(500)
4. Either truncated or fails to save → image missing on reload

---

## ✅ Solution Implemented

### New Approach:
```typescript
// NEW APPROACH (Working)
const { data: publicUrl, error } = await seatLayoutService.uploadBaseMapImage(file, layoutId);
setLayout(prev => ({ ...prev, base_map_url: publicUrl }));
```

**How it works**:
1. Upload image file to Supabase Storage (not database)
2. Get public URL from storage (e.g., `https://...bucket.../layout-uuid-123.jpg`)
3. Store **only the URL** (short string, ~200 chars) in database
4. Display image by loading from public URL

---

## 🔧 Implementation Details

### 1. Added: Image Upload Function
**File**: `src/admin/services/seatLayoutService.ts`

```typescript
async uploadBaseMapImage(file: File, layoutId: string) {
  // Validate file
  // Upload to Supabase Storage
  // Get public URL
  // Return URL
}
```

**Features**:
- ✅ File type validation (must be image)
- ✅ File size check (max 5MB)
- ✅ Unique filename generation
- ✅ Returns public URL for database storage
- ✅ Error handling & logging

### 2. Updated: File Upload Handler
**File**: `src/admin/pages/SeatLayoutEditor.tsx`

```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  const { data: publicUrl, error } = await seatLayoutService.uploadBaseMapImage(file, layoutId);
  
  if (error) {
    toast.error(`Upload failed: ${error.message}`);
    return;
  }

  setLayout(prev => ({ ...prev, base_map_url: publicUrl }));
  toast.success('Image uploaded successfully');
  setIsUploading(false);
};
```

**Changes**:
- Now async (waits for upload)
- Calls new `uploadBaseMapImage()` function
- Stores public URL (not data URL)
- Better error handling & user feedback

---

## 🚀 Setup Requirements

### Prerequisite: Create Supabase Storage Bucket

**Step 1**: Go to Supabase Dashboard
```
https://app.supabase.com
```

**Step 2**: Navigate to Storage
```
Click Storage in left sidebar
```

**Step 3**: Create New Bucket
```
1. Click "New bucket"
2. Name: "seat-layouts"
3. Make it PUBLIC (important for accessing images)
4. Click Create
```

**Step 4**: Verify Bucket Settings
```
- Name: seat-layouts
- Visibility: Public ✓
- File size limit: Can leave default or set to 5-10MB
```

### Permissions (RLS Policy)

**Option A: Simple (Allow public read)**
```sql
-- Allow anyone to read from seat-layouts bucket
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'seat-layouts');

-- Allow authenticated admin to upload/manage
CREATE POLICY "Allow admin upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'seat-layouts' 
  AND auth.role() = 'authenticated'
);
```

**Option B: Full Access (Development)**
```sql
-- In Supabase SQL Editor, run:
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

---

## 📁 Data Flow

### Before (Broken):
```
User uploads image
    ↓
FileReader converts to base64 data URL
    ↓
Store data URL in layout.base_map_url (memory)
    ↓
Save layout to database (including data URL)
    ↓
Data URL too large → truncated/lost
    ↓
Reload layout → base_map_url is empty/invalid
    ↓
Image doesn't display ❌
```

### After (Fixed):
```
User uploads image
    ↓
uploadBaseMapImage() sends file to Supabase Storage
    ↓
Get public URL from storage: https://bucket.../layout-uuid.jpg
    ↓
Store URL in layout.base_map_url (memory)
    ↓
Save layout to database (URL is short ~200 chars)
    ↓
URL persists ✓
    ↓
Reload layout → base_map_url has valid URL
    ↓
Image displays from public URL ✓
```

---

## 🧪 Testing

### Test 1: Upload Image
**Steps**:
1. Open Seat Layout Editor
2. In "Base Map" section, click "Upload denah area"
3. Select a PNG/JPG image
4. Wait for "Image uploaded successfully" toast

**Expected**:
- ✅ Background image appears in canvas
- ✅ Toast shows success message
- ✅ Image persists when you scroll/resize

### Test 2: Save & Reload
**Steps**:
1. Upload image (see Test 1)
2. Click "Save Layout" button
3. Wait for save to complete
4. Reload the page (F5)
5. Re-open the same layout

**Expected**:
- ✅ Image still displays after reload
- ✅ Layout loads with base_map_url populated

### Test 3: Different Image Formats
**Steps**:
1. Upload PNG → verify displays
2. Upload JPG → verify displays
3. Upload large image (2MB+) → verify uploads but smaller
4. Try uploading non-image (should fail)

**Expected**:
- ✅ PNG, JPG, WebP work
- ✅ Large images handled gracefully
- ✅ Non-images rejected with error message

---

## 📊 Technical Specs

### Storage Location:
```
Bucket: seat-layouts
File path: layout-{layoutId}-{timestamp}.{ext}
Example: layout-550e8400-e29b-41d4-a716-446655440000-1713406800123.jpg
```

### File Constraints:
```
- Type: Images only (image/*)
- Max size: 5MB
- Formats: PNG, JPG, WebP, GIF, etc.
```

### Database Storage:
```
Field: seat_layouts.base_map_url
Type: VARCHAR(500)
Contains: Public URL (e.g., https://bucket.../layout-uuid.jpg)
Size: ~200 characters (plenty of room)
```

### URL Format:
```
https://{project-id}.supabase.co/storage/v1/object/public/seat-layouts/{filename}
```

---

## 🔍 Debugging

### Image Not Displaying?

**Check 1**: Console Logs
```javascript
// Open DevTools → Console
// Look for: [SeatLayoutEditor] or [SeatLayoutService]
// Should see: "Image uploaded successfully"
```

**Check 2**: Image URL
```javascript
// In console:
document.querySelector('div[style*="backgroundImage"]')?.style.backgroundImage
// Should show: url(https://...)
```

**Check 3**: Network Tab
```
1. Open DevTools → Network
2. Filter by "img" or "media"
3. Upload image
4. Should see request to supabase.co/storage
5. Check response status (200 = OK)
```

**Check 4**: Supabase Dashboard
```
1. Go to Storage → seat-layouts
2. Should see uploaded files listed
3. Click file → view/download to verify upload worked
```

### Upload Fails?

**Check Bucket Exists**:
```
Supabase → Storage → should see "seat-layouts" bucket
If not: Create it (see Setup section)
```

**Check Bucket is Public**:
```
Click seat-layouts bucket
Click Settings
Visibility should be: PUBLIC (green)
```

**Check File Size**:
```
Error: "File size must be less than 5MB"
Solution: Use smaller image
```

**Check Browser Console**:
```
Look for specific error message
[SeatLayoutService] Upload Error: {details}
```

---

## 📝 Configuration

### Environment Variables:
```
.env.local should have:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### No changes needed to:
- React components (already updated)
- TypeScript types
- Build configuration

---

## ✅ Verification Checklist

- [x] Added `uploadBaseMapImage()` to seatLayoutService
- [x] Updated `handleFileUpload()` in SeatLayoutEditor
- [x] Build passes (0 errors)
- [ ] Storage bucket created in Supabase
- [ ] Manual upload test passed
- [ ] Save & reload test passed
- [ ] Different image formats tested

---

## 🎯 Next Steps

1. **Create Storage Bucket** (if not already done):
   - Follow Setup section above
   - Name: "seat-layouts"
   - Visibility: PUBLIC

2. **Test Upload**:
   - Open Seat Layout Editor
   - Upload an image
   - Verify displays in canvas
   - Save & reload to verify persistence

3. **Troubleshoot** (if issues):
   - Check Supabase Storage bucket exists
   - Verify bucket is public
   - Check browser console for errors
   - See Debugging section above

---

## 📚 Related Files

- `src/admin/services/seatLayoutService.ts` - Image upload function
- `src/admin/pages/SeatLayoutEditor.tsx` - Upload UI & handler
- `src/lib/supabase.ts` - Supabase client config

---

## 🚨 Important Notes

1. **Storage Bucket Must Be Public**: Without public visibility, images won't load
2. **URL is Stored, Not Data**: Only the public URL (~200 chars) goes in database
3. **File Size Limit**: Set to 5MB to prevent storage bloat
4. **Unique Filenames**: Each upload gets unique name to prevent overwrites

---

**Status**: ✅ **CODE COMPLETE** (ready for testing after bucket setup)
