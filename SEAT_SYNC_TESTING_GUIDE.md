# Seat Layout Synchronization - Testing Guide

## 📋 Overview
Setelah sinkronisasi, penempatan seats di **Admin SeatLayoutEditor** harus EXACTLY sama dengan di **User SeatSelection**.

---

## ✅ Test Plan

### Test 1: Fixed Screen (Desktop)
**Objective**: Verify seats are positioned identically at standard desktop resolution

1. Open Admin Panel → Seat Layout Editor
2. Create a new layout with:
   - Base Width: 800px
   - Base Height: 600px
   - Global Scale: 1.0
3. Add 5 seats at different positions:
   - Seat 1: x=25%, y=25%
   - Seat 2: x=50%, y=50%
   - Seat 3: x=75%, y=75%
   - Seat 4: x=10%, y=90%
   - Seat 5: x=90%, y=10%
4. Set Zoom = 1.0 (100%)
5. Publish layout
6. Open User Shuttle Booking → Select Seats
7. **VERIFY**: All 5 seats appear in EXACT same position and size

**Expected Result**: ✅ Seats perfectly aligned at 100% zoom

---

### Test 2: Scaled View - Admin Zoom
**Objective**: Verify zoom scaling works correctly in admin

1. From Test 1 setup, in Admin Editor:
2. Zoom to 1.5x (150%)
3. Verify seats:
   - Position percentages stay same (left/top %)
   - Visual size increases proportionally
   - No drift or jumping
4. Zoom to 0.75x (75%)
5. **VERIFY**: Seats re-scale smoothly

**Expected Result**: ✅ Zoom works smoothly without position drift

---

### Test 3: Responsive Container - Mobile
**Objective**: Verify responsive scaling works on different screen sizes

1. Admin Editor on Desktop:
   - Resize browser to 600px width
   - Observe seat positions and sizes
   - Verify ratio calculation: ratio = 600 / 800 = 0.75
   - Expected seat size: 32px × 0.75 = 24px

2. User Booking on Same Width:
   - Open on device/browser with 600px width
   - Verify seats appear at SAME size and position
   - Container maxWidth should NOT be exceeded

3. Test Multiple Widths:
   - 480px (mobile)
   - 768px (tablet)
   - 1024px (desktop)

**Expected Result**: ✅ Responsive scaling identical at all widths

---

### Test 4: Drag Operations - Consistency
**Objective**: Verify drag coordinates work correctly

1. Admin Editor (100% zoom, full width container):
   - Drag seat from (50%, 50%) to (75%, 75%)
   - Record new position
   - Refresh page

2. User Booking (same width):
   - Verify seat is at (75%, 75%)
   - Visual position matches admin

3. Repeat with:
   - Different zoom levels (0.75x, 1.5x)
   - Different container widths
   - Grid snapping ON/OFF

**Expected Result**: ✅ Drag coordinates persist correctly

---

### Test 5: Aspect Ratio Integrity
**Objective**: Verify aspect ratio calculations match

1. Create layouts with different aspect ratios:
   - 800 × 600 (4:3)
   - 1000 × 600 (5:3)
   - 600 × 800 (3:4)

2. For each layout:
   - Admin: Measure container aspectRatio
   - User: Measure container aspectRatio
   - **VERIFY**: Both match `baseWidth / baseHeight`

3. Place seat at 50%, 50% in each
4. **VERIFY**: Seat at center in both admin & user

**Expected Result**: ✅ Aspect ratio perfectly preserved

---

### Test 6: Seat Dimensions (Width/Length/Height)
**Objective**: Verify custom seat dimensions scale correctly

1. Create seats with different dimensions:
   - Seat A: seat_width=1.0, seat_length=1.0 (normal)
   - Seat B: seat_width=1.5, seat_length=1.0 (wide)
   - Seat C: seat_width=0.75, seat_length=1.5 (tall)

2. Admin Editor at 100% zoom:
   - Measure visual widths/heights
   - Record exact pixel values

3. User Booking:
   - Measure same seats
   - Calculate: admin_width / ratio should equal user_width

4. Test at multiple container widths
   - Verify formula: `baseSeatSize × dimensionMultiplier = finalSize`

**Expected Result**: ✅ Dimensions scale proportionally with ratio

---

### Test 7: Grid Snapping Synchronization
**Objective**: Verify grid snapping doesn't affect positioning sync

