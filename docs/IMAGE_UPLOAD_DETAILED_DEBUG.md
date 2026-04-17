# Image Upload Debug - Full Logging Guide

## ✅ Enhanced Logging Added

Saya sudah add detailed logging di setiap step untuk track exact issue:

### Logging Points:

1. **seatLayoutService.ts** - Upload started
   ```
   [SeatLayoutService] uploadBaseMapImage called: {...}
   [SeatLayoutService] Generated filename: layout-xxx-timestamp.jpg
   [SeatLayoutService] Starting storage upload...
   [SeatLayoutService] Storage upload successful: {...}
   [SeatLayoutService] Generated public URL: https://...
   [SeatLayoutService] Image uploaded successfully: {...}
   ```

2. **SeatLayoutEditor.tsx** - Handler processing
   ```
   [SeatLayoutEditor] Starting upload for file: image.jpg
   [SeatLayoutEditor] Upload response: {publicUrl, error}
   [SeatLayoutEditor] Setting base_map_url to: https://...
   [SeatLayoutEditor] Layout state updated: {...}
   ```

3. **SeatLayoutEditor.tsx** - State change effect
   ```
   [SeatLayoutEditor] Layout updated: {name, base_map_url, numSeats}
   ```

---

## 🧪 Step-by-Step Testing

### Step 1: Clear & Hard Refresh
```
1. Ctrl + Shift + Delete → Clear all
2. Ctrl + F5 (hard refresh)
3. Wait for page to fully load
```

### Step 2: Open Console
```
F12 → Console tab
```

### Step 3: Try Upload
```
1. Click "Upload denah area (PNG/JPO)"
2. Select any PNG/JPG file
3. Wait for toast "Image uploaded successfully"
```

### Step 4: Copy Full Console Output
Follow this sequence of logs:

**First - Service logs:**
```
[SeatLayoutService] uploadBaseMapImage called: {
  fileName: "image.jpg"
  fileSize: 245678
  fileType: "image/jpeg"
  layoutId: "temp-1776450925419"
  supabaseUrl: "https://bettsililhodvxiuzdvr.supabase.co"
}

[SeatLayoutService] Generated filename: "layout-temp-1776450925419-1776450925421.jpg"
[SeatLayoutService] Starting storage upload...
[SeatLayoutService] Storage upload successful: { ... }
[SeatLayoutService] Generated public URL: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-temp-1776450925419-1776450925421.jpg"

[SeatLayoutService] Image uploaded successfully: {
  filename: "layout-temp-1776450925419-1776450925421.jpg"
  publicUrl: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-..."
  size: 245678
  supabaseUrl: "https://bettsililhodvxiuzdvr.supabase.co"
}
```

**Second - Handler logs:**
```
[SeatLayoutEditor] Starting upload for file: "image.jpg" Layout ID: "temp-1776450925419"
[SeatLayoutEditor] Upload response: {
  publicUrl: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-..."
  error: undefined
}
[SeatLayoutEditor] Setting base_map_url to: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-..."
[SeatLayoutEditor] Layout state updated: {
  base_map_url: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-..."
  numSeats: 0
  ...
}
```

**Third - State effect:**
```
[SeatLayoutEditor] Layout updated: {
  name: "Untitled Layout"
  base_map_url: "https://bettsililhodvxiuzdvr.supabase.co/storage/v1/object/public/seat-layouts/layout-..."
  numSeats: 0
  status: "draft"
}
```

---

## 🔍 What to Check

### Check 1: Does `publicUrl` exist?
```
If you see:
✅ publicUrl: "https://..."  → Good!
❌ publicUrl: undefined      → Error in URL generation
```

### Check 2: Is URL format correct?
```
✅ Correct: https://{project}.supabase.co/storage/v1/object/public/seat-layouts/layout-xxx.jpg
❌ Wrong:   https://{project}.supabase.co/storage/v1/object/seat-layouts/layout-xxx.jpg
                                                    (missing "/public/")
```

### Check 3: Is state being updated?
```
✅ You should see "[SeatLayoutEditor] Layout updated" log after "Layout state updated"
❌ If missing → state update not happening
```

### Check 4: Does canvas show image?
```
1. After upload log, look at canvas area
2. Inspect element (F12 → Elements)
3. Find div.seat-map-canvas
4. Check "Computed" tab
5. Look for: backgroundImage: url("https://...")
```

### Check 5: Test URL directly
```
1. Copy the publicUrl from console
2. Open new tab
3. Paste URL in address bar
4. Should show image OR download
5. If 400/403 → bucket issue
6. If works → CSS issue on canvas
```

---

## 📋 Common Issues

### Issue 1: publicUrl is undefined
**Console shows**: `publicUrl: undefined`
**Action**: Check if VITE_SUPABASE_URL is set in .env.local
```
1. Check .env.local exists
2. Has line: VITE_SUPABASE_URL=https://bettsililhodvxiuzdvr.supabase.co
3. If missing, add it
4. Stop dev server (Ctrl+C)
5. Restart: npm run dev
```

### Issue 2: Error in storage upload
**Console shows**: `[SeatLayoutService] Storage upload failed: {...}`
**Action**: Check RLS policies
```
1. Supabase Dashboard → Storage → seat-layouts
2. Click "Policies"
3. Should have policies for INSERT
4. If empty, add policies (see STORAGE_RLS_ERROR_FIX.md)
```

### Issue 3: URL returns 400/403
**Console shows**: URL looks correct, but test direct URL fails
**Action**: Check bucket visibility
```
1. Supabase Dashboard → Storage → seat-layouts
2. Click bucket
3. Check "Visibility" = PUBLIC
4. If PRIVATE, click and change to PUBLIC
```

### Issue 4: Canvas still blank after all passes
**Console shows**: All logs OK, URL correct, layout state updated
**Action**: CSS issue
```
1. F12 → Elements tab
2. Find div.seat-map-canvas
3. Check style attribute
4. Should have: backgroundImage: url("https://...")
5. If missing → CSS not rendering
```

---

## ✅ Full Success Scenario

```
1. Upload starts
   ✓ File validation passes
   ✓ Filename generated
   ✓ Storage upload successful
   ✓ Public URL generated (correct format with /public/)

2. Handler receives URL
   ✓ publicUrl is not undefined
   ✓ error is undefined
   ✓ State updated with base_map_url

3. State change triggers effect
   ✓ Layout updated log shows correct URL

4. Canvas renders
   ✓ Inspect shows backgroundImage: url("https://...")
   ✓ Image appears on canvas
```

---

## 📝 Share This Info

Please paste/screenshot:
1. **Full console output** from all 3 sections
2. **Canvas inspection** (Elements tab showing backgroundImage)
3. **Network tab** status of the image request (if any)
4. **URL test result** (when you paste publicUrl directly in browser)

This will help us identify EXACTLY where the break is happening!

---

## Build Status
✅ Build successful with enhanced logging
✅ Ready to test
