# ✅ Quick Checklist - Manual Setup via Dashboard

**Estimated Time: 10 minutes**

---

## 🚀 STEP 1: Prepare SQL Files (2 min)

- [ ] Open project in VS Code
- [ ] Open file: `SQL_TO_PASTE_1_USERS_TABLE.sql`
- [ ] Verify content is there
- [ ] Open file: `SQL_TO_PASTE_2_SEAT_LAYOUTS.sql`
- [ ] Open file: `SQL_TO_PASTE_3_STORAGE_BUCKET.sql`

---

## 🌐 STEP 2: Open Supabase Dashboard (1 min)

- [ ] Go to: https://app.supabase.com
- [ ] Sign in with your account
- [ ] Click project: `isuyxglnkqkszsfymkjl`
- [ ] On left sidebar, click **SQL Editor**
- [ ] Click **New Query**

---

## 🗂️ STEP 3: Run SQL #1 - Users Table (2 min)

**IN VS CODE:**
- [ ] Open: `SQL_TO_PASTE_1_USERS_TABLE.sql`
- [ ] Select All: `Ctrl+A`
- [ ] Copy: `Ctrl+C`

**IN DASHBOARD SQL EDITOR:**
- [ ] Click in editor
- [ ] Paste: `Ctrl+V`
- [ ] Click **RUN** button (right side)
- [ ] Wait for success message (green checkmark)

**VERIFY:**
- [ ] Run this query in same editor:
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';
```
- [ ] Result shows 1 row ✅

---

## 📦 STEP 4: Run SQL #2 - Seat Layouts (2 min)

**IN VS CODE:**
- [ ] Open: `SQL_TO_PASTE_2_SEAT_LAYOUTS.sql`
- [ ] Select All: `Ctrl+A`
- [ ] Copy: `Ctrl+C`

**IN DASHBOARD SQL EDITOR:**
- [ ] Clear existing query: `Ctrl+A` then `Delete`
- [ ] Paste new SQL: `Ctrl+V`
- [ ] Click **RUN**
- [ ] Wait for success

**VERIFY:**
- [ ] Run query:
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seat_layouts';
```
- [ ] Result shows 1 row ✅

---

## 💾 STEP 5: Run SQL #3 - Storage Bucket (2 min)

**IN VS CODE:**
- [ ] Open: `SQL_TO_PASTE_3_STORAGE_BUCKET.sql`
- [ ] Select All: `Ctrl+A`
- [ ] Copy: `Ctrl+C`

**IN DASHBOARD SQL EDITOR:**
- [ ] Clear existing query
- [ ] Paste new SQL
- [ ] Click **RUN**
- [ ] Wait for success

**VERIFY:**
- [ ] Run query:
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'seat-layouts';
```
- [ ] Result shows 1 row with `public = true` ✅

---

## 🔍 STEP 6: Final Verification (1 min)

**Check all tables exist:**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected tables:
- [ ] layout_history
- [ ] seat_categories
- [ ] seat_layouts
- [ ] seats
- [ ] users

---

## ✅ ALL DONE!

If all checks passed:
- [ ] Database setup complete ✅
- [ ] Storage bucket created ✅
- [ ] RLS policies configured ✅
- [ ] Ready to test image upload ✅

---

## 🎯 Next: Test Image Upload

1. Go to app: http://localhost:5173/admin
2. Create new seat layout
3. Upload a test image
4. Verify image appears in Supabase Storage
5. Verify image displays on canvas

---

## ⚠️ If Something Goes Wrong

| Symptom | Fix |
|---------|-----|
| "relation already exists" | Normal - means table already created |
| "function doesn't exist" | Make sure you ran SQL #1 first |
| "bucket not found" | Make sure you ran SQL #3 |
| Query takes too long | Just wait, can take 5-10 seconds |

**Can't figure it out?**
- Check `docs/MANUAL_SETUP_COMPLETE_GUIDE.md`
- Or `SETUP_SUMMARY.md`

---

**Status**: ⏳ Ready to start
**Time**: ~10 minutes
**Difficulty**: ⭐ Easy

Go! 🚀