1. Admin Editor:
   - Enable Grid Snapping
   - Set Grid Size: 10%
   - Drag seat to 57%, 63% (non-snapped)
   - Verify it snaps to 60%, 60%

2. Save layout and publish

3. User Booking:
   - Verify seat appears at 60%, 60%
   - Grid snapping not visible but position correct

**Expected Result**: ✅ Grid snapping only affects admin, not user display

---

### Test 8: Performance - Multiple Seats
**Objective**: Verify performance with many seats

1. Create layout with 100+ seats (random positions)
2. Admin Editor:
   - Monitor rendering performance
   - Drag seats smoothly
   - No frame drops or lag

3. User Booking:
   - Open same layout
   - All seats render immediately
   - Selection smooth

**Expected Result**: ✅ Performance remains good with many seats

---

### Test 9: Base Map Background
**Objective**: Verify background image scales correctly with container

1. Upload base map image to layout
   - Image should scale with container

2. Admin Editor:
   - At different zoom levels
   - At different container widths
   - Verify image doesn't distort

3. User Booking:
   - Background image alignment perfect
   - Seats overlay correctly on image

**Expected Result**: ✅ Background image scales proportionally

---

### Test 10: Edge Cases
**Objective**: Test boundary conditions

**Case A: Very Large Global Scale (2.0)**
- Seats should be 2x normal size
- Should still fit on canvas
- Responsive scaling still works

**Case B: Very Small Global Scale (0.5)**
- Seats should be 0.5x normal size
- Precise clicking still works
- Ratio calculation correct

**Case C: Extreme Zoom (0.5x and 2.0x)**
- Seat positioning accurate
- No coordinate drift
- Bounds checking works

**Case D: Container Minimum Width**
- Container hits maxWidth: 900px
- Ratio = 900 / 800 = 1.125
- Seats scale to 1.125x base size

**Expected Result**: ✅ All edge cases handled correctly

---

## 📊 Verification Checklist

### Admin Editor
- [ ] Container is responsive (100% width, maxWidth 900px)
- [ ] ResizeObserver tracking containerWidth correctly
- [ ] Ratio calculation: `containerWidth / baseWidth`
- [ ] Seat sizing: `32 × global_scale × ratio × dimension`
- [ ] Seats positioned with left/top percentages
- [ ] All seats use transform: translate(-50%, -50%)
- [ ] Zoom transform applied to canvas correctly
- [ ] Canvas bounds checking works (0-100%)

### User Selection
- [ ] Container responsive (100% width, maxWidth 600px)
- [ ] ResizeObserver tracking containerWidth correctly
- [ ] Ratio calculation: `containerWidth / baseWidth`
- [ ] Seat sizing: `32 × global_scale × ratio × dimension`
- [ ] Seats positioned with left/top percentages
- [ ] All seats use transform: translate(-50%, -50%)
- [ ] No zoom transform (seats scale via container)
- [ ] Seat selection functionality works

### Data Consistency
- [ ] x_pos/y_pos percentages saved identically
- [ ] seat_width/seat_length dimensions saved identically
- [ ] global_scale applied identically
- [ ] base_width/base_height used for ratio calculation

---

## 🐛 Troubleshooting

### Issue: Seats misaligned on user side
**Check**:
1. ResizeObserver triggering correctly
2. Ratio calculation correct
3. containerWidth has value > 0
4. CSS aspectRatio applied correctly

### Issue: Zoom not working in admin
**Check**:
1. Canvas transform-origin: center
2. Zoom state updating correctly
3. Canvas bounds still respected

### Issue: Responsive scaling not working
**Check**:
1. Container has maxWidth set
2. ResizeObserver observing correct element
3. Ratio recalculated when layout changes

### Issue: Seats jumping during drag
**Check**:
1. dragElastic={0} set
2. dragMomentum={false} set
3. transform-origin consistent
4. Coordinate calculation includes zoom compensation

---

## 📝 Notes

- Container maxWidth in admin: 900px (vs 600px in user)
  - Admin has more screen space for editing
  - Ratio calculation still ensures sync
  - At max width: ratio = 900/800 = 1.125

- Grid snapping only affects admin coordinates
  - User doesn't see grid
  - Position still synced correctly

- Aspect ratio maintained through `aspectRatio` CSS
  - No explicit height calculation needed
  - Container scales proportionally

---

## ✅ Sign-Off

Once all tests pass:
1. Document final measurements
2. Screenshots showing alignment
3. Performance metrics
4. Commit with `[FEAT] Seat Layout Synchronization Complete`
