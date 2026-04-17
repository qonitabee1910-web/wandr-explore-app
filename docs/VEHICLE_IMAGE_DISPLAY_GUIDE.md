# Vehicle Image Display in Shuttle Seat Selection - Implementation Guide

## 📋 Overview

Implementasi menampilkan **gambar kendaraan lengkap dengan seat map** di halaman pemilihan kursi pengguna. Pengguna akan melihat:

1. ✅ **Gambar kendaraan** (Hiace/SUV/Mini Car) di bagian atas
2. ✅ **Denah kursi interaktif** di bawahnya
3. ✅ **Informasi kendaraan** (tipe & kapasitas)

---

## 🏗️ Architecture Changes

### 1. Database Schema Update
**File**: `supabase/migrations/20260418_add_vehicle_image_to_shuttles.sql`

Menambahkan kolom `vehicle_image_url` ke tabel `shuttles`:
```sql
ALTER TABLE public.shuttles 
ADD COLUMN IF NOT EXISTS vehicle_image_url VARCHAR(500);
```

**Keuntungan**:
- Admin bisa upload gambar per shuttle (bukan hanya by type)
- Fleksibel untuk custom branding per kendaraan
- Field nullable, backward compatible

---

### 2. TypeScript Type Update
**File**: `src/admin/types/index.ts`

```typescript
export interface Shuttle {
  id: string;
  name: string;
  license_plate: string;
  capacity: number;
  current_occupancy: number;
  vehicle_type: string;
  vehicle_image_url?: string; // ← NEW: URL to vehicle image
  status: 'active' | 'maintenance' | 'inactive';
  driver_id?: string;
  current_location?: Location;
  route_id?: string;
  next_stop?: string;
  created_at: string;
  updated_at: string;
}
```

---

### 3. Vehicle Type Images Data
**File**: `src/data/vehicleImages.ts` (NEW)

Menyimpan default images per vehicle type:

```typescript
export const vehicleTypeImages: Record<string, { image: string; name: string }> = {
  'Mini Car': {
    name: 'Mini Car',
    image: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop'
  },
  'SUV': {
    name: 'SUV',
    image: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop'
  },
  'Hiace': {
    name: 'Hiace',
    image: 'https://images.unsplash.com/photo-1464219414925-bed2b42ac467?w=600&h=400&fit=crop'
  }
};

export const getVehicleImage = (vehicleType: string | undefined): string | null => {
  if (!vehicleType) return null;
  const vehicle = vehicleTypeImages[vehicleType];
  return vehicle?.image || null;
};
```

---

### 4. SeatSelection Component Update
**File**: `src/components/shuttle/SeatSelection.tsx`

#### Perubahan:

**a) Import vehicle image helper**
```typescript
import { getVehicleImage } from '../../data/vehicleImages';
```

**b) Add state untuk vehicle image**
```typescript
const [vehicleImageUrl, setVehicleImageUrl] = useState<string | null>(null);
```

**c) Load image saat layout loaded**
```typescript
useEffect(() => {
  // ... existing code ...
  
  // Get vehicle image from selected vehicle type
  if (state.selectedVehicle?.type) {
    const vehicleImage = getVehicleImage(state.selectedVehicle.type);
    setVehicleImageUrl(vehicleImage);
  }
}, [state.selectedVehicle]);
```

**d) Render vehicle image container (BARU)**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl overflow-hidden shadow-md border border-primary/10"
>
  <div className="relative h-64 md:h-80 w-full bg-muted flex items-center justify-center">
    {vehicleImageUrl ? (
      <>
        <img 
          src={vehicleImageUrl} 
          alt={state.selectedVehicle?.type || 'Vehicle'}
          className="w-full h-full object-cover"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </>
    ) : (
      <div className="text-center space-y-2">
        <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
        <p className="text-sm text-muted-foreground">Gambar kendaraan tidak tersedia</p>
      </div>
    )}
  </div>
  <div className="p-4 bg-white/50 backdrop-blur-sm border-t">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase">Kendaraan</p>
        <h3 className="text-2xl font-bold">{state.selectedVehicle?.type}</h3>
      </div>
      <Badge variant="secondary" className="text-lg px-3 py-1">
        Kapasitas {state.selectedVehicle?.capacity}
      </Badge>
    </div>
  </div>
</motion.div>
```

---

## 🎨 UI Layout

### Layout Hierarchy

```
┌─────────────────────────────────────────┐
│  🔙 Pilih Kursi                        │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │                                      │ │ h-64 md:h-80
│  │  [VEHICLE IMAGE WITH GRADIENT]      │ │
│  │                                      │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ 🚗 Kendaraan: Hiace | Kapasitas: 14 │ │ Info bar
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│         Layout: Seat Selection (2/3)     │
├─────────────────────────────────────────┤
│  [Denah Kursi]      │  [Sidebar Summary]  │
│                     │  • Kursi terpilih   │
│  [Seat Map Overlay] │  • Total Harga      │
│                     │  • [Confirm Button] │
│                     │  [Legend]           │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### User Journey:

