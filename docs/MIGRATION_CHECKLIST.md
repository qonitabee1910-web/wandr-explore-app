# PYU-GO Supabase Migration Checklist

## 📊 Status: Phase 2 Complete ✅

Completed:
- ✅ Database schema designed (15 tables)
- ✅ Supabase client configured
- ✅ Authentication service created
- ✅ Database service wrapper created
- ✅ Environment variables set
- ✅ Documentation written

## 🎯 Phase 3: Core Integration (IN PROGRESS)

### A. Schema Setup
- [ ] Login to Supabase Dashboard
- [ ] Copy entire schema from `docs/supabase-schema.sql`
- [ ] Paste into SQL Editor
- [ ] Execute (should take ~30 seconds)
- [ ] Verify tables created in Database tab

### B. Authentication Setup
- [ ] Go to Authentication → Providers
- [ ] Enable "Email" provider
- [ ] Configure email templates (optional)
- [ ] Test signup in app

### C. Storage Buckets
- [ ] Create storage bucket: `driver-documents`
- [ ] Create storage bucket: `user-profiles`
- [ ] Create storage bucket: `hotel-images`
- [ ] Set RLS policies for each bucket

### D. Row Level Security
- [ ] Verify RLS policies were created (should be automatic)
- [ ] Test RLS in SQL console:
  ```sql
  SELECT * FROM public.users; -- Should see only your user
  ```

## 🎨 Phase 4: Frontend Integration

### Index Page (Landing)
- [ ] Remove dummy hotels data
- [ ] Replace with `hotelService.getHotels()`
- [ ] Remove dummy promos data
- [ ] Replace with `promoService.getActivePromos()`
- [ ] Add loading states
- [ ] Add error handling

### Shuttle Module
- [ ] Update `src/pages/Shuttle.tsx` to fetch real routes
- [ ] Update seat selection to use real seat data
- [ ] Implement real booking with `shuttleService.bookShuttle()`
- [ ] Add boarding code generation

### Ride Module
- [ ] Update `src/pages/Ride.tsx` to fetch real ride types
- [ ] Implement real ride request with `rideService.requestRide()`
- [ ] Add real-time status tracking
- [ ] Implement driver assignment logic (backend)

### Hotel Module
- [ ] Fetch real hotel details with `hotelService.getHotel()`
- [ ] Show real room types and prices
- [ ] Implement real booking

### Account/Booking History
- [ ] Replace dummy bookings with `bookingService.getUserBookings()`
- [ ] Show real booking history
- [ ] Implement cancellation feature

## 🔐 Phase 5: Authentication Pages

### Create Auth Pages
- [ ] `src/pages/Signup.tsx` - Signup form
- [ ] `src/pages/Login.tsx` - Login form
- [ ] `src/pages/ResetPassword.tsx` - Password reset
- [ ] `src/pages/AuthCallback.tsx` - Email verification callback

### Update Navigation
- [ ] Hide login/signup links when authenticated
- [ ] Show user profile menu when authenticated
- [ ] Add logout button

### Protect Routes
- [ ] Create `ProtectedRoute` component
- [ ] Require auth for booking pages
- [ ] Require auth for account page

## 💻 Phase 6: Driver Registration

### Driver Pages
- [ ] `src/pages/BecomeDriver.tsx` - Driver signup
- [ ] `src/pages/DriverDocuments.tsx` - Document upload
- [ ] `src/admin/pages/DriverApprovals.tsx` - Admin approval system

### Driver Service
- [ ] `authService.registerAsDriver()`
- [ ] `authService.uploadDriverDocument()`
- [ ] Implement document verification workflow

## 📱 Phase 7: Real-time Features

### Ride Real-time
- [ ] Subscribe to ride updates
- [ ] Show live driver location (if available)
- [ ] Show real-time status changes

### Shuttle Real-time
- [ ] Show seat availability updates
- [ ] Show seat filling animation

### Admin Dashboard Real-time
- [ ] Live ride updates
- [ ] Live driver status
- [ ] Live revenue tracking

