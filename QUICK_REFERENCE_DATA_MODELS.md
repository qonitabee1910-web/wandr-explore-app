# QUICK REFERENCE: Data Models & Database Schema

## Data Models at a Glance

### User Models
```typescript
// From Database (users table)
User {
  id: UUID (PK, FK to auth.users)
  email: string (unique)
  full_name: string
  phone_number: string
  profile_photo_url?: string
  role: 'user' | 'driver' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  email_verified: boolean
  phone_verified: boolean
  id_verified: boolean
  
  // Driver specific
  driver_license_number?: string
  driver_license_expiry?: date
  vehicle_type?: string
  vehicle_plate_number?: string
  vehicle_year?: integer
  vehicle_color?: string
  rating?: decimal(3,2)
  total_rides?: integer
  
  created_at: timestamp
  updated_at: timestamp
  last_login_at: timestamp
}
```

### Shuttle Booking Models
```typescript
// Step-by-step booking state
Rayon {
  id: UUID
  name: string (e.g., "RAYON-A")
  destination: string (e.g., "KNO")
  pickupPoints: PickupPoint[]
  basePrice: number
}

PickupPoint {
  id: string
  name: string
  time: string (HH:mm)
  distance: number (meters)
}

ShuttleSchedule {
  id: string
  rayonId: string
  departureTime: string (HH:mm)
}

ShuttleService {
  tier: 'Regular' | 'Semi Executive' | 'Executive'
  amenities: string[]
  priceMultiplier: number (1.0x to 2.0x)
}

ShuttleVehicle {
  id: string
  type: 'Mini Car' | 'SUV' | 'Hiace'
  capacity: integer
  basePrice: number
  layout_id?: UUID (FK to seat_layouts)
}

PassengerCount {
  category: 'adult' | 'child' | 'senior'
  count: integer
}
```

### Ride Models
```typescript
Ride {
  id: UUID (PK)
  passenger_id: UUID (FK to users)
  driver_id?: UUID (FK to users)
  
  // Route
  pickup_latitude: decimal(10,8)
  pickup_longitude: decimal(11,8)
  pickup_address: string
  dropoff_latitude: decimal(10,8)
  dropoff_longitude: decimal(11,8)
  dropoff_address: string
  
  // Details
  ride_type: 'ride' | 'shuttle' | 'premium'
  status: 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled'
  distance_km: decimal(10,2)
  duration_minutes: integer
  
  // Pricing
  base_fare: decimal(10,2)
  distance_fare: decimal(10,2)
  time_fare: decimal(10,2)
  surge_multiplier: decimal(3,2)
  discount_amount: decimal(10,2)
  total_fare: decimal(10,2)
  payment_method: string
  
  // Ratings & Notes
  passenger_rating?: decimal(3,2)
  driver_rating?: decimal(3,2)
  passenger_notes?: string
  driver_notes?: string
  
  // Timestamps
  requested_at: timestamp
  accepted_at?: timestamp
  started_at?: timestamp
  completed_at?: timestamp
  cancelled_at?: timestamp
  created_at: timestamp
  updated_at: timestamp
}

RideLocation {
  id: UUID (PK)
  ride_id: UUID (FK to rides)
  latitude: decimal(10,8)
  longitude: decimal(11,8)
  accuracy?: decimal(10,2)
  recorded_at: timestamp (default: now)
}
```

### Booking Models
```typescript
Booking {
  id: string
  type: 'hotel' | 'shuttle' | 'ride'
  name: string
  date: string (ISO date)
  status: 'Confirmed' | 'Completed' | 'Pending'
  total: number
  guests: integer
}
```

### Promo Models
```typescript
PromoCode {
  id: UUID (PK)
  code: string (unique)
  type: 'percentage' | 'fixed'
  value: number (percentage or amount)
  minSpend?: number (minimum booking amount)
  maxDiscount?: number (cap on discount)
  validFrom: date
  validUntil: date
  isActive: boolean
}

// Display model
Promo {
  id: string
  title: string
  description: string
  discount: string (e.g., "20%", "IDR50k")
  category: string
  validUntil: date
  code: string
  image: string (URL)
  terms: string[]
}
```

