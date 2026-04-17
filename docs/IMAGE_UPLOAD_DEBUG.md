# Image Upload Debugging Guide

## 🔧 Applied Fixes

### Fix 1: Supabase URL Source
**Problem**: Trying to access `supabase.supabaseUrl` (not exposed on client)
**Solution**: Import URL directly from environment variable
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/seat-layouts/${filename}`;
```

### Fix 2: CSS URL Quotes
**Problem**: `url(${layout.base_map_url})` might not parse correctly
**Solution**: Add quotes around URL
```typescript
// Before: url(${layout.base_map_url})
// After: url("${layout.base_map_url}")
```

### Fix 3: Background CSS Properties
**Added**: `backgroundOrigin: 'content-box'` for better image positioning

---

## 🧪 Debug Steps (Ikuti ini)

### Step 1: Clear Browser Cache
```
Ctrl + Shift + Delete
→ Select "All time"
→ Check: Cookies, Images/Media
→ Click "Clear data"
```

### Step 2: Hard Refresh
```
Ctrl + F5 (or Cmd + Shift + R on Mac)
```

### Step 3: Open Browser Console
```
F12 → Console tab
```

### Step 4: Try Upload Gambar
```
1. Click "Upload denah area (PNG/JPO)"
2. Select any PNG/JPG file
3. Wait for upload to complete
```

### Step 5: Check Console Output

**Look for this log message:**
```
[SeatLayoutService] Image uploaded successfully:
  filename: layout-xxx-1776450925421.png
  publicUrl: https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-xxx-1776450925421.png
  size: 245678
  supabaseUrl: https://bettsililhodvxiuzdvr.supabase.co
```

### Step 6: Check for Errors
Look for any of these errors:
```
[SeatLayoutEditor] Upload error: ...
[SeatLayoutService] Upload Error: ...
[SeatLayoutService] Upload Exception: ...
```

### Step 7: Test URL Directly
**Copy the publicUrl from console and:**
```
1. Open new browser tab
2. Paste URL
3. Should download/display the image
4. If 400/403 error → storage bucket permissions issue
```

---

## 🐛 Common Issues & Solutions

### Issue 1: URL is `undefined`
**Console shows**: `publicUrl: undefined`
**Cause**: `VITE_SUPABASE_URL` not set in `.env.local`
**Fix**:
```
1. Check .env.local has: VITE_SUPABASE_URL=https://project.supabase.co
2. Restart dev server: Ctrl+C then `npm run dev`
```

### Issue 2: 400/403 Error on Direct URL
**Console shows**: URL loads but 400/403 error
**Cause**: Storage bucket not public or file upload failed
**Fix**:
```
1. Go to Supabase Dashboard → Storage → seat-layouts
2. Check bucket "Visibility" = PUBLIC
3. Click on uploaded file → check if exists
```

### Issue 3: Image Still Not Showing in Canvas
**Console shows**: URL looks correct, but canvas blank
**Cause**: CSS might not be rendering background image
**Fix**:
```
1. Open Inspector (F12 → Elements tab)
2. Find div.seat-map-canvas
3. Check "Computed" styles → look for backgroundImage
4. Should show: url("https://...")
```

### Issue 4: CORS Error
**Console shows**: 
```
Access to image at 'https://...' from origin 'http://10.64.99.214:8080' 
has been blocked by CORS policy
```
**Cause**: Storage bucket CORS not configured
**Fix**:
```
This shouldn't happen for PUBLIC buckets
If it does, contact support or create new bucket
```

---

## 📋 Debug Info to Share

When sharing results, please provide:

```
1. Browser Console Output (copy paste):
   - Upload success log (if any)
   - Errors (if any)
   - publicUrl value

2. Network Tab (F12 → Network → reload):
   - Is there a request to storage URL?
   - What status code? (200, 400, 403, 404?)
   - Response headers?

3. Application/Storage Tab (F12 → Application):
   - Check localStorage → look for layout data
   - Is base_map_url stored there?

4. Screenshot of:
   - Canvas area (before/after upload)
   - Console output
   - Network tab request
```

---

## ✅ What Should Happen

```
1. Click upload → file input dialog
2. Select image → upload starts
3. Toast message: "Image uploaded successfully"
4. Canvas background → shows image
5. Inspect canvas → backgroundImage CSS shows URL
6. Hard refresh → image still visible
```

---

## 🚀 Next Action

**Please run Steps 1-7 above and share:**
1. Console output (screenshot or text)
2. Network tab status codes
3. The publicUrl being generated

This will help us identify exactly where the issue is!

---

## 📊 Build Status
✅ Build successful (3252 modules, 0 errors)
✅ Ready to test
