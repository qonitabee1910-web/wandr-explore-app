# PYU-GO Admin Dashboard

A complete, production-ready admin web application for managing ride-sharing and shuttle services.

## ✨ Features

### 📊 Dashboard Analytics
- Real-time statistics and KPIs
- Revenue and rides trend analysis
- Ride status distribution
- Interactive charts and metrics

### 👥 Driver Management
- Complete driver lifecycle management
- Approve/reject driver applications
- Suspend or reactivate drivers
- Track driver ratings and history
- Real-time status updates

### 🚗 Ride Monitoring
- Real-time active rides tracking
- Ride status management
- Detailed ride analytics
- Cancel rides (admin action)
- Performance metrics

### 🚌 Shuttle Management
- Add and manage shuttles
- Create and edit routes
- Schedule shuttle trips
- Occupancy tracking
- Location-based management

### 💰 Pricing Control
- Dynamic pricing rules
- Surge multiplier management
- Time-based and location-based pricing
- Fare calculator
- Real-time price updates

### 🎫 Promo Management
- Create promotional codes
- Track usage and performance
- Set expiration dates
- Manage usage limits
- Analyze promo impact

### 📢 Ads Management
- Create and manage advertisements
- Campaign management
- Performance tracking
- CTR and conversion analysis
- Budget management

### ⚙️ Settings
- Payment gateway configuration
- Email SMTP setup
- Notification templates
- App-wide settings
- Maintenance mode toggle

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI Framework
- **TypeScript** - Type safety
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Router** - Navigation
- **CSS3** - Modern styling

### Backend
- **Supabase** - PostgreSQL + Auth + Real-time
- **PostgreSQL** - Database
- **Row-Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### Development
- **Vite** - Fast builds
- **ESLint** - Code quality
- **Vitest** - Testing framework
- **npm/bun** - Package manager

## 📦 Installation

### Prerequisites
```bash
- Node.js 16+
- npm or bun
- Supabase account
- Git
```

### Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd wandr-explore-app
```

2. **Install Dependencies**
```bash
npm install
# or
bun install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5173/api
```

4. **Run Database Migrations**
```bash
npm run migrate
```

Or manually in Supabase SQL Editor:
- Copy content from `src/admin/migrations/001_initial_schema.sql`
- Execute in SQL Editor
- Repeat for `002_add_rls_policies.sql`

5. **Start Development Server**
```bash
npm run dev
```

Access at: `http://localhost:5173/admin/dashboard`

## 📁 Project Structure

```
src/admin/
├── components/          # UI Components
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── Topbar.tsx       # Header
│   └── AdminLayout.tsx  # Main layout
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Drivers.tsx
│   ├── Rides.tsx
│   ├── Shuttles.tsx
│   ├── Pricing.tsx
│   ├── Promos.tsx
│   ├── Ads.tsx
│   └── Settings.tsx
├── services/           # API logic
│   ├── dashboardService.ts
│   ├── driverService.ts
│   ├── rideService.ts
│   ├── shuttleService.ts
│   ├── pricingService.ts
│   ├── promoService.ts
│   ├── adsService.ts
│   └── settingsService.ts
├── types/             # TypeScript types
│   └── index.ts       # 500+ type definitions
├── hooks/             # Custom hooks
├── context/           # React Context
└── migrations/        # Database migrations
```

## 🚀 Usage

### Access Admin Dashboard

```
URL: http://localhost:5173/admin/dashboard
Login: Use your Supabase admin credentials
```

### Key Modules

#### Dashboard
- View real-time statistics
- Monitor revenue trends
- Check key performance indicators
- Auto-refresh with real-time subscriptions

#### Driver Management
1. Navigate to Drivers
2. View pending approvals (red badge)
3. Click "Approve" or "Reject"
4. Manage driver status
5. Track performance metrics

#### Ride Monitoring
1. Go to Rides
2. View active rides map
3. Filter by status, date, fare
4. Cancel rides if needed
5. Export ride data