### Pricing Models
```typescript
FareRule {
  id: UUID (PK)
  rayonId?: string
  baseFare: number
  perKmRate: number
  minCharge: number
  
  // Multipliers
  serviceMultipliers: {
    'Regular': 1.0,
    'Semi Executive': 1.5,
    'Executive': 2.0
  }
  vehicleMultipliers: {
    'Mini Car': 1.0,
    'SUV': 1.2,
    'Hiace': 1.5
  }
  passengerMultipliers: {
    'adult': 1.0,
    'child': 0.75,
    'senior': 0.85
  }
}

SurgeRule {
  id: UUID (PK)
  startTime: string (HH:mm)
  endTime: string (HH:mm)
  daysOfWeek: integer[] (0-6, 0=Sunday)
  multiplier: number (e.g., 1.3 for 30% surge)
  label: string (e.g., "Morning Rush")
}

FareCalculationResult {
  baseFare: number
  distanceFare: number
  serviceSurcharge: number
  vehicleSurcharge: number
  surgeSurcharge: number
  passengerBreakdown: {
    category: 'adult'|'child'|'senior'
    count: integer
    subtotal: number
  }[]
  subtotal: number
  promoDiscount: number
  totalFare: number
  surgeApplied?: string
  promoApplied?: string
  isRoundTrip: boolean
  roundTripDiscount?: number
}

TransactionLog {
  id: string
  timestamp: string (ISO)
  bookingId?: UUID
  requestedPath: {
    from: string
    to: string
    distance: number (km)
  }
  calculation: FareCalculationResult
  metadata: {
    userId?: UUID
    userAgent: string
    ipAddress: string
  }
}
```

### Admin Models
```typescript
AdminAuditLog {
  id: UUID (PK)
  admin_id: UUID (FK to users)
  action: string (e.g., "CREATE", "UPDATE", "DELETE")
  resource_type: string (e.g., "ride", "promo", "user")
  resource_id?: UUID
  old_data?: JSONB
  new_data?: JSONB
  reason?: string
  ip_address: inet
  user_agent: string
  created_at: timestamp
}

PaymentGatewaySetting {
  id: UUID (PK)
  gateway_name: string (e.g., "stripe", "midtrans")
  api_key: string (encrypted)
  secret_key: string (encrypted)
  webhook_url?: string
  is_active: boolean
  commission_percentage: decimal(5,2)
  settlement_frequency: string (e.g., "daily", "weekly")
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}

EmailSetting {
  id: UUID (PK)
  smtp_host: string
  smtp_port: integer (default: 587)
  smtp_username: string
  smtp_password: string (encrypted)
  from_email: string
  from_name?: string
  reply_to?: string
  tls_enabled: boolean
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}

AppSetting {
  id: UUID (PK)
  app_name: string (default: "PYU-GO")
  app_version: string
  maintenance_mode: boolean
  max_ride_distance: decimal(8,2)
  min_ride_distance: decimal(8,2)
  max_surge_multiplier: decimal(3,2)
  currency: string (default: "IDR")
  timezone: string (default: "Asia/Jakarta")
  created_at: timestamp
  updated_at: timestamp
}

PricingRule {
  id: UUID (PK)
  rule_type: string (e.g., "base_fare", "surge", "discount")
  name: string
  description?: string
  service_type: string (e.g., "shuttle", "ride", "premium")
  value: decimal(10,2)
  condition_type?: string
  condition_value?: string
  is_active: boolean
  priority: integer (for rule precedence)
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}

SurgeMultiplier {
  id: UUID (PK)
  location_id?: UUID
  time_start: time (HH:mm)
  time_end: time (HH:mm)
  multiplier: decimal(3,2)
  is_active: boolean
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

### Location Models
```typescript
GeoLocation {
  lat: number
  lng: number
  address?: string
  name?: string
}

RouteInfo {
  distance: number (km)
  duration: number (minutes)
  polyline: [lat, lng][] (GeoJSON format)
  summary: string (e.g., "5 km")
}

GeocodingResult {
  display_name: string
  address: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  lat: string
  lon: string
}
```

### Hotel Models (Partial)
```typescript
Hotel {
  id: string
  name: string
  city: string
  rating: number (1-5)
  stars: integer (1-5)
  price: number
  originalPrice: number
  image: string (URL)
  facilities: string[]
  reviews: integer (count)
  description: string
  rooms: Room[]
}

Room {
  type: string
  price: number
  capacity: integer
}
```

---

## Database Tables Required

| Table | Purpose | Status |
|-------|---------|--------|
| `users` | User profiles + auth link | ✅ Created |
| `rides` | Ride bookings & history | ✅ Created |
| `ride_locations` | GPS tracking | ✅ Created |
| `shuttles` | Shuttle vehicle management | ✅ Created |
| `shuttle_routes` | Shuttle routes/rayon | ⚠️ Referenced only |
| `shuttle_schedules` | Daily schedules | ⚠️ Mock data |
| `shuttle_bookings` | Shuttle reservations | ⚠️ Mock data |
| `seat_layouts` | Shuttle seating layouts | ✅ Created |
| `bookings` | Generic bookings table | ✅ Created |
| `booking_details` | Booking line items | ✅ Created |
| `cancellations` | Cancellation history | ✅ Created |
| `promos` | Promotional codes | ✅ Created |
| `promo_usage` | Promo redemption tracking | ✅ Created |
| `pricing_rules` | Fare configuration | ✅ Created |
| `surge_multipliers` | Dynamic pricing | ✅ Created |
| `admin_audit_logs` | Audit trail | ✅ Created |
| `payment_gateway_settings` | Payment config | ✅ Created |
| `email_settings` | Email config | ✅ Created |
| `app_settings` | General settings | ✅ Created |
| `driver_documents` | Driver KYC | ⚠️ Planned |
| `transactions` | Payment records | ⚠️ Planned |
| `notifications` | User notifications | ⚠️ Planned |

---

## Key Calculations

### Fare Calculation Formula

```
baseFare 
  + (distance × perKmRate × vehicleMultiplier × serviceMultiplier)
  + (surgeMultiplier × (baseFare + distance fare))
  + (passengerMultiplier per category × passenger count)
  - promoDiscount
  + (isRoundTrip × 10% discount)
