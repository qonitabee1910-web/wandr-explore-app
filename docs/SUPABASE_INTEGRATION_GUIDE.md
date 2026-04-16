# PYU-GO Supabase Integration - Complete Guide

## 🎯 Overview

This guide walks through full Supabase integration for PYU-GO application:
- Authentication (signup/login/logout)
- Database operations (CRUD)
- Real-time subscriptions
- File uploads
- Row Level Security

## 📋 Architecture

### File Structure
```
src/
├── lib/
│   └── supabase.ts              # Supabase client initialization
├── services/
│   ├── authService.ts           # Authentication (signup/login/etc)
│   └── databaseService.ts       # Database queries (hotels/rides/bookings)
└── pages/
    ├── Index.tsx                # Update to use real data
    ├── Ride.tsx                 # Update to use real rides
    └── Shuttle.tsx              # Update to use real shuttles

admin/
├── services/
│   ├── dashboardService.ts      # Already Supabase-integrated
│   ├── rideService.ts           # Already Supabase-integrated
│   └── ...
```

### Data Flow
```
UI Component
    ↓
Hook (useEffect/useState)
    ↓
Service Layer
    ↓
Supabase Client
    ↓
Database / Auth / Storage / Realtime
```

## 🔐 Authentication Setup

### 1. Signup Flow

```typescript
import { authService } from '@/services/authService';

// In signup component
const handleSignup = async (formData) => {
  const result = await authService.signup({
    email: formData.email,
    password: formData.password,
    fullName: formData.fullName,
    phone: formData.phone,
  });

  if (result.success) {
    // Show success message, redirect to login
    console.log('Check your email to verify!');
  } else {
    // Show error
    console.error(result.error);
  }
};
```

### 2. Login Flow

```typescript
import { authService } from '@/services/authService';

const handleLogin = async (email, password) => {
  const result = await authService.login({ email, password });

  if (result.success) {
    // Store user info if needed
    sessionStorage.setItem('user', JSON.stringify(result.profile));
    // Redirect to dashboard
  }
};
```

### 3. Get Current User

```typescript
import { authService } from '@/services/authService';
import { useEffect, useState } from 'react';

function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  return <div>{user?.fullName}</div>;
}
```

### 4. Logout

```typescript
const handleLogout = async () => {
  const result = await authService.logout();
  if (result.success) {
    // Redirect to login
  }
};
```

## 🏨 Hotels Integration

### Get Hotels
```typescript
import { hotelService } from '@/services/databaseService';
import { useEffect, useState } from 'react';

function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await hotelService.getHotels('Jakarta');
        setHotels(data);
      } catch (error) {
        console.error('Error loading hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  return (
    <div>
      {loading ? <p>Loading...</p> : hotels.map(h => <div key={h.id}>{h.name}</div>)}
    </div>
  );
}
```

### Get Hotel Details
```typescript
const hotel = await hotelService.getHotel(hotelId);
// Returns: { name, facilities, rooms, ... }
```

## 🚗 Rides Integration

### Get Available Ride Types
```typescript
import { rideService } from '@/services/databaseService';

const rideTypes = await rideService.getRideTypes();
// Returns: [{ id, name, capacity, price_per_km, ... }]
```

### Request a Ride
```typescript
const rideId = await rideService.requestRide({
  user_id: currentUser.id,
  ride_type_id: selectedRideTypeId,
  pickup_location: 'Jakarta',
  pickup_latitude: -6.1753,
  pickup_longitude: 106.8249,
  destination_location: 'Bandung',
  destination_latitude: -6.9271,
  destination_longitude: 107.6411,
  estimated_distance_km: 180,
  estimated_duration_minutes: 180,
  base_fare: 100000,
});
```

### Monitor Ride Status (Real-time)
```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function RideTracking({ rideId }) {
  useEffect(() => {
    // Subscribe to ride updates
    const channel = supabase
      .channel(`ride_${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          console.log('Ride updated:', payload.new);
          // Update UI with new ride status
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [rideId]);
}
```

## 🚌 Shuttle Integration

### Get Routes
```typescript
import { shuttleService } from '@/services/databaseService';

const routes = await shuttleService.getRoutes('Jakarta', 'Bandung');
```

### Get Schedules
```typescript
const schedules = await shuttleService.getSchedules(routeId);
// Returns array of schedules with available seats
```

### Book Shuttle
```typescript
const booking = await shuttleService.bookShuttle({
  user_id: currentUser.id,
  schedule_id: selectedScheduleId,
  departure_date: '2026-04-20',
  passenger_name: 'John Doe',
  passenger_email: 'john@example.com',
  passenger_phone: '081234567890',
  seat_number: 5,
  base_price: 120000,
  total_price: 100000,
  boarding_code: generateBoardingCode(),
});
```

### Cancel Booking
```typescript
await shuttleService.cancelBooking(bookingId);
// Automatically releases the seat
```

## 💳 Promo Code Validation

```typescript
import { promoService } from '@/services/databaseService';

