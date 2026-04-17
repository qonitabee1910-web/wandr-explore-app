# 📋 Complete Manual Setup Guide

Docker Desktop tidak running? Gunakan panduan ini untuk setup via Supabase Dashboard!

---

## ✅ 3 SQL Files Siap Copy-Paste

| # | File | Purpose |
|---|------|---------|
| 1 | `SQL_TO_PASTE_1_USERS_TABLE.sql` | ✅ Create users table + function |
| 2 | `SQL_TO_PASTE_2_SEAT_LAYOUTS.sql` | ✅ Create seat layout tables |
| 3 | `SQL_TO_PASTE_3_STORAGE_BUCKET.sql` | ✅ Setup storage bucket |

---

## 🚀 Step-by-Step Instructions

### **STEP 1: Buka Supabase Dashboard**

1. Go to: https://app.supabase.com
2. Sign in dengan akun Anda
3. Klik project `isuyxglnkqkszsfymkjl`

### **STEP 2: Buka SQL Editor**

Dari Dashboard:
- Klik **SQL Editor** (left sidebar)
- Klik **New Query**

### **STEP 3: Run SQL #1 - Users Table**

1. Buka file: `SQL_TO_PASTE_1_USERS_TABLE.sql`
2. **Ctrl+A** untuk select all
3. **Ctrl+C** untuk copy
4. Paste ke SQL Editor
5. Klik tombol **RUN** (kanan atas)
6. Tunggu sampai selesai (jangan close tab)

**Verifikasi Success:**
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';
```
Harus return 1 row.

### **STEP 4: Run SQL #2 - Seat Layouts**

1. Buka file: `SQL_TO_PASTE_2_SEAT_LAYOUTS.sql`
2. Copy semua
3. Clear existing query di SQL Editor
4. Paste SQL baru
5. Klik **RUN**
6. Tunggu sampai selesai

**Verifikasi Success:**
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seat_layouts';
```

### **STEP 5: Run SQL #3 - Storage Bucket**

1. Buka file: `SQL_TO_PASTE_3_STORAGE_BUCKET.sql`
2. Copy semua
3. Clear existing query
4. Paste SQL baru
5. Klik **RUN**

**Verifikasi Success:**
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'seat-layouts';
```
Harus return 1 row dengan `public = true`.

---

## ✅ Verification Checklist

Jalankan query berikut untuk verify semua berhasil:

### Check All Tables Exist
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected output:
- layout_history
- seat_categories
- seat_layouts
- seats
- users

### Check Storage Bucket
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'seat-layouts';
```

Expected: 1 row, `public = true`

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('users', 'seat_layouts', 'seats', 'objects')
ORDER BY tablename, policyname;
```

Expected: Multiple rows untuk RLS policies

---

## 🔍 Troubleshooting

### ❌ Error: "relation users already exists"
- Tidak masalah - berarti table sudah ada
- Hapus SQL yang create table, atau gunakan `DROP TABLE IF EXISTS` dulu

### ❌ Error: "function update_updated_at_column() does not exist"
- Pastikan SQL #1 sudah dijalankan sampai selesai
- SQL #2 membutuhkan function dari SQL #1

### ❌ Storage bucket masih belum bisa diakses
- Verifikasi `public = true`
- Buka Storage tab di Supabase Dashboard
- Confirm bucket "seat-layouts" ada dan PUBLIC

### ❌ RLS Policy Error
- Pastikan users table sudah ada
- SQL #2 policies reference users table

---

## 🎯 Next Steps (Setelah SQL Berhasil)

1. ✅ Verify semua tables dan policies
2. ✅ Test membuat admin user
3. ✅ Test image upload dari app
4. ✅ Verify image muncul di storage
5. ✅ Test image display di canvas

---

## 📁 Location of SQL Files

Semua file ada di project root:

```
d:\PROYEK WEB MASTER\wandr-explore-app\
├── SQL_TO_PASTE_1_USERS_TABLE.sql
├── SQL_TO_PASTE_2_SEAT_LAYOUTS.sql
└── SQL_TO_PASTE_3_STORAGE_BUCKET.sql
```

---

## 💡 Pro Tips

1. **Copy-Paste dari VS Code**
   - Buka file di VS Code
   - Right-click → "Reveal in Explorer"
   - Copy to clipboard

2. **Format SQL lebih rapi**
   - Di SQL Editor, ada tombol **Format**
   - Buat lebih mudah dibaca

3. **Save Query**
   - Setelah sukses run, klik **Save** di SQL Editor
   - Berguna untuk future reference

4. **Export Data**
   - Bisa export hasil query sebagai CSV
   - Klik ... menu → Download

---

## 📞 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Your Project**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl
- **SQL Editor**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl/sql/new
- **Storage**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl/storage/buckets

---

**Sudah siap? Share hasil dari setiap step! 👍**

Last Updated: 2026-04-27