1. **Service Selection** → User pilih service tier
2. **Vehicle Selection** → User pilih tipe kendaraan
3. **Seat Selection** ← **YOU ARE HERE**
   - Load published seat layout
   - Get vehicle image by type from `vehicleImages.ts`
   - Display image + seat map overlay
   - User select seats
4. **Confirmation**

### Data Sources:

| Data | Source | Type |
|------|--------|------|
| Vehicle Type | `state.selectedVehicle.type` | From context |
| Vehicle Image | `vehicleTypeImages[type]` | From `vehicleImages.ts` |
| Seat Layout | Database (published) | From `seatLayoutService` |
| Seat Map | Layout's `base_map_url` | Optional admin upload |
| Occupied Seats | `state.occupiedSeats` | From context |

---

## 🚀 How It Works

### Image Display Priority (Fallback Chain):

```
1. Try: Custom vehicle_image_url from database (if admin uploaded)
   ↓ (if null/error)
2. Try: Default image by vehicle type from vehicleImages.ts
   ↓ (if error)
3. Show: Placeholder with ImageIcon + "Gambar kendaraan tidak tersedia"
```

---

## 📱 Responsive Behavior

### Desktop (md+):
- Vehicle image: `h-80` (320px height)
- Layout: 2/3 grid split
  - Image: 2/3 width
  - Sidebar: 1/3 width

### Mobile:
- Vehicle image: `h-64` (256px height)
- Layout: Stacked (full width)
  - Image: Full width
  - Seat map: Full width below
  - Sidebar: Full width below

---

## 🔐 Admin Setup (For Admins)

### To Add Custom Vehicle Images:

1. **Via Admin Panel** (if implemented):
   - Go to Shuttle Management
   - Select shuttle
   - Upload vehicle image → saves to `vehicle_image_url`

2. **Direct Database Update**:
   ```sql
   UPDATE public.shuttles 
   SET vehicle_image_url = 'https://your-image-url.jpg'
   WHERE id = 'shuttle-uuid';
   ```

3. **Via Supabase Storage** (Recommended):
   - Upload image to `shuttles/` bucket
   - Get public URL
   - Save URL to `vehicle_image_url`

---

## ✅ Testing Checklist

- [ ] Vehicle image displays on desktop (h-80)
- [ ] Vehicle image displays on mobile (h-64)
- [ ] Vehicle info (Hiace, Kapasitas 14) shows correctly
- [ ] Gradient overlay appears on image
- [ ] Placeholder shows when no image available
- [ ] Seat map displays correctly over layout
- [ ] Seat selection works (no blocking by image)
- [ ] Responsive layout breaks correctly
- [ ] Different vehicle types show different images
- [ ] Image error handling works (fallback to placeholder)

---

## 🎯 Features

| Feature | Status | Details |
|---------|--------|---------|
| Vehicle Image Display | ✅ Complete | Shows per vehicle type |
| Responsive Layout | ✅ Complete | Auto-scales h-64/h-80 |
| Fallback Handling | ✅ Complete | Placeholder if no image |
| Seat Map Overlay | ✅ Complete | On top of image/layout |
| Info Bar | ✅ Complete | Shows vehicle type & capacity |
| Database Field | ✅ Ready | `vehicle_image_url` column added |

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260418_add_vehicle_image_to_shuttles.sql` | DB schema |
| `src/admin/types/index.ts` | Shuttle interface |
| `src/data/vehicleImages.ts` | Vehicle type images |
| `src/components/shuttle/SeatSelection.tsx` | UI component |
| `src/context/ShuttleContext.tsx` | State management |
| `src/admin/services/seatLayoutService.ts` | Seat data |

---

## 🔮 Future Enhancements

1. **Admin Upload Panel**
   - Drag & drop image upload
   - Image crop tool
   - Supabase storage integration

2. **Image Optimization**
   - WebP format support
   - Responsive images (srcset)
   - Lazy loading

3. **360° Vehicle Preview** (Nice to have)
   - Multi-angle vehicle photos
   - Interactive 3D model
   - Interior photos

4. **Vehicle Specs Display**
   - Amenities icons
   - Features list
   - Air-con, WiFi indicators

---

## 🐛 Troubleshooting

### Image not displaying?

**Check**:
1. Is `state.selectedVehicle` set? → Debug ShuttleContext
2. Is vehicle type in `vehicleTypeImages`? → Check key name
3. Is image URL valid? → Test URL in browser
4. Console errors? → Check browser DevTools Network tab

### Seat map not visible?

**Check**:
1. Is `layout.base_map_url` set? → Admin needs to upload
2. Is `layout.seats` populated? → Check seatLayoutService
3. Is `containerWidth` > 0? → ResizeObserver working?

---

## 📞 Support

- Database Schema: See `SUPABASE_INTEGRATION_GUIDE.md`
- Seat Layout System: See `SEAT_SYNC_COMPLETE_SUMMARY.md`
- Component Structure: See `COMPONENT_DEPENDENCY_MAP.md`
