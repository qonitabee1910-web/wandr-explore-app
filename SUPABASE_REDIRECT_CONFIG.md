## ⚠️ **Supabase Auth Configuration Required**

The **422 Unprocessable Content** error is caused by Supabase Auth not allowing the redirect URL. Follow these steps to fix it:

---

## ✅ **Step 1: Configure Allowed Redirect URLs in Supabase**

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: wandr-explore-app
3. **Go to Authentication → Redirect URLs** (in sidebar)
4. **Add these URLs**:
   ```
   http://localhost:8080/auth/callback
   http://localhost:3000/auth/callback
   http://127.0.0.1:8080/auth/callback
   ```
5. **Save**

---

## ✅ **Step 2: Update Your Local Development Setup**

### **DO NOT use network IP addresses** (192.168.1.42:8081)
Instead, **always use localhost**:

```bash
# Start dev server on localhost:8080
npm run dev

# Then visit: http://localhost:8080
```

---

## ✅ **Step 3: (Optional) Disable Email Confirmation for Testing**

During development, you might want to skip email confirmation:

1. **Go to Supabase Dashboard**
2. **Authentication → Providers → Email**
3. **Find "Confirm email"** section
4. **Toggle OFF** (for testing only - enable in production!)

Now you can:
- Signup without needing email verification
- Login immediately after signup
- Test flows faster

---

## ✅ **Step 4: Clear Browser State & Test Again**

```
1. Clear browser cookies & cache (Ctrl+Shift+Delete)
2. Go to http://localhost:8080
3. Click "Sign Up"
4. Try signup with: test@example.com, password123
5. Should NOT see 422 error anymore
```

---

## 🔧 **What Was Fixed (Code Changes)**

### **File: `src/pages/Signup.tsx`**
- Now uses `localhost` instead of network IP for redirect URL
- Normalizes email to lowercase before signup

### **File: `src/pages/Login.tsx`**
- Normalizes email to lowercase before login

### **File: `src/services/authService.ts`**
- Fixed redirect URL to use localhost
- Proper email normalization (toLowerCase, trim)
- Better error handling for duplicate profiles (23505)
- Removed `.select().single()` chain that caused issues

### **File: `src/context/UserAuthContext.tsx`**
- Fixed profile creation to not use `.select().single()`
- Better duplicate key error handling (23505)
- Email normalization

---

## 📊 **Why These Changes Were Needed**

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| **422 Error** | Redirect URL not whitelisted | Use localhost in redirect_to |
| **409 Conflict** | Multiple profile creation attempts | Better error handling |
| **23505 Error** | Duplicate primary key | Handle race conditions gracefully |
| **400 Error** | Email case mismatch | Normalize to lowercase |

---

## 🆘 **Still Getting 422?**

### **If error persists:**
1. ✅ Check you added localhost URLs to Supabase
2. ✅ Clear browser cache completely
3. ✅ Use http://localhost:8080 (not IP address)
4. ✅ In incognito/private window, try again
5. ✅ Check Supabase logs for more details:
   - Go to Supabase Dashboard
   - Click "Logs" (bottom of sidebar)
   - Filter for auth errors

### **If still stuck:**
1. Go to Supabase Dashboard
2. Copy current Redirect URLs config
3. Add `http://localhost:8080/auth/callback` exactly as shown above
4. Save
5. Try signup again

---

## ✨ **After Signup Works:**

Once signup succeeds:

1. ✅ Check Supabase Dashboard → Auth → Users
   - Your new user should appear

2. ✅ Check email (if confirmation enabled)
   - Verification link should be in inbox

3. ✅ Try login at `/login`
   - Should work without 400 errors

4. ✅ Try protected routes (like `/shuttle`)
   - Should redirect to login, then work after login

---

## 🔒 **For Production Deployment**

When deploying to production:

1. **Update allowed redirect URLs** in Supabase:
   ```
   https://your-domain.com/auth/callback
   https://www.your-domain.com/auth/callback
   ```

2. **Enable email confirmation** (Auth → Email → Confirm email → ON)

3. **Set strong password requirements** (Auth → Policies)

4. **Enable additional auth providers** (OAuth, social login, etc.)

---

## 📚 **Related Documentation**

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [QUICK_START_AUTH.md](./QUICK_START_AUTH.md) - Quick reference
- [MIGRATIONS_REVIEW.md](./MIGRATIONS_REVIEW.md) - Migration details
- [API_ERRORS_FIXED.md](./API_ERRORS_FIXED.md) - Previous error fixes

---

## ✅ **Checklist**

- [ ] Added localhost URLs to Supabase redirect URLs
- [ ] Cleared browser cache & cookies
- [ ] Using http://localhost:8080 (not IP address)
- [ ] Tried signup again without 422 error
- [ ] Signup success message appears
- [ ] User appears in Supabase Auth → Users

---

**Status**: ✅ Code fixed | ⏳ Awaiting Supabase configuration (user action required)