## 🧪 Phase 8: Testing

### Unit Tests
- [ ] Test authService functions
- [ ] Test databaseService functions
- [ ] Test error handling

### Integration Tests
- [ ] Test signup/login flow
- [ ] Test booking flow
- [ ] Test cancellation flow

### E2E Tests (Optional)
- [ ] Test complete user journey
- [ ] Test admin dashboard
- [ ] Test real-time updates

## 🚀 Phase 9: Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] RLS policies verified
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Performance optimized

### Environment Setup
- [ ] Set production Supabase project
- [ ] Add prod environment variables
- [ ] Test in staging environment

### Go Live
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Set up error tracking (Sentry)

## 📋 Migration Task Details

### Task 1: Setup Supabase Schema
**Time: 10 minutes**
```
1. Go to Supabase Dashboard
2. Click SQL Editor
3. Create new query
4. Copy docs/supabase-schema.sql
5. Paste and run
```

### Task 2: Update Index.tsx
**Time: 30 minutes**
```
1. Replace dummy hotels with hotelService.getHotels()
2. Replace dummy promos with promoService.getActivePromos()
3. Add loading state
4. Add error boundary
```

### Task 3: Update Shuttle.tsx
**Time: 45 minutes**
```
1. Fetch real routes and schedules
2. Fetch real seat data
3. Update booking function
4. Add loading/error states
```

### Task 4: Update Ride.tsx
**Time: 45 minutes**
```
1. Fetch real ride types
2. Implement ride request
3. Show real driver (mock for now)
4. Add status tracking
```

### Task 5: Create Auth Pages
**Time: 60 minutes**
```
1. Create Signup.tsx with form validation
2. Create Login.tsx
3. Update routing
4. Protect routes
```

### Task 6: Implement Real-time
**Time: 45 minutes**
```
1. Add subscriptions to Ride component
2. Add subscriptions to Dashboard
3. Test live updates
```

## 🔍 Verification Checklist

After each phase, verify:

- [ ] No console errors
- [ ] Data displays correctly
- [ ] RLS policies work (can't access other user's data)
- [ ] Real-time updates work
- [ ] Error messages are user-friendly
- [ ] Loading states show properly
- [ ] Mobile responsive

## 📊 Estimated Timeline

| Phase | Tasks | Est. Time | Status |
|-------|-------|-----------|--------|
| 1 | Analysis | 2 hours | ✅ Complete |
| 2 | Infrastructure | 1 hour | ✅ Complete |
| 3 | Core Integration | 1 hour | ⏳ In Progress |
| 4 | Frontend Integration | 4 hours | ⏭️ Next |
| 5 | Auth Pages | 2 hours | ⏭️ Next |
| 6 | Driver Features | 2 hours | ⏭️ Next |
| 7 | Real-time | 2 hours | ⏭️ Next |
| 8 | Testing | 3 hours | ⏭️ Next |
| 9 | Deployment | 1 hour | ⏭️ Next |
| **Total** | | **18 hours** | |

## 🎓 Learning Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Query](https://tanstack.com/query/latest)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 📞 Troubleshooting

### Connection Issues
```
Error: "Can't reach database"
Fix: Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
```

### Authentication Errors
```
Error: "Invalid login credentials"
Fix: Verify email is verified (check inbox for verification link)
```

### RLS Policy Errors
```
Error: "new row violates row-level security policy"
Fix: Check if trying to access other user's data. This is expected!
```

### Real-time Not Working
```
Fix: Make sure table has Realtime enabled in Supabase
Go to: Database → Tables → Select table → Realtime (toggle ON)
```

## ✅ Success Criteria

- [ ] Users can sign up and create accounts
- [ ] Users can book shuttles/rides/hotels
- [ ] Bookings are stored in database
- [ ] Users can cancel bookings
- [ ] Admin can view all bookings
- [ ] Real-time updates work
- [ ] No data leakage (RLS working)
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Performance acceptable
