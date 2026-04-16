# PYU-GO: ARCHITECTURE REFERENCE & QUICK GUIDE

## Quick Statistics

| Metric | Value |
|--------|-------|
| Total Components | 50+ |
| Pages | 10 |
| Custom Feature Components | 20+ |
| Shadcn UI Components | 40+ |
| Services | 3 |
| Context Providers | 1 |
| Custom Hooks | 2 |
| Type Definitions | 4 files |
| Mock Data Files | 5 |
| Test Files | 3 |
| Routes | 10 |
| Total Lines of Code | ~5,000+ |

---

## File Size & Complexity Reference

### Pages (by complexity)
| Page | Components | Features | Complexity |
|------|-----------|----------|-----------|
| ShuttleBooking | 7 | 7-step wizard, real-time calc | ⭐⭐⭐⭐⭐ |
| Ride | 5 | Geo search, routing, tracking | ⭐⭐⭐⭐ |
| Account | 3 | Auth, booking history | ⭐⭐⭐ |
| Index | 2 | Carousel, featured content | ⭐⭐⭐ |
| Shuttle | 1 | Listing & filtering | ⭐⭐ |
| Booking | 1 | Confirmation display | ⭐⭐ |
| Promos | 1 | Promo grid display | ⭐⭐ |
| Hotels | 0 | Shows 404 | ⚠️ |

### Core Services
| Service | Size | Responsibility | API Calls |
|---------|------|-----------------|-----------|
| FareService | ~150 lines | Fare estimation + logging | 0 (mock) |
| MapService | ~100 lines | Routing & geocoding | 2 (OSRM, Nominatim) |
| AdvancedRouteService | ~150 lines | Traffic simulation | 0 (calculation only) |

### Type Definitions
| File | Types | Interfaces |
|------|-------|-----------|
| types/index.ts | 6 interfaces | Hotel, Shuttle, Ride, Promo, Booking, Room |
| types/shuttle.ts | 9 interfaces | Rayon, Schedule, Service, Vehicle, SeatInfo, SeatLayout, State |
| types/pricing.ts | 6 interfaces | FareRule, SurgeRule, PromoCode, FareCalculationResult, TransactionLog, PassengerCount |
| types/maps.ts | 3 interfaces | GeoLocation, RouteInfo, GeocodingResult |

---

## Key Patterns Used

### 1. Context API + Custom Hook Pattern
```typescript
// Define context
const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

// Provider component
export const ShuttleProvider: React.FC<{ children }> = ({ children }) => {
  const [state, setState] = useState(...);
  return <ShuttleContext.Provider value={{ state, ...methods }}>{children}</ShuttleContext.Provider>;
};

// Custom hook for easy access
export const useShuttle = () => {
  const context = useContext(ShuttleContext);
  if (!context) throw new Error('useShuttle must be used within ShuttleProvider');
  return context;
};

// Usage in component
const MyComponent = () => {
  const { state, setRayon, nextStep } = useShuttle();
};
```

### 2. Service Layer with Mock Implementation
```typescript
// Async service that simulates API
export const FareService = {
  async getEstimate(params: {...}): Promise<FareCalculationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Business logic
    const rule = MOCK_FARE_RULES.find(...) || MOCK_FARE_RULES[0];
    const result = FareCalculator.calculateFare({...});
    
    // Logging
    this.logTransaction(params, result);
    
    return result;
  },

  logTransaction(request: any, result: FareCalculationResult) {
    // Persist to localStorage
    const logs = JSON.parse(localStorage.getItem('fare_logs') || '[]');
    logs.push({ id, timestamp, calculation: result });
    localStorage.setItem('fare_logs', JSON.stringify(logs.slice(-50)));
  }
};
```

### 3. Real-time Calculation with useEffect
```typescript
// ShuttleContext
useEffect(() => {
  const updateFare = async () => {
    if (state.selectedRayon && state.selectedService && state.selectedVehicle) {
      try {
        const estimate = await FareService.getEstimate({
          rayonId: state.selectedRayon.id,
          distance: state.selectedPickupPoint?.distance / 1000 || 50,
          serviceTier: state.selectedService.tier,
          vehicleType: state.selectedVehicle.type,
          passengers: state.passengerCounts,
          promoCode: state.promoCode || undefined,
          isRoundTrip: state.isRoundTrip
        });
        
        setState(prev => ({ 
          ...prev, 
          totalPrice: estimate.totalFare,
          fareBreakdown: estimate 
        }));
      } catch (error) {
        console.error("Fare calculation failed:", error);
      }
    }
  };

  updateFare();
}, [state.selectedRayon, state.selectedService, state.selectedVehicle, 
    state.selectedPickupPoint, state.passengerCounts, state.promoCode, state.isRoundTrip]);
```

