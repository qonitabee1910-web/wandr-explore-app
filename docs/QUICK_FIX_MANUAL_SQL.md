# 🚀 Quick Fix: Run SQL Manually via Dashboard

Karena Docker tidak running, gunakan Supabase Dashboard untuk jalankan migration manually.

## ✅ Steps

### Step 1: Buka Supabase Dashboard
```
https://app.supabase.com/project/isuyxglnkqkszsfymkjl/sql/new
```

### Step 2: Copy & Run Users Table Migration

**Salin semua SQL dari file ini:**
`supabase/migrations/20260401_0_create_users_table_first.sql`

Paste ke SQL Editor dan **klik RUN**

### Step 3: Verify Success

Jalankan query ini:
```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';
```

Harus return 1 row.

### Step 4: Run Other Migrations

Jika Step 3 sukses, jalankan migration berikutnya:
`supabase/migrations/20260417112648_seat_layout_manager.sql`

Dan seterusnya dalam urutan timestamp.

---

## 🔗 Direct Links

- **SQL Editor**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl/sql/new
- **Storage**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl/storage/buckets
- **Database**: https://app.supabase.com/project/isuyxglnkqkszsfymkjl/editor

---

## 💡 Alternative: Start Docker

Jika ingin gunakan CLI:

```bash
# Start Docker Desktop
# Tunggu sampai running

# Then run:
cd "d:\PROYEK WEB MASTER\wandr-explore-app"
supabase db reset
```

---

## ✅ Quick Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Paste users table migration SQL
- [ ] Click RUN
- [ ] Verify users table exists
- [ ] Paste seat_layout_manager migration SQL
- [ ] Click RUN
- [ ] Continue with other migrations
- [ ] Test image upload

---

Share screenshots or results dari SQL Editor ya! 👍
