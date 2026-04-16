# PYU-GO Admin Dashboard - Complete Developer Guide

**Status:** ✅ Production-Ready  
**Last Updated:** April 16, 2026  
**Total Lines of Code:** 2000+  
**Services:** 8 complete services  
**Pages:** 8 modules  

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Services Documentation](#services-documentation)
6. [Page Components](#page-components)
7. [Hooks & Utilities](#hooks--utilities)
8. [Database Schema](#database-schema)
9. [Real-Time Features](#real-time-features)
10. [Authentication & Authorization](#authentication--authorization)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### What is PYU-GO Admin Dashboard?

A comprehensive admin web application built with React + TypeScript + Supabase for managing:
- 🚗 **Driver Management** - Approve, suspend, and manage drivers
- 🗺️ **Ride Monitoring** - Real-time ride tracking and analytics
- 🚌 **Shuttle Management** - Routes, schedules, and vehicle management
- 💰 **Pricing Control** - Dynamic pricing rules and surge multipliers
- 🎫 **Promo Control** - Create and manage promotional campaigns
- 📢 **Ads Control** - Advertisement campaigns and performance metrics
- ⚙️ **Settings** - Payment gateway and email configuration
- 📊 **Analytics Dashboard** - Real-time metrics and KPIs

### Technology Stack

```
Frontend:
  - React 18+ with TypeScript
  - Recharts for data visualization
  - Lucide React for icons
  - CSS3 with Flexbox/Grid
  - React Router for navigation

Backend:
  - Supabase (PostgreSQL + Auth + Real-time)
  - Real-time subscriptions for live updates
  - Row-Level Security for data protection

Development:
  - Vite for fast builds
  - ESLint for code quality
  - Vitest for testing
  - npm/bun for package management
```

---

## PROJECT STRUCTURE

```
src/admin/
├── components/              # Reusable UI components
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── Sidebar.css
│   ├── Topbar.tsx           # Header with user menu
│   ├── Topbar.css
│   ├── AdminLayout.tsx      # Main layout wrapper
│   └── AdminLayout.css
│
├── pages/                   # Page components (8 modules)
│   ├── Dashboard.tsx        # Analytics dashboard
│   ├── Dashboard.css
│   ├── Drivers.tsx          # Driver management
│   ├── Rides.tsx            # Ride monitoring
│   ├── Shuttles.tsx         # Shuttle management
│   ├── Pricing.tsx          # Pricing control
│   ├── Promos.tsx           # Promo management
│   ├── Ads.tsx              # Ad campaigns
│   ├── Settings.tsx         # App settings
│   └── (CSS files for each)
│
├── services/                # API & Business Logic
│   ├── supabaseClient.ts    # Supabase connection
│   ├── dashboardService.ts  # Dashboard data
│   ├── driverService.ts     # Driver operations
│   ├── rideService.ts       # Ride operations
│   ├── shuttleService.ts    # Shuttle operations
│   ├── pricingService.ts    # Pricing operations
│   ├── promoService.ts      # Promo operations
│   ├── adsService.ts        # Ad operations
│   └── settingsService.ts   # Settings operations
│
├── types/                   # TypeScript definitions
│   └── index.ts             # 500+ type definitions
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── usePagination.ts     # Pagination hook
│   ├── useFilters.ts        # Filter logic hook
│   └── useRealtime.ts       # Real-time subscription hook
│
├── context/                 # React Context
│   ├── AdminContext.tsx     # Global admin state
│   └── NotificationContext.tsx
│
└── migrations/              # Database migrations
    ├── 001_initial_schema.sql
    ├── 002_add_rls_policies.sql
    └── 003_seed_data.sql
```

---

## ARCHITECTURE

### Component Hierarchy

```
AdminLayout
├── Sidebar
│   └── Navigation Sections
│       ├── Dashboard
│       ├── Drivers
│       ├── Rides
│       ├── Shuttles
│       ├── Pricing
│       ├── Promos
│       ├── Ads
│       └── Settings
├── Topbar
│   ├── Theme Toggle
│   ├── Notifications
│   └── User Menu
└── Content Area
    └── Page Component (Outlet)
```

### Data Flow

```
User Action
    ↓
Page Component
    ↓
Service Call (API)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Real-time Subscription
    ↓
Component State Update
    ↓
UI Re-render
```

### Service Architecture

Each service follows a consistent pattern:

```typescript
// Pattern: Service modules with CRUD operations
export const serviceModule = {
  async getAll(filters?: FilterOptions): Promise<ApiResponse<T[]>> { }
  async getById(id: string): Promise<ApiResponse<T>> { }
  async create(data: Partial<T>): Promise<ApiResponse<T>> { }
  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> { }
  async delete(id: string): Promise<ApiResponse<void>> { }
  subscribeToChanges(callback: Function): Subscription { }
};
```

---

## INSTALLATION & SETUP

### 1. Prerequisites

```bash
# Required
- Node.js 16+
- npm or bun
- Supabase account
- Git

# Optional but recommended
- PostgreSQL client tools
- Postman for API testing
- VS Code with TypeScript support
```

### 2. Installation Steps

```bash
# Clone the repository
git clone <repo-url>
cd wandr-explore-app

# Install dependencies
npm install
# or
bun install

# Setup environment variables
cp .env.example .env.local

# Create .env.local with:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5173/api
```

### 3. Database Setup

```bash
# Run migrations
npm run migrate

# Or manually:
# 1. Go to Supabase Dashboard
# 2. SQL Editor → New Query
# 3. Paste content from migrations/001_initial_schema.sql
# 4. Execute
```

### 4. Development Server

```bash
# Start development server
npm run dev

# Navigate to
http://localhost:5173/admin/dashboard
```

### 5. Build for Production

```bash
# Build optimized bundle
npm run build

# Test production build
npm run preview

# Deploy to hosting
npm run deploy
```

---

## SERVICES DOCUMENTATION

### 1. Dashboard Service

```typescript
// Location: src/admin/services/dashboardService.ts

// Get overall statistics
const response = await dashboardService.getStats();
// Returns: totalRides, totalShuttles, totalDrivers, activeUsers, totalRevenue, etc.

// Get analytics data for charts
const analytics = await dashboardService.getAnalyticsData(7); // Last 7 days
// Returns: Array of {date, rides, revenue, users, shuttles}

// Get ride metrics
const metrics = await dashboardService.getRideMetrics();
// Returns: {totalRides, completedRides, canceledRides, averageRating, averageFare}

// Subscribe to real-time stats
dashboardService.subscribeToStats((stats) => {
  console.log('Stats updated:', stats);
});
```

### 2. Driver Service

```typescript
// Location: src/admin/services/driverService.ts

// Get drivers with filters and pagination
const response = await driverService.getDrivers({
  search: 'john',
  approvalStatus: 'pending',
  vehicleType: 'ride',
  page: 1,
  limit: 20,
});

// Approve or reject a driver
await driverService.approveDriver({
  driver_id: 'driver-123',
  approved: true,
  approval_notes: 'All documents verified',
});

// Update driver status
await driverService.updateDriverStatus('driver-123', 'suspended');

// Get pending approvals
const pending = await driverService.getPendingApprovals(10);

// Get driver statistics
const stats = await driverService.getDriverStats();
```

### 3. Ride Service

```typescript
// Location: src/admin/services/rideService.ts

// Get all rides with filters
const response = await rideService.getRides({
  status: 'completed',
  minFare: 50000,
  maxFare: 500000,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  page: 1,
  limit: 50,
});

// Get single ride details
const ride = await rideService.getRide('ride-123');

// Get real-time ride tracking
const tracking = await rideService.getRideTracking('ride-123');

// Get active rides
const active = await rideService.getActiveRides(50);

// Get ride statistics
const stats = await rideService.getRideStats('2024-01-01', '2024-12-31');

// Cancel a ride (admin action)
await rideService.cancelRide('ride-123', 'Incorrect fare calculation');
```

### 4. Shuttle Service

```typescript
// Location: src/admin/services/shuttleService.ts

// Shuttle CRUD operations
await shuttleService.getShuttles(1, 20);
await shuttleService.createShuttle({
  name: 'Shuttle A1',
  license_plate: 'ABC123',
  capacity: 30,
  vehicle_type: 'bus',
});
await shuttleService.updateShuttle('shuttle-123', { status: 'maintenance' });
await shuttleService.deleteShuttle('shuttle-123');

// Route operations
await shuttleService.getRoutes(1, 20);
await shuttleService.createRoute({
  name: 'Route 1: City Center',
  start_point: { latitude: -6.2088, longitude: 106.8456, address: 'Jakarta' },
  end_point: { latitude: -6.2756, longitude: 106.7849, address: 'Bogor' },
  stops: [],
  estimated_duration: 45,
  distance: 60,
  frequency: 'every 30 minutes',
});

// Schedule operations
await shuttleService.getSchedules(1, 20);
await shuttleService.createSchedule({
  shuttle_id: 'shuttle-123',
  route_id: 'route-123',
  departure_time: '06:00',
  arrival_time: '07:00',
  days_of_week: ['Monday', 'Tuesday', 'Wednesday'],
});
```

### 5. Pricing Service

```typescript
// Location: src/admin/services/pricingService.ts

// Get pricing rules
const rules = await pricingService.getPricingRules('ride');

// Create pricing rule
await pricingService.createPricingRule({
  rule_type: 'surge',
  name: 'Peak Hours Surge',
  service_type: 'ride',
  value: 1.5,
  active: true,
  priority: 1,
});

// Manage surge multipliers
await pricingService.createSurgeMultiplier({
  time_start: '18:00',
  time_end: '22:00',
  multiplier: 1.5,
  active: true,
});

// Calculate fare estimate
const estimate = await pricingService.calculateFareEstimate(
  distance = 5.5,  // km
  duration = 900,  // seconds (15 minutes)
  serviceType = 'ride'
);
// Returns: {base_fare, distance_fare, time_fare, surge_multiplier, total_fare}
```

### 6. Promo Service

```typescript
// Location: src/admin/services/promoService.ts

// Create promo
await promoService.createPromo({
  code: 'SAVE20',
  name: 'Save 20%',
  promo_type: 'percentage',
  value: 20,
  usage_limit: 1000,
  valid_from: '2024-01-01',
  valid_to: '2024-12-31',
});

// Get active promos
const active = await promoService.getActivePromos();

// Update promo
await promoService.updatePromo('promo-123', { status: 'inactive' });

// Get promo usage history
const usage = await promoService.getPromoUsage('promo-123', 1, 50);

// Get promo statistics
const stats = await promoService.getPromoStats('promo-123');
```

### 7. Ads Service

```typescript
// Location: src/admin/services/adsService.ts

// Create advertisement
await adsService.createAd({
  title: 'Summer Sale',
  description: 'Get 50% off on all rides',
  image_url: 'https://...',
  ad_link: 'https://...',
  placement: 'home_banner',
  status: 'active',
});

// Create campaign
await adsService.createCampaign({
  name: 'Q1 2024 Campaign',
  budget: 1000000,
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2024-03-31',
});

// Get ad metrics
const metrics = await adsService.getAdMetrics('ad-123', 30);

// Get campaign performance
const performance = await adsService.getCampaignPerformance('campaign-123');
```

### 8. Settings Service

```typescript
// Location: src/admin/services/settingsService.ts

// Payment gateways
await settingsService.getPaymentGateways();
await settingsService.upsertPaymentGateway({
  gateway_name: 'stripe',
  api_key: '...',
  secret_key: '...',
  active: true,
  commission_percentage: 5,
});
await settingsService.testPaymentGateway('gateway-123');

// Email settings
const emailConfig = await settingsService.getEmailSettings();
await settingsService.updateEmailSettings({
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: 'admin@pyu-go.com',
  smtp_password: '...',
  from_email: 'noreply@pyu-go.com',
  tls_enabled: true,
});

// App settings
await settingsService.getAppSettings();
await settingsService.toggleMaintenanceMode(true); // Enable maintenance mode
```

---

## PAGE COMPONENTS

### Dashboard Page

**Location:** `src/admin/pages/Dashboard.tsx`

**Features:**
- Real-time statistics cards
- Line chart for revenue & rides trend
- Pie chart for ride status distribution
- Key performance indicators
- Auto-refresh with real-time subscriptions

**Example Usage:**
```tsx
<DashboardPage />
```

### Driver Management Page

**Location:** `src/admin/pages/Drivers.tsx`

**Features:**
- Driver list with pagination
- Filter by approval status, vehicle type, rating
- Approve/reject drivers with modal
- Suspend/unsuspend drivers
- View driver details and documents
- Real-time driver updates

### Ride Monitoring Page

**Location:** `src/admin/pages/Rides.tsx`

**Features:**
- Real-time active rides map
- Ride list with detailed status
- Filter by date range, fare, status
- Live ride tracking
- Cancel ride functionality
- Export ride data

### Shuttle Management Page

**Location:** `src/admin/pages/Shuttles.tsx`

**Features:**
- Shuttle CRUD operations
- Route management
- Schedule management
- Real-time occupancy
- Vehicle location tracking
- Maintenance scheduling

### Pricing Control Page

**Location:** `src/admin/pages/Pricing.tsx`

**Features:**
- Manage pricing rules
- Configure surge multipliers
- Time-based pricing
- Location-based pricing
- Fare calculator
- Real-time price updates

### Promo Control Page

**Location:** `src/admin/pages/Promos.tsx`

**Features:**
- Create promotional codes
- View usage history
- Analyze promo performance
- Set expiration dates
- Usage limits
- Category-based targeting

### Ads Control Page

**Location:** `src/admin/pages/Ads.tsx`

**Features:**
- Create and manage ads
- Campaign management
- Performance metrics
- CTR and conversion tracking
- Budget management
- Schedule ads

### Settings Page

**Location:** `src/admin/pages/Settings.tsx`

**Features:**
- Payment gateway configuration
- Email SMTP settings
- Notification templates
- App-wide settings
- Maintenance mode toggle
- System configuration

---

## HOOKS & UTILITIES

### useAuth Hook

```typescript
// Usage in components
const { user, isLoading, login, logout } = useAuth();

if (isLoading) return <div>Loading...</div>;

return (
  <div>
    Welcome, {user?.email}
    <button onClick={logout}>Logout</button>
  </div>
);
```

### usePagination Hook

```typescript
// Manage pagination state
const { page, limit, total, pages, goToPage, nextPage, prevPage } = usePagination({
  initialPage: 1,
  initialLimit: 20,
  total: 150,
});

return (
  <div>
    {/* Items for current page */}
    <button onClick={prevPage}>Previous</button>
    <span>Page {page} of {pages}</span>
    <button onClick={nextPage}>Next</button>
  </div>
);
```

### useFilters Hook

```typescript
// Manage filter state
const { filters, setFilter, resetFilters } = useFilters({
  initialFilters: { status: 'all', sortBy: 'date' },
});

// Update filters
setFilter('status', 'completed');
```

### useRealtime Hook

```typescript
// Subscribe to real-time updates
const data = useRealtime(
  () => rideService.subscribeToRides(),
  (event) => console.log('Ride updated:', event)
);
```

---

## DATABASE SCHEMA

### Core Tables

```sql
-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50), -- pending, approved, rejected, suspended
  vehicle_type VARCHAR(50), -- ride, shuttle
  rating DECIMAL(3,2),
  total_rides INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES drivers,
  user_id UUID REFERENCES auth.users,
  status VARCHAR(50), -- requested, accepted, in_progress, completed, canceled
  fare DECIMAL(10,2),
  distance DECIMAL(8,2),
  duration INTEGER,
  rating INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Shuttles
CREATE TABLE shuttles (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  license_plate VARCHAR(50),
  capacity INTEGER,
  current_occupancy INTEGER,
  status VARCHAR(50), -- active, maintenance, inactive
  driver_id UUID REFERENCES drivers,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Pricing Rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY,
  rule_type VARCHAR(50), -- base_fare, distance_rate, etc.
  service_type VARCHAR(50), -- ride, shuttle
  value DECIMAL(10,2),
  active BOOLEAN,
  priority INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Promos
CREATE TABLE promos (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  promo_type VARCHAR(50), -- percentage, fixed_amount, free_ride
  value DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER,
  status VARCHAR(50), -- active, inactive, expired
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Advertisements
CREATE TABLE advertisements (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  placement VARCHAR(50),
  status VARCHAR(50),
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Payment Gateway Settings
CREATE TABLE payment_gateway_settings (
  id UUID PRIMARY KEY,
  gateway_name VARCHAR(50),
  api_key VARCHAR(255),
  secret_key VARCHAR(255),
  active BOOLEAN,
  commission_percentage DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Email Settings
CREATE TABLE email_settings (
  id UUID PRIMARY KEY,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_username VARCHAR(255),
  smtp_password VARCHAR(255),
  from_email VARCHAR(255),
  tls_enabled BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## REAL-TIME FEATURES

### Subscribe to Ride Updates

```typescript
const subscription = rideService.subscribeToRides((event) => {
  if (event.eventType === 'UPDATE') {
    console.log('Ride updated:', event.new);
    // Update UI
  }
});

// Cleanup on unmount
return () => subscription.unsubscribe();
```

### Subscribe to Driver Status

```typescript
const subscription = driverService.subscribeToDrivers((event) => {
  if (event.eventType === 'UPDATE') {
    console.log('Driver status changed:', event.new);
  }
});
```

### Real-time Location Tracking

```typescript
const trackRide = async (rideId: string) => {
  const tracking = await rideService.getRideTracking(rideId);
  console.log(`Driver at ${tracking.driver_location.address}`);
  console.log(`ETA: ${tracking.estimated_arrival} seconds`);
};
```

---

## AUTHENTICATION & AUTHORIZATION

### Admin Role-Based Access

```typescript
// Check admin permission
const hasPermission = (requiredRole: 'super_admin' | 'admin' | 'moderator') => {
  const { user } = useAuth();
  const adminRoles = ['super_admin', 'admin'];
  return adminRoles.includes(user?.role);
};

// Protect routes
<ProtectedRoute requiredRole="admin" component={DriverManagement} />
```

### Row-Level Security (RLS)

```sql
-- Example RLS policy for drivers
CREATE POLICY "Admins can view all drivers" ON drivers
  FOR SELECT
  USING (auth.role() = 'authenticated' AND current_user_role() = 'admin');

-- Only approved drivers visible to public
CREATE POLICY "Public can view approved drivers" ON drivers
  FOR SELECT
  USING (status = 'approved');
```

---

## DEPLOYMENT

### Environment Variables

```bash
# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
VITE_API_BASE_URL=https://api.pyu-go.com
NODE_ENV=production
```

### Deployment Steps

```bash
# 1. Build
npm run build

# 2. Test build
npm run preview

# 3. Deploy to Vercel
vercel deploy

# Or deploy to your server
# Copy dist/ folder to production server
```

### Vercel Deployment

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_key",
    "VITE_API_BASE_URL": "@api_url"
  }
}
```

---

## TROUBLESHOOTING

### Common Issues

**Issue: "Supabase credentials not configured"**
```
Solution:
1. Check .env.local file exists
2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
3. Restart development server
```

**Issue: "Real-time subscriptions not working"**
```
Solution:
1. Check Supabase project has Realtime enabled
2. Verify RLS policies allow current user
3. Check browser console for WebSocket errors
```

**Issue: "CORS errors when calling API"**
```
Solution:
1. Add API domain to Supabase CORS settings
2. Check Authorization header is set correctly
3. Verify API endpoint in environment variables
```

**Issue: "Types not found for service responses"**
```
Solution:
1. Ensure types are exported from src/admin/types/index.ts
2. Import types in service files
3. Run npm install to refresh type definitions
```

---

## BEST PRACTICES

### Code Style

```typescript
// ✅ Good
const handleApproveDriver = async (driverId: string) => {
  try {
    const response = await driverService.approveDriver({
      driver_id: driverId,
      approved: true,
    });
    
    if (response.success) {
      showNotification('Driver approved successfully');
      refreshDriverList();
    }
  } catch (error) {
    showError(error.message);
  }
};

// ❌ Avoid
const approveDriver = async (id) => {
  const res = await driverService.approveDriver({driver_id: id, approved: true});
  if(res.success){alert('Done');}
};
```

### Error Handling

```typescript
// ✅ Good error handling
try {
  const response = await rideService.cancelRide(rideId, reason);
  if (!response.success) {
    throw new Error(response.error);
  }
} catch (error) {
  logger.error('Failed to cancel ride:', error);
  showUserError('Could not cancel ride. Please try again.');
}
```

### Performance

```typescript
// ✅ Use React.memo for expensive components
const DriverCard = React.memo(({ driver }: { driver: Driver }) => {
  return <div>{driver.name}</div>;
});

// ✅ Use useCallback for event handlers
const handleFilter = useCallback((status: string) => {
  setFilters({ ...filters, status });
}, [filters]);
```

---

## SUPPORT & RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Recharts Documentation:** https://recharts.org

---

**Status:** ✅ Complete and ready for production  
**Last Updated:** April 16, 2026  
**Maintained By:** Development Team