### 4. Multi-step Wizard Pattern
```typescript
// In ShuttleBooking page
const renderStep = () => {
  switch (state.step) {
    case 1: return <RayonSelection />;
    case 2: return <ScheduleSelection />;
    case 3: return <PickupPointSelection />;
    case 4: return <ServiceSelection />;
    case 5: return <VehicleSelection />;
    case 6: return <SeatSelection />;
    case 7: return <BookingConfirmation />;
    case 9: return <BookingSuccess />;
    default: return <RayonSelection />;
  }
};

// Progress indicator
<div className="flex gap-2">
  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
    <div 
      key={s} 
      className={`w-3 h-3 rounded-full ${state.step >= s ? 'bg-primary w-8' : 'bg-muted'}`} 
    />
  ))}
</div>

// Animation with Framer Motion
<AnimatePresence mode="wait">
  <motion.div
    key={state.step}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

### 5. Component Composition with Shadcn
```typescript
// Use pre-built components as building blocks
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Compose into feature components
export const BookingConfirmation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom content */}
      </CardContent>
    </Card>
  );
};
```

### 6. Static Data with Type Safety
```typescript
// Data files define mock data with strong typing
export const SHUTTLE_FARE_RULES: FareRule[] = [
  {
    id: "shuttle-rayon-a",
    rayonId: "rayon-a",
    baseFare: 50000,
    perKmRate: 2500,
    minCharge: 120000,
    serviceMultipliers: {
      'Regular': 1.0,
      'Semi Executive': 1.5,
      'Executive': 2.0
    },
    vehicleMultipliers: {
      'Mini Car': 1.0,
      'SUV': 1.2,
      'Hiace': 1.5
    },
    passengerMultipliers: {
      'adult': 1.0,
      'child': 0.75,
      'senior': 0.85
    }
  }
];

