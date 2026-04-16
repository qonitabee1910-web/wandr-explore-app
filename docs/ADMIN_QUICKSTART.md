# Admin Dashboard - Quick Start Guide

**Total Setup Time:** 30 minutes  
**Status:** ✅ Ready to deploy  
**Last Updated:** April 16, 2026

---

## 📋 Quick Overview

**What:** PYU-GO Admin Web Dashboard  
**Purpose:** Manage drivers, rides, shuttles, pricing, promos, and ads  
**Tech:** React + TypeScript + Supabase  
**Users:** Super Admin, Admin, Moderator, Analyst  

---

## ⚡ 5-Minute Setup

### 1. Environment Setup (2 minutes)

```bash
# Create .env.local file
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5173/api
EOF
```

Get credentials from [Supabase Dashboard](https://supabase.com/dashboard)

### 2. Database Setup (10 minutes)

**In Supabase Dashboard:**

1. Go to SQL Editor
2. Create new query
3. Copy content from: `src/admin/migrations/001_initial_schema.sql`
4. Execute
5. Repeat for: `src/admin/migrations/002_add_rls_policies.sql`

### 3. Start Dev Server (1 minute)

```bash
npm run dev
```

Access: `http://localhost:5173/admin/dashboard`

---

## 📁 8 Modules at a Glance

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Dashboard** | Real-time analytics | Stats, charts, KPIs, trends |
| **Drivers** | Manage drivers | Approve, suspend, track ratings |
| **Rides** | Monitor rides | Track, cancel, view analytics |
| **Shuttles** | Manage shuttles | Routes, schedules, occupancy |
| **Pricing** | Control pricing | Rules, surge, fare calculator |
| **Promos** | Manage promos | Create codes, track usage |
| **Ads** | Ad campaigns | Create ads, track performance |
| **Settings** | Configuration | Payment, email, app settings |

---

## 🎯 First Actions Checklist

### Day 1: Setup
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Development server running
- [ ] Can access dashboard at `/admin/dashboard`
- [ ] Can see sample data

### Day 2: Familiarize
- [ ] Explored all 8 modules
- [ ] Created test promo code
- [ ] Created test ad
- [ ] Updated pricing rule
- [ ] Approved test driver

### Day 3: Customize
- [ ] Set payment gateway
- [ ] Configured email settings
- [ ] Adjusted app settings
- [ ] Set surge multipliers
- [ ] Enabled/disabled features

---

## 🔑 Key Credentials

```
Admin Dashboard URL: http://localhost:5173/admin
Login: admin@pyu-go.com (after setup)
Password: Set in Supabase Auth

Supabase Project URL: https://your-project.supabase.co
API URL: http://localhost:5173/api
```

---

## 🚀 Common Tasks

### Create a Promo Code

```typescript
// In src/admin/pages/Promos.tsx
await promoService.createPromo({
  code: 'SAVE20',
  name: 'Save 20%',
  promo_type: 'percentage',
  value: 20,
  usage_limit: 1000,
  valid_from: new Date().toISOString(),
  valid_to: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
});
```

### Approve a Driver

```typescript
// In Driver Management
await driverService.approveDriver({
  driver_id: 'driver-123',
  approved: true,
  approval_notes: 'Documents verified',
});
```

### Create Pricing Rule

```typescript
// In Pricing Control
await pricingService.createPricingRule({
  rule_type: 'surge',
  name: 'Peak Hours Surge',
  service_type: 'ride',
  value: 1.5,
  active: true,
  priority: 1,
});
```

### Calculate Fare

```typescript
// Get fare estimate
const estimate = await pricingService.calculateFareEstimate(
  5.5,  // distance in km
  900,  // duration in seconds
  'ride'
);
// Returns: {base_fare, distance_fare, time_fare, total_fare}
```

---

## 📊 Dashboard Overview

**Real-Time Metrics:**
- Total Rides
- Active Users
- Total Revenue
- Completed Rides
- Pending Approvals
- Canceled Rides

**Charts:**
- Revenue & Rides Trend (7 days)
- Ride Status Distribution
- Key Performance Indicators

---

## 🔐 Authentication

### Admin Roles
```
super_admin  → Full access to everything
admin        → Manage operations and content
moderator    → Moderate content, approve drivers
analyst      → View-only access to analytics
```

### Sample Admin User

Create in Supabase Auth:
```
Email: admin@pyu-go.com
Password: SecurePassword123!
Role: super_admin
```

---

## 🔄 Real-Time Features

All updates are **real-time**:
- Ride status changes → Instant update
- Driver approvals → Live notification
- Pricing changes → Immediate effect
- Promo usage → Real-time tracking
- Ad metrics → Live statistics

---

## 🐛 Quick Fixes

### Page blank after login?
1. Check `.env.local` is set correctly
2. Restart dev server
3. Clear browser cache
4. Check browser console for errors

### Services not working?
1. Verify database migrations ran
2. Check Supabase RLS policies enabled
3. Confirm user role is 'admin' or 'super_admin'
4. Check network tab for API errors

### Real-time not updating?
1. Enable Realtime in Supabase project
2. Check WebSocket connection (browser DevTools → Network)
3. Verify table has realtime enabled
4. Refresh page if connection lost

---

## 📈 Performance Tips

```typescript
// ✅ Good: Pagination
const { data, page } = await driverService.getDrivers({
  page: 1,
  limit: 20,  // Don't load all at once
});

// ✅ Good: Filtering early
const { data } = await rideService.getRides({
  status: 'completed',  // Filter server-side
  startDate: '2024-01-01',
});

// ❌ Bad: Load all and filter client-side
const allRides = await rideService.getAllRides();  // Heavy!
const filtered = allRides.filter(r => r.status === 'completed');
```

---

## 📚 Documentation Links

1. **Complete Developer Guide**  
   → `docs/ADMIN_DASHBOARD_GUIDE.md`

2. **API Services Reference**  
   → Services section in guide

3. **Database Schema**  
   → `src/admin/migrations/001_initial_schema.sql`

4. **Type Definitions**  
   → `src/admin/types/index.ts`

5. **Component Examples**  
   → `src/admin/pages/`

---

## 🎓 Learning Path

**Week 1: Basics**
- [ ] Setup and first deploy
- [ ] Explore all 8 modules
- [ ] Create test data
- [ ] Understand real-time features

**Week 2: Integration**
- [ ] Set up payment gateway
- [ ] Configure email
- [ ] Create pricing rules
- [ ] Launch test campaign

**Week 3: Optimization**
- [ ] Monitor performance
- [ ] Analyze metrics
- [ ] Fine-tune settings
- [ ] Train team

---

## 🚢 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations executed
- [ ] RLS policies enabled
- [ ] Admin users created
- [ ] Payment gateway configured
- [ ] Email settings configured
- [ ] Notification templates ready
- [ ] App settings configured
- [ ] Build passes without errors
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 📞 Support Resources

| Topic | Resource |
|-------|----------|
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| Supabase | https://supabase.com/docs |
| Recharts | https://recharts.org |
| Lucide Icons | https://lucide.dev |

---

## 🎉 You're Ready!

Everything is configured and ready to use. Start with the Dashboard and explore each module.

**Next Step:** Navigate to `http://localhost:5173/admin/dashboard`

Questions? Check the [Complete Developer Guide](./ADMIN_DASHBOARD_GUIDE.md)

---

**Status:** ✅ Complete  
**Version:** 1.0.0  
**Last Updated:** April 16, 2026
