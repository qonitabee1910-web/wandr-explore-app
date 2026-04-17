# Supabase Integration Guide - PYU-GO Platform

## ✅ Setup Status

- **Database**: PostgreSQL 17.6 (Supabase Remote)
- **Migrations**: 5 migrations applied successfully
- **Tables**: 21 tables created with RLS policies
- **Authentication**: Supabase Auth configured
- **Services**: Database services implemented

---

## 📊 Database Schema Overview

### Core Tables

#### Users Table
- `id` (UUID) - Primary key, references auth.users
- `email` (VARCHAR) - Unique, lowercase
- `full_name` (VARCHAR)
- `phone_number` (VARCHAR)
- `role` - user | driver | admin | super_admin | moderator | analyst
- `status` - active | inactive | suspended | banned
- **Indexes**: email, role, status, phone_number

#### Rides Table
- `id`, `passenger_id`, `driver_id` (UUIDs)
- `pickup/dropoff_latitude/longitude` (DECIMAL)
- `ride_type` - ride | shuttle | premium
- `status` - requested | accepted | started | completed | cancelled
- `distance_km`, `duration_minutes`, `total_fare` (DECIMAL)
- `payment_method`, `surge_multiplier`, `discount_amount`
- **Indexes**: passenger_id, driver_id, status, ride_type

#### Shuttle Tables
- `shuttle_stops` - Stop locations
- `shuttle_routes` - Route definitions
- `shuttle_schedules` - Schedule per route
- `shuttle_bookings` - User bookings

#### Admin Tables
- `admin_audit_logs` - Audit trail
- `payment_gateway_settings` - Payment configs
- `email_settings` - SMTP configs
- `app_settings` - App configuration
- `pricing_rules` - Dynamic pricing
- `surge_multipliers` - Surge pricing
- `promos` - Promotional codes
- `advertisements` - Ad placements
- `notification_templates` - Email templates

#### Rating & Document Tables
- `driver_ratings` - Driver ratings from passengers
- `passenger_ratings` - Passenger ratings from drivers
- `driver_documents` - License, permits, etc.
- `ride_payments` - Payment records
- `ride_locations` - GPS tracking

---

## 🚀 Getting Started

### 1. Environment Setup

Your `.env.local` file is already configured:

```
VITE_SUPABASE_URL=https://jlvwuekgaxdawiyyslvg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ObQtE8qcTlVyK9jZWzsj_A_Z3zgX8tp
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ObQtE8qcTlVyK9jZWzsj_A_Z3zgX8tp
VITE_ENV=development
```

### 2. Create First Super Admin User

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Step 1: Create auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@pyugo.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}'
) RETURNING id;

-- Step 2: Copy the returned ID and run this (replace YOUR_USER_ID):
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID',
  'admin@pyugo.com',
  'System Admin',
  'super_admin',
  'active',
  NOW(),
  NOW()
);
```

### 3. Test Admin Login

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:8080/login?type=admin`
3. Login with:
   - **Email**: admin@pyugo.com
   - **Password**: AdminPassword123!

---

## 💻 Using the Database Services

### User Service

```typescript
import { userService } from '@/services/databaseService';

// Get user profile
const result = await userService.getUserProfile(userId);
if (result.success) {
  console.log(result.data);
}

// Update profile
await userService.updateUserProfile(userId, {
  full_name: 'John Doe',
  phone_number: '+6281234567890',
});

// Setup driver profile
await userService.setupDriverProfile(userId, {
  licenseNumber: 'DL123456',
  licenseExpiry: '2030-12-31',
  vehicleType: 'car',
  platNumber: 'AB-1234-CD',
  vehicleYear: 2022,
  vehicleColor: 'black',
  bankAccount: '1234567890',
  bankName: 'BCA',
});

// Get user stats
const stats = await userService.getUserStats(userId);
```

### Ride Service

```typescript
import { rideService } from '@/services/databaseService';

// Create a ride request
const result = await rideService.createRide({
  passenger_id: passengerId,
  pickup_latitude: -6.2088,
  pickup_longitude: 106.8456,
  pickup_address: 'Kota Tua Jakarta',
  dropoff_latitude: -6.1944,
  dropoff_longitude: 106.8296,
  dropoff_address: 'Monas',
  ride_type: 'ride',
  status: 'requested',
});

// Get user rides
const rides = await rideService.getUserRides(userId, 'passenger');

// Track ride location (real-time)
await rideService.trackRideLocation(rideId, latitude, longitude);

// Rate a ride
await rideService.rateRide(rideId, passengerId, 5, 'driver', 'Great driver!');

// Update ride status
await rideService.updateRideStatus(rideId, 'completed');
```

### Shuttle Service

```typescript
import { shuttleService } from '@/services/databaseService';

// Get all active routes
const routes = await shuttleService.getShuttleRoutes();

// Get schedules for a route
const schedules = await shuttleService.getShuttleSchedules(routeId);

// Book a shuttle
const booking = await shuttleService.bookShuttle(
  scheduleId,
  userId,
  2 // number of seats
);

// Get user bookings
const bookings = await shuttleService.getUserShuttleBookings(userId);

// Cancel booking
await shuttleService.cancelShuttleBooking(bookingId);
```

### Promo Service