// Type-checked usage
const rule = MOCK_FARE_RULES.find(r => r.rayonId === rayonId);
// rule is typed as FareRule | undefined
```

### 7. Routing with React Router
```typescript
// App.tsx
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/shuttle" element={<Shuttle />} />
      <Route path="/shuttle/booking" element={<ShuttleBooking />} />
      <Route path="/ride" element={<Ride />} />
      <Route path="/account" element={<Account />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/promos" element={<Promos />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

// Query params usage
const [searchParams] = useSearchParams();
const rayonId = searchParams.get('rayon');
```

---

## Key Architectural Decisions

### 1. **Context over Redux**
- **Why:** Single context is sufficient for shuttle booking state
- **Trade-off:** Can't handle complex global state (would need Redux/Zustand for multi-module state)
- **Scalability:** For Supabase integration, consider moving to TanStack Query for server state

### 2. **Service Layer Abstraction**
- **Why:** Encapsulates API calls, enables easy mocking
- **Pattern:** All async operations go through services
- **Benefit:** Easy to swap mock implementation with real API

### 3. **Fare Calculation as Separate Library**
- **Why:** Pure functions, testable, reusable
- **Pattern:** FareCalculator class with static method
- **Benefit:** Can be used server-side (Node.js) or client-side

### 4. **Real-time Calculation Trigger**
- **Why:** Instant feedback on price changes
- **Pattern:** useEffect watches multiple state variables
- **Cost:** Multiple API calls (optimizable with debounce)

### 5. **Mock Data in Config Files**
- **Why:** Easy to change without code compilation
- **Pattern:** Separate data files with strong typing
- **Limitation:** No admin UI to manage data, requires code changes

### 6. **localStorage for Logging**
- **Why:** Offline-capable, debug-friendly
- **Pattern:** Simple JSON array in localStorage
- **Limitation:** Client-side only, not secure

---

## Performance Considerations

### Current Bottlenecks
1. **Real-time fare calculation**: Re-calculates on every change
   - Solution: Debounce with `useCallback`
   
2. **Multiple external API calls in RideSearch**
   - Solution: Memoize results, add request debouncing
   
3. **Image loading** (hero carousel, promo cards)
   - Solution: Lazy load, use Next.js Image component

### Optimizations Applied
- ✅ Vite SWC compiler (fast builds)
- ✅ Code splitting via React Router
- ✅ Component memoization with Framer Motion
- ✅ CSS-in-JS with Tailwind (no runtime overhead)
- ✅ Virtual list potential for large lists (not implemented)

### Recommended Optimizations
```typescript
// Debounce fare calculation
const debouncedCalculate = useCallback(
  debounce(async () => {
    const estimate = await FareService.getEstimate(...);
    setState(prev => ({ ...prev, totalPrice: estimate.totalFare }));
  }, 500),
  [state]
);

// Memoize expensive components
const SeatSelection = memo(() => {...});

// Lazy load pages
const Hotels = lazy(() => import('./pages/Hotels'));
```

---

## Security Considerations

### Current Vulnerabilities
1. **No authentication**: Mock login only
2. **No authorization**: No permission checks
3. **localStorage exposure**: Sensitive data in browser storage
4. **No input validation**: Forms don't validate user input
5. **Public API keys**: Nominatim/OSRM called directly from client

### Recommended Security Measures
```typescript
// 1. Implement authentication
const { data: session } = await supabase.auth.getSession();

// 2. Server-side validation
// All form input validated on backend

// 3. API key protection
// Move OSRM/Nominatim calls to backend

// 4. Input sanitization
import DOMPurify from 'dompurify';
const cleanInput = DOMPurify.sanitize(userInput);

// 5. HTTPS only (production)
// All API calls over HTTPS

// 6. CORS configuration
// Backend restricts to specific origins
```

---

## Testing Strategy

### Current Test Coverage
- ✅ FareCalculator: 4+ tests
- ✅ AdvancedRouteService: Skeleton tests
- ⚠️ Component tests: Minimal

### Recommended Test Coverage
```typescript
// Component tests
describe('RayonSelection', () => {
  it('should render all rayons', () => {
    render(<RayonSelection />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('should call setRayon on click', () => {
    const setRayon = vi.fn();
    // Mock context...
    render(<RayonSelection />);
    fireEvent.click(screen.getByText('RAYON-A'));
    expect(setRayon).toHaveBeenCalled();
  });
});

// Integration tests
describe('ShuttleBooking workflow', () => {
  it('should complete booking from rayon to success', async () => {
    // Test entire flow
  });
});

// Service tests
describe('FareService', () => {
  it('should calculate fare with all factors', async () => {
    const result = await FareService.getEstimate(...);
    expect(result.totalFare).toBe(expectedValue);
  });
});
```

---

## Database Schema (For Supabase)

### Tables Overview
```
users
├── id (UUID, auth.uid)
├── email
├── name
├── phone
└── timestamps

bookings
├── id (UUID)
├── user_id (FK → users)
├── type (hotel|shuttle|ride)
├── status (pending|confirmed|completed)
├── details (JSONB - booking-specific)
├── total_amount
├── promo_code
└── timestamps

shuttle_bookings (extends bookings)
├── id (UUID)
├── booking_id (FK → bookings)
├── rayon_id
├── schedule_id
├── pickup_point_id
├── service_tier
├── vehicle_type
├── selected_seats (JSONB array)
├── passengers (JSONB)
├── ticket_id
├── payment_method
└── created_at

ride_bookings (extends bookings)
├── id (UUID)
├── booking_id (FK → bookings)
├── pickup_lat/lng
├── destination_lat/lng
├── distance
├── duration
├── vehicle_type
├── status (searching|confirmed|en_route|completed)
└── created_at

hotel_bookings (extends bookings)
├── id (UUID)
├── booking_id (FK → bookings)
├── hotel_id
├── room_type
├── check_in
├── check_out
├── guests
└── created_at

promo_codes
├── id
├── code (UNIQUE)
├── type (percentage|fixed)
├── value
├── min_spend
├── max_discount
├── valid_from/until
├── is_active
└── timestamps

fare_rules
├── id
├── rayon_id (UNIQUE)
├── base_fare
├── per_km_rate
├── min_charge
├── service_multipliers (JSONB)
├── vehicle_multipliers (JSONB)
├── passenger_multipliers (JSONB)
└── timestamps

surge_rules
├── id
├── start_time
├── end_time
├── days_of_week (INT array)
├── multiplier
├── label
└── created_at

transaction_logs
├── id
├── booking_id (FK)
├── calculation (JSONB)
├── metadata (JSONB)
└── created_at
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` and check output
- [ ] Run `npm run test` and verify all tests pass
- [ ] Run `npm run lint` and fix warnings
- [ ] Check TypeScript: `tsc --noEmit`
- [ ] Test in production build: `npm run preview`
- [ ] Update environment variables (.env.production)
- [ ] Configure Supabase project
- [ ] Set up database with schema

### Deployment Steps
```bash
# 1. Build production bundle
npm run build

# 2. Deploy to hosting (Vercel, Netlify, Firebase, etc.)
# For Vercel:
vercel deploy --prod

# 3. Verify production build
# Open live URL and test key flows
```

### Post-Deployment
- [ ] Monitor error logs (Sentry, LogRocket)
- [ ] Check Core Web Vitals (Google PageSpeed)
- [ ] Test on mobile devices
- [ ] Verify Supabase connections
- [ ] Check payment gateway integration
- [ ] Monitor real-time metrics

---

## Common Development Tasks

### Adding a New Page
```typescript
// 1. Create page component
// src/pages/NewPage.tsx
import Layout from '@/components/Layout';

const NewPage = () => {
  return <Layout>{/* content */}</Layout>;
};

export default NewPage;

// 2. Add route
// src/App.tsx
<Route path="/newpage" element={<NewPage />} />

// 3. Add navigation link
// src/components/Navbar.tsx or BottomNav.tsx
{ path: "/newpage", label: "New", icon: IconName }
```

### Adding a New Type
```typescript
// src/types/index.ts or domain-specific file
export interface NewType {
  id: string;
  name: string;
  // ... other fields
}
```

### Adding a New Service
```typescript
// src/services/newService.ts
export const NewService = {
  async fetchData(params: any): Promise<Result> {
    // Implementation
  }
};

// Usage
import { NewService } from '@/services/newService';
const result = await NewService.fetchData(...);
```

### Adding a New Component
```typescript
// src/components/domain/NewComponent.tsx
import { Button, Card } from '@/components/ui';
import { Icon } from 'lucide-react';

interface NewComponentProps {
  prop1: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ prop1, onAction }) => {
  return (
    <Card>
      {/* component content */}
    </Card>
  );
};
```

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| "useShuttle must be used within ShuttleProvider" | Component used outside provider | Wrap parent in `<ShuttleProvider>` |
| Fare not updating | Effect dependencies wrong | Check useEffect dependency array in context |
| Map not loading | Leaflet CDN issue | Check browser console for CSP errors |
| TypeScript errors | Type mismatches | Run `tsc --noEmit` to find issues |
| Slow fare calculation | No debouncing | Add debounce to effect |
| localStorage full | Too much logging | Clear old logs in FareService |

---

## Resources & References

### Documentation
- [React 18 Docs](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)

### External APIs
- [OSRM Routing](https://project-osrm.org)
- [Nominatim Geocoding](https://nominatim.org)
- [Leaflet Maps](https://leafletjs.com)

### Similar Projects
- Traveloka (inspiration)
- Grab (ride-hailing)
- Gojek (transportation)

---

## Next Phase Roadmap

### Phase 1: Backend Integration (Week 1-2)
- [ ] Setup Supabase project
- [ ] Implement authentication
- [ ] Connect booking persistence

### Phase 2: Real-time Features (Week 3-4)
- [ ] Supabase realtime subscriptions
- [ ] Live booking updates
- [ ] Driver tracking with maps

### Phase 3: Payment Integration (Week 5-6)
- [ ] Stripe/Xendit integration
- [ ] Payment confirmation flow
- [ ] Invoice generation

### Phase 4: Admin Dashboard (Week 7-8)
- [ ] Fare rule management
- [ ] Booking analytics
- [ ] Driver management

### Phase 5: Mobile App (Week 9-12)
- [ ] React Native version
- [ ] Push notifications
- [ ] Offline capability