#### Shuttle Operations
1. Access Shuttles
2. Create/edit shuttles
3. Manage routes and schedules
4. Track occupancy
5. Monitor vehicle status

#### Pricing Management
1. Open Pricing Control
2. Create pricing rules
3. Set surge multipliers
4. Test fare calculator
5. Monitor price changes

#### Promo Campaigns
1. Create promo codes
2. Set validity periods
3. Track usage stats
4. Analyze impact
5. Deactivate if needed

#### Ad Campaigns
1. Create advertisements
2. Launch campaigns
3. Monitor performance
4. Track metrics (CTR, conversions)
5. Manage budget

#### Configuration
1. Go to Settings
2. Configure payment gateways
3. Set up email SMTP
4. Edit notification templates
5. Toggle maintenance mode

## 🔐 Security Features

### Authentication
- Supabase Auth integration
- Role-based access control
- Admin verification

### Authorization
- Row-Level Security (RLS) policies
- Resource-level permissions
- Admin role enforcement

### Data Protection
- Encrypted sensitive data
- Audit logging
- Secure API endpoints

## 📊 Services API

### Dashboard Service
```typescript
await dashboardService.getStats()
await dashboardService.getAnalyticsData(days)
await dashboardService.getRideMetrics()
```

### Driver Service
```typescript
await driverService.getDrivers(filters)
await driverService.approveDriver(request)
await driverService.getPendingApprovals()
```

### Ride Service
```typescript
await rideService.getRides(filters)
await rideService.getRideTracking(rideId)
await rideService.cancelRide(rideId, reason)
```

### Shuttle Service
```typescript
await shuttleService.getShuttles()
await shuttleService.createRoute(route)
await shuttleService.createSchedule(schedule)
```

### Pricing Service
```typescript
await pricingService.getPricingRules(type)
await pricingService.createSurgeMultiplier(multiplier)
await pricingService.calculateFareEstimate(distance, duration)
```

### Promo Service
```typescript
await promoService.createPromo(promo)
await promoService.getActivePromos()
await promoService.getPromoStats(promoId)
```

### Ads Service
```typescript
await adsService.createAd(ad)
await adsService.createCampaign(campaign)
await adsService.getCampaignPerformance(campaignId)
```

### Settings Service
```typescript
await settingsService.getPaymentGateways()
await settingsService.updateEmailSettings(settings)
await settingsService.toggleMaintenanceMode(enabled)
```

## 🔄 Real-Time Features

All services support real-time subscriptions:

```typescript
// Subscribe to ride updates
rideService.subscribeToRides((event) => {
  console.log('Ride updated:', event.new);
});

// Subscribe to driver changes
driverService.subscribeToDrivers((event) => {
  console.log('Driver status changed:', event.new);
});

// Subscribe to pricing changes
pricingService.subscribeToPricingRules((event) => {
  console.log('Pricing updated:', event.new);
});
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Other Platforms
1. Build: `npm run build`
2. Upload `dist/` folder
3. Set environment variables
4. Configure server routing (SPA)

## 📚 Documentation

- [Admin Dashboard Complete Guide](./ADMIN_DASHBOARD_GUIDE.md)
- [API Services Reference](./ADMIN_DASHBOARD_GUIDE.md#services-documentation)
- [Database Schema](./ADMIN_DASHBOARD_GUIDE.md#database-schema)
- [Troubleshooting](./ADMIN_DASHBOARD_GUIDE.md#troubleshooting)

## 🐛 Troubleshooting

### "Supabase credentials not configured"
- Check `.env.local` exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server

### "Real-time subscriptions not working"
- Enable Realtime in Supabase project
- Check RLS policies allow current user
- Verify WebSocket connection in browser

### "CORS errors"
- Add API domain to Supabase CORS
- Check Authorization header
- Verify API endpoint URL

### "Types not found"
- Import types from `src/admin/types`
- Run `npm install` to refresh types
- Check type exports in `index.ts`

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

## 📄 License

PYU-GO Admin Dashboard - All Rights Reserved

## 👥 Contributors

Development Team - April 2026

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** April 16, 2026