```typescript
import { promoService } from '@/services/databaseService';

// Get active promos
const promos = await promoService.getActivePromos();

// Validate promo code
const result = await promoService.validatePromoCode('WELCOME50');
if (result.success) {
  const promo = result.data;
  console.log('Discount:', promo.value, promo.promo_type);
}

// Use promo
await promoService.usePromo(promoId, userId, rideId, discountAmount);
```

### Pricing Service

```typescript
import { pricingService } from '@/services/databaseService';

// Get pricing rules
const rules = await pricingService.getPricingRules('ride');

// Get current surge multiplier
const surge = await pricingService.getSurgeMultiplier(-6.2088, 106.8456);
console.log('Surge multiplier:', surge.data); // e.g., 1.5
```

---

## 🔐 Row-Level Security (RLS)

All tables have RLS policies enabled:

### Users Table
- Users can read their own profile
- Users can insert profile during signup
- Users can update their own profile
- Admins can read/update all users

### Rides Table
- Passengers/drivers can view their own rides
- Admins can view all rides
- Users can only create rides as passengers

### Admin Tables
- Only admins/super_admins can access
- Different permission levels for different roles
- Service role has full access

### Shuttle Tables
- Users can view/create their own bookings
- Only shuttle_bookings accessible to users

---

## 🎯 Role-Based Access Control

### Roles
- **user** - Regular user/passenger
- **driver** - Ride driver
- **admin** - Can manage most resources
- **super_admin** - Full system access
- **moderator** - Moderation capabilities
- **analyst** - Analytics/reporting only

### Helper Functions
All in `/lib/supabase.ts`:

```typescript
// Check if user is super_admin
is_super_admin() → BOOLEAN

// Check if user is admin or super_admin
is_admin_or_super() → BOOLEAN

// Get current user's role
get_current_user_role() → TEXT
```

---

## 📱 Real-Time Features

### Ride Tracking
```typescript
// Subscribe to ride location updates
const channel = supabase
  .channel(`ride-${rideId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'ride_locations' },
    (payload) => {
      console.log('New location:', payload.new);
    }
  )
  .subscribe();
```

### Ride Status Updates
```typescript
// Subscribe to ride status changes
const channel = supabase
  .channel(`ride-status-${rideId}`)
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'rides' },
    (payload) => {
      console.log('Ride status:', payload.new.status);
    }
  )
  .subscribe();
```

---

## 🔄 Audit Logging

All admin actions are logged in `admin_audit_logs`:

```sql
-- View audit logs (as admin)
SELECT * FROM public.admin_audit_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- Logs include:
-- - admin_id: Who made the change
-- - action: CREATE, UPDATE, DELETE, etc.
-- - resource_type: pricing_rules, promos, etc.
-- - old_data/new_data: JSONB of changes
-- - created_at: Timestamp
```

---

## 🚨 Important Notes

1. **Email Case-Insensitive**: All emails are stored lowercase
2. **Unique Constraint**: One email per user (enforced at DB level)
3. **Soft Deletes**: Most data uses `status` field instead of deletion
4. **Timestamps**: All times in UTC with timezone info
5. **RLS Policies**: Enabled on all public tables
6. **Service Role**: Can bypass RLS for system operations

---

## 📝 Common Tasks

### Create a New User
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});
```

### Setup Payment Gateway
```sql
INSERT INTO public.payment_gateway_settings (
  gateway_name,
  api_key,
  secret_key,
  is_active
) VALUES (
  'midtrans',
  'your-api-key',
  'your-secret-key',
  true
);
```

### Create Pricing Rule
```sql
INSERT INTO public.pricing_rules (
  rule_type,
  name,
  service_type,
  value,
  is_active
) VALUES (
  'base_fare',
  'Base Fare Jakarta',
  'ride',
  15000,
  true
);
```

### Create Promotion
```sql
INSERT INTO public.promos (
  code,
  name,
  promo_type,
  value,
  valid_from,
  valid_to,
  status
) VALUES (
  'WELCOME50',
  'Welcome Discount',
  'percentage',
  50,
  NOW(),
  NOW() + INTERVAL '30 days',
  'active'
);
```

---

## 🐛 Troubleshooting

### "User cannot access table"
- Check RLS policy is correct
- Verify user role matches policy
- Ensure service_role key used for admin operations

### "Duplicate key value"
- Email might already exist
- Use UPSERT or check existence first

### "Function not found"
- RLS policy might be referencing dropped function
- Re-run migration or create function

### "Connection failed"
- Check VITE_SUPABASE_URL is correct
- Verify VITE_SUPABASE_ANON_KEY is valid
- Ensure network access to supabase.co

---

## 📚 Next Steps

1. ✅ Database setup complete
2. ⏳ Set up admin user (see instructions above)
3. ⏳ Test authentication flow
4. ⏳ Implement ride booking UI
5. ⏳ Add real-time tracking
6. ⏳ Setup payment integration
7. ⏳ Configure admin dashboard

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/17/
- **Auth Docs**: https://supabase.com/docs/guides/auth
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 You're Ready!

Your Supabase setup is complete. The application is ready for:
- User authentication
- Ride booking
- Shuttle reservations
- Admin management
- Real-time tracking
- Payment processing

Start by creating your first admin user and testing the login flow!