// Validate promo code
const promoData = await promoService.validatePromo('PROMO50', userId);
// Returns: { discount_type, discount_value, applicable_to, ... }

// Use promo
await promoService.usePromo(
  promoData.id,
  userId,
  bookingId,
  discountAmount
);
```

## 📊 User Bookings

```typescript
import { bookingService } from '@/services/databaseService';

// Get all user bookings
const bookings = await bookingService.getUserBookings(userId);

// Get specific booking
const booking = await bookingService.getBookingDetails(bookingId);

// Cancel booking
await bookingService.cancelBooking(bookingId, 'User request');
```

## 💰 Transactions

```typescript
import { transactionService } from '@/services/databaseService';

// Get user transactions
const transactions = await transactionService.getUserTransactions(userId);

// Create transaction
const transaction = await transactionService.createTransaction({
  user_id: userId,
  booking_id: bookingId,
  transaction_type: 'payment',
  amount: totalPrice,
  payment_method: 'card',
  status: 'completed',
});
```

## 📱 Real-time Subscriptions

### Dashboard Live Updates
```typescript
import { supabase } from '@/lib/supabase';

function Dashboard() {
  useEffect(() => {
    // Subscribe to all ride changes
    const channel = supabase
      .channel('rides')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          console.log('New event:', payload);
          // Update dashboard
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, []);
}
```

### Driver Notifications
```typescript
// Subscribe to new ride requests for driver
const channel = supabase
  .channel('driver_rides')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'rides',
      filter: `status=eq.pending`,
    },
    (payload) => {
      // Show notification to driver
      console.log('New ride request:', payload.new);
    }
  )
  .subscribe();
```

## 📤 File Uploads

### Upload Driver Document
```typescript
import { authService } from '@/services/authService';

const file = document.getElementById('document').files[0];

const result = await authService.uploadDriverDocument(
  file,
  'license'
);

if (result.success) {
  console.log('Document URL:', result.url);
}
```

### Upload Profile Picture
```typescript
import { supabase } from '@/lib/supabase';

const file = document.getElementById('profile-pic').files[0];

const { data, error } = await supabase.storage
  .from('user-profiles')
  .upload(`${userId}/profile.jpg`, file);

if (!error) {
  const { data: publicData } = supabase.storage
    .from('user-profiles')
    .getPublicUrl(data.path);
  
  console.log('Public URL:', publicData.publicUrl);
}
```

## 🔒 Row Level Security (RLS)

RLS is already configured in the schema. Key policies:

- **Users can only view their own profile**
- **Users can only view their own bookings**
- **Drivers can only view rides assigned to them**
- **Admins can view all data**

To test RLS:
1. Login as user A
2. Try to access user B's bookings
3. Should get: "new row violates row-level security policy"

## ❌ Error Handling

Always wrap database calls in try-catch:

```typescript
try {
  const hotels = await hotelService.getHotels();
} catch (error) {
  if (error.code === 'PGRST116') {
    console.log('No data found');
  } else if (error.message.includes('row-level security')) {
    console.log('Access denied by RLS policy');
  } else {
    console.error('Database error:', error);
  }
}
```

## 🚀 Performance Tips

1. **Use pagination**
```typescript
const { data } = await supabase
  .from('rides')
  .select('*')
  .range(0, 9); // First 10 results
```

2. **Use indexes**
- Already created for common queries (user_id, status, etc)

3. **Use real-time sparingly**
- Subscribe only to critical data
- Unsubscribe when component unmounts

4. **Batch operations**
```typescript
// Instead of multiple inserts
const results = await supabase
  .from('bookings')
  .insert([booking1, booking2, booking3]);
```

## 🔧 Debugging

### Enable Supabase Logs
```typescript
import { supabase } from '@/lib/supabase';

// In development
if (import.meta.env.DEV) {
  supabase.on('*', (event) => {
    console.log('Supabase event:', event);
  });
}
```

### Test Connection
```typescript
const { data, error } = await supabase
  .from('users')
  .select('count()')
  .single();

console.log(data, error);
```

## 📝 Next Steps

1. ✅ Schema created
2. ✅ Services created
3. ⏭️ Update Index.tsx to use real hotels/promos
4. ⏭️ Create Authentication pages (Signup/Login)
5. ⏭️ Update Ride/Shuttle pages with real data
6. ⏭️ Implement real-time features
7. ⏭️ Add error handling and loading states
8. ⏭️ Test RLS policies
9. ⏭️ Deploy to production

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://discord.supabase.io
- PYU-GO Issues: Create an issue in the repo