= totalFare
```

### Example
```
Scenario: Shuttle from Bandung to KNO Airport
  - Rayon: RAYON-A (base: 50,000 IDR)
  - Distance: 25 km
  - Service: Semi Executive (multiplier: 1.5x)
  - Vehicle: Hiace (multiplier: 1.5x)
  - Passengers: 2 adults, 1 child
  - Surge: 1.3x (peak hours)
  - Promo: 20% off

Calculation:
  1. Base: 50,000
  2. Distance: 25 km × 2,500 = 62,500
  3. Service: 62,500 × 1.5 = 93,750
  4. Vehicle: 93,750 × 1.5 = 140,625
  5. Adults (2): 140,625 × 1.0 × 2 = 281,250
  6. Child (1): 140,625 × 0.75 × 1 = 105,469
  7. Subtotal: 486,719
  8. Surge: 486,719 × 1.3 = 632,735
  9. Promo (20%): 632,735 × 0.2 = 126,547
  10. Total: 632,735 - 126,547 = 506,188 IDR
```

---

## Storage Schema

### seat-layouts Bucket
```
seat-layouts/
├── shuttle-{shuttle_id}/
│   ├── layout.png
│   ├── layout.jpg
│   └── layout-backup.png
├── rayons-{rayon_id}/
│   └── map.png
└── admin-uploads/
    └── temp-design.png
```

**Public URL Pattern:**
```
https://{project}.supabase.co/storage/v1/object/public/seat-layouts/{path}
```

---

## State Transitions

### Ride Status Flow
```
requested
  ↓ (driver accepts)
accepted
  ↓ (driver starts trip)
started
  ↓ (driver completes)
completed
  ├─ (passenger rates)
  └─ (ride archived)

OR

requested
  ├─ (passenger cancels)
  ├─ (driver cancels)
  └─ (timeout, auto-cancel)
    ↓
cancelled
```

### Shuttle Booking Status Flow
```
draft (step 1-6)
  ↓ (all steps complete)
validating (checking availability)
  ├─ (seats available) → confirmed
  ├─ (payment verified) → paid
  └─ (on departure day)
    ↓
completed
```

### Booking State Machine
```
User selects rayon
  → Step 1 (Rayon selection)
  → Step 2 (Schedule selection)
  → Step 3 (Pickup point selection)
  → Step 4 (Service tier selection)
  → Step 5 (Seat selection)
  → Step 6 (Passenger details)
  → Step 7 (Payment method selection)
  → Review & Confirm
  → Success (ticketId generated)
```

---

## Multiplier Examples

### Service Tier Multipliers
```
Regular:          1.0x (base price)
Semi Executive:   1.5x (50% markup)
Executive:        2.0x (100% markup)
```

### Vehicle Type Multipliers
```
Mini Car (4 seats):    1.0x (base)
SUV (7 seats):         1.2x (20% markup)
Hiace (20 seats):      1.5x (50% markup)
```

### Passenger Category Multipliers
```
Adult:   1.0x (full price)
Child:   0.75x (25% discount)
Senior:  0.85x (15% discount)
```

### Peak Hours Surge
```
07:00-09:00 (Mon-Fri):  1.3x (morning rush)
17:00-19:00 (Mon-Fri):  1.4x (evening rush)
00:00-23:59 (Sat-Sun):  1.2x (weekend demand)
```

---

## Environment Setup

### Required Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-key]

# Backend only (never expose)
SUPABASE_SERVICE_ROLE_KEY=[service-key]

# External APIs (optional)
OSRM_API_BASE=https://router.project-osrm.org
NOMINATIM_API_BASE=https://nominatim.openstreetmap.org

# Payment Gateways (optional)
STRIPE_PUBLISHABLE_KEY=[key]
MIDTRANS_SERVER_KEY=[key]
```

### Required Environment: Supabase Redirect URLs
```
http://localhost:8080/auth/callback
http://localhost:3000/auth/callback
http://127.0.0.1:8080/auth/callback
https://yourdomain.com/auth/callback
```

---

**Quick Reference Version:** 1.0  
**Last Updated:** April 18, 2026  
**Scope:** All data models + database schema + calculations
