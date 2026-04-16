# Admin Dashboard - Deployment Guide

Complete guide to deploying the admin dashboard to production.

## 📋 Pre-Deployment Checklist

### Infrastructure
- [ ] Supabase project created
- [ ] PostgreSQL database ready
- [ ] SSL/TLS certificates configured
- [ ] Custom domain configured (optional)
- [ ] CDN setup for static assets (optional)

### Configuration
- [ ] All environment variables defined
- [ ] Payment gateway credentials configured
- [ ] Email SMTP settings configured
- [ ] Notification templates created
- [ ] App settings configured

### Database
- [ ] All migrations executed successfully
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Admin users created with proper roles
- [ ] Test data loaded (optional)

### Code Quality
- [ ] All tests passing: `npm run test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in dev build

### Security
- [ ] API keys not committed to repo
- [ ] Secrets in environment variables only
- [ ] RLS policies verified
- [ ] Admin auth working
- [ ] CORS configured properly

### Documentation
- [ ] README updated
- [ ] Admin guide completed
- [ ] API documentation current
- [ ] Troubleshooting guide reviewed
- [ ] Team trained on dashboard

---

## 🚀 Deployment Steps

### Step 1: Prepare Production Build

```bash
# Ensure clean install
rm -rf node_modules
npm install

# Build for production
npm run build

# Check build output
ls -la dist/

# Verify no errors
npm run type-check
npm run lint
```

### Step 2: Execute Database Migrations

**Via Supabase Dashboard (Recommended):**

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Create new query
5. Copy content from `src/admin/migrations/001_initial_schema.sql`
6. Click "Run"
7. Wait for success
8. Repeat for `002_add_rls_policies.sql`

**Verify migrations:**
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### Step 3: Configure Environment

Create production environment variables:

```bash
# .env.production or platform-specific config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_BASE_URL=https://your-domain.com/api
NODE_ENV=production
```

### Step 4: Create Admin Users

**In Supabase Dashboard:**

1. Go to Auth → Users
2. Click "Invite"
3. Enter admin email
4. Copy invitation link
5. Accept invitation and set password

**Setup admin record:**
```sql
INSERT INTO administrators (id, email, name, role, is_active)
SELECT id, email, 'Admin Name', 'super_admin', true
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;
```

### Step 5: Deploy Application

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or use Git integration
# Push to GitHub, auto-deploys on commits
```

**Vercel Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_API_BASE_URL"
  ]
}
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir dist

# Or use Git integration
# Connect repository in Netlify dashboard
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option C: AWS Amplify

```bash
# Install AWS CLI
aws configure

# Deploy
amplify publish
```

#### Option D: Custom Server (Node.js)

```bash
# Install production dependencies
npm install --production

# Build
npm run build

# Start server
NODE_ENV=production node server.js
```

**server.js:**
```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Step 6: Configure Custom Domain (Optional)

**In Vercel:**
1. Project Settings → Domains
2. Add custom domain
3. Configure DNS records provided

**In Netlify:**
1. Site Settings → Domain Management
2. Add custom domain
3. Update DNS records

### Step 7: Enable HTTPS & Security

**Security Headers (Vercel):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### Step 8: Test Production Deployment

```bash
# Test login
# 1. Navigate to production URL
# 2. Login with admin credentials
# 3. Verify dashboard loads

# Test real-time
# 1. Create test data in one browser
# 2. Should appear instantly in another browser

# Test API calls
# 1. Check network tab in DevTools
# 2. Verify all API calls succeed
# 3. Check response status codes

# Test error handling
# 1. Disable network (DevTools)
# 2. Try to load data
# 3. Should show error message with retry
```

### Step 9: Setup Monitoring & Logging

**Setup Error Tracking (Sentry):**
```bash
npm install @sentry/react

# Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Setup Analytics (Vercel Analytics):**
```bash
npm install @vercel/analytics

# Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourComponent />
      <Analytics />
    </>
  );
}
```

### Step 10: Setup CI/CD Pipeline

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy Admin Dashboard

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 🔒 Post-Deployment Security

### 1. Verify CORS
```bash
# Test CORS headers
curl -i -H "Origin: https://your-domain.com" \
  https://your-project.supabase.co/rest/v1/health
```

### 2. Test Authentication
```typescript
// Verify JWT tokens work
const token = await supabase.auth.getSession();
console.log('Token valid:', token.data.session !== null);
```

### 3. Test RLS Policies
```typescript
// Attempt to access restricted data as different user
const { data, error } = await supabase
  .from('payment_gateway_settings')
  .select('*');
  
// Should succeed for admins, fail for non-admins
```

### 4. Monitor Logs
- Check Supabase logs for errors
- Review application error tracking (Sentry)
- Monitor API response times
- Check database query performance

---

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -D vite-plugin-visualizer

# Check build size
npm run build
du -sh dist/
```

### CDN Setup
- Enable Supabase CDN for assets
- Cache static files (365 days)
- Cache API responses where appropriate

### Database Optimization
```sql
-- Verify indexes are used
EXPLAIN ANALYZE SELECT * FROM pricing_rules WHERE is_active = true;

-- Add missing indexes if needed
CREATE INDEX idx_table_column ON table(column);
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push
```bash
# Vercel: Auto-deploys on push to main
# Netlify: Auto-deploys on push to main

# Manual deployment trigger
npm run deploy:prod
```

### Rollback Procedure
```bash
# If deployment fails:
# 1. Revert to previous commit
git revert HEAD
git push

# 2. Or manually roll back in platform dashboard
# Vercel: Deployments → Select previous → Promote to Production
# Netlify: Deploys → Select previous → Publish deploy
```

---

## 📈 Scaling for Production

### Database
- Enable connection pooling (Supabase)
- Monitor query performance
- Add indexes for slow queries
- Archive old data periodically

### Application
- Enable caching headers
- Implement lazy loading
- Optimize bundle size
- Use Web Workers for heavy computation

### Infrastructure
- Setup load balancing
- Enable auto-scaling
- Setup redundancy
- Configure backups

---

## 🆘 Troubleshooting Deployment

### Blank Page After Deployment
```
Solution:
1. Check browser console for errors
2. Verify environment variables are set
3. Check VITE_SUPABASE_URL is correct
4. Clear browser cache and reload
```

### CORS Errors
```
Solution:
1. Verify Supabase project allows domain
2. Check Authorization header
3. Ensure credentials are correct
4. Verify API endpoint is correct
```

### Real-time Not Working
```
Solution:
1. Enable Realtime in Supabase project
2. Check WebSocket connection (DevTools)
3. Verify RLS policies allow user
4. Check browser supports WebSocket
```

### Database Migrations Failed
```
Solution:
1. Check Supabase SQL syntax
2. Verify user has admin privileges
3. Check if tables already exist
4. Review error message in Supabase
```

---

## 📋 Post-Deployment Tasks

- [ ] Setup monitoring and alerts
- [ ] Configure backup strategy
- [ ] Setup CDN for static assets
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Setup admin access logs
- [ ] Document deployment process
- [ ] Train team on production access
- [ ] Setup on-call rotation
- [ ] Schedule regular security audits

---

## 📞 Support

For deployment issues:
1. Check [Supabase Documentation](https://supabase.com/docs)
2. Review [Vercel Documentation](https://vercel.com/docs) (if using Vercel)
3. Check application logs in browser
4. Review server logs in hosting platform

---

**Last Updated:** April 16, 2026  
**Status:** ✅ Ready for Production  
**Version:** 1.0.0
