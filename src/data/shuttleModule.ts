import { Rayon, ShuttleService, ShuttleVehicle, ShuttleSchedule } from "../types/shuttle";
import { FareRule, SurgeRule, PromoCode, FareCalculationResult, PassengerCount } from "../types/pricing";
import { FareCalculator } from "../lib/fareCalculation";
import { ShuttleServiceTier, VehicleType } from "../types/shuttle";

// ============================================================================
// SHUTTLE FARE RULES & CONFIGURATION
// ============================================================================

/**
 * Shuttle-specific fare rules for different rayons
 * Base price + per-km rate for shuttle services to airport
 */
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
  },
  {
    id: "shuttle-rayon-b",
    rayonId: "rayon-b",
    baseFare: 50000,
    perKmRate: 2500,
    minCharge: 130000,
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
  },
  {
    id: "shuttle-rayon-c",
    rayonId: "rayon-c",
    baseFare: 50000,
    perKmRate: 2500,
    minCharge: 125000,
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
  },
  {
    id: "shuttle-rayon-d",
    rayonId: "rayon-d",
    baseFare: 50000,
    perKmRate: 2500,
    minCharge: 135000,
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

/**
 * Shuttle surge pricing rules (applies during peak times)
 */
export const SHUTTLE_SURGE_RULES: SurgeRule[] = [
  {
    id: "shuttle-surge-morning",
    startTime: "05:00",
    endTime: "08:30",
    daysOfWeek: [1, 2, 3, 4, 5],
    multiplier: 1.3,
    label: "Morning Departure - Busiest Period"
  },
  {
    id: "shuttle-surge-afternoon",
    startTime: "17:00",
    endTime: "20:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    multiplier: 1.2,
    label: "Evening Return - High Demand"
  },
  {
    id: "shuttle-surge-weekend",
    startTime: "00:00",
    endTime: "23:59",
    daysOfWeek: [0, 6],
    multiplier: 1.25,
    label: "Weekend Travel"
  }
];

/**
 * Shuttle promotional codes
 */
export const SHUTTLE_PROMOS: PromoCode[] = [
  {
    id: "promo-shuttle-welcome",
    code: "SHUTTLEDEALS",
    type: "percentage",
    value: 15,
    minSpend: 100000,
    maxDiscount: 30000,
    validFrom: "2024-01-01",
    validUntil: "2026-12-31",
    isActive: true
  },
  {
    id: "promo-shuttle-group",
    code: "GROUPDISCOUNT",
    type: "percentage",
    value: 20,
    minSpend: 300000,
    maxDiscount: 100000,
    validFrom: "2024-01-01",
    validUntil: "2026-12-31",
    isActive: true
  },
  {
    id: "promo-shuttle-roundtrip",
    code: "ROUNDTRIP10",
    type: "percentage",
    value: 10,
    minSpend: 150000,
    maxDiscount: 25000,
    validFrom: "2024-01-01",
    validUntil: "2026-12-31",
    isActive: true
  }
];

export const shuttleRayons: Rayon[] = [
  {
    id: "rayon-a",
    name: "RAYON-A",
    destination: "KNO",
    basePrice: 120000,
    pickupPoints: [
      { id: "a1", name: "Hermes Palace", time: "06:00", distance: 0 },
      { id: "a2", name: "Kama Hotel", time: "06:05", distance: 700 },
      { id: "a3", name: "Travel suite", time: "06:10", distance: 950 },
      { id: "a4", name: "RS Columbia Asia", time: "06:12", distance: 150 },
      { id: "a5", name: "Selecta", time: "06:14", distance: 110 },
      { id: "a6", name: "Danau Toba", time: "06:19", distance: 400 },
      { id: "a7", name: "LePolonia", time: "06:23", distance: 950 },
      { id: "a8", name: "Istana Maimun", time: "06:31", distance: 2000 },
      { id: "a9", name: "Mesjid Raya", time: "06:34", distance: 450 },
      { id: "a10", name: "Grand Antares", time: "06:46", distance: 4100 },
      { id: "a11", name: "Antares", time: "06:53", distance: 2100 },
      { id: "a12", name: "Simp Marendal Aroma", time: "07:16", distance: 7100 },
      { id: "a13", name: "RM Khas Mandailing", time: "07:26", distance: 3400 },
      { id: "a14", name: "Simp Amplas", time: "07:39", distance: 4800 },
      { id: "a15", name: "KNO", time: "08:14", distance: 31000 },
    ]
  },
  {
    id: "rayon-b",
    name: "RAYON-B",
    destination: "KNO",
    basePrice: 130000,
    pickupPoints: [
      { id: "b1", name: "Cambridge", time: "06:00", distance: 0 },
      { id: "b2", name: "Swiss Bellin Gajah", time: "06:05", distance: 1400 },
      { id: "b3", name: "Grand Darussalam", time: "06:08", distance: 750 },
      { id: "b4", name: "Sulthan Hotel", time: "06:10", distance: 160 },
      { id: "b5", name: "Grand Kanaya", time: "06:12", distance: 160 },
      { id: "b6", name: "Four Point", time: "06:15", distance: 450 },
      { id: "b7", name: "Manhattan", time: "06:25", distance: 3600 },
      { id: "b8", name: "Saka Hotel", time: "06:29", distance: 750 },
      { id: "b9", name: "Grand Jamee", time: "06:33", distance: 950 },
      { id: "b10", name: "Sky View Apart", time: "06:47", distance: 5200 },
      { id: "b11", name: "The K-Hotel", time: "06:58", distance: 3700 },
      { id: "b12", name: "Simpang Pos", time: "07:04", distance: 2000 },
      { id: "b13", name: "Asrama Haji Medan", time: "07:11", distance: 2800 },
      { id: "b14", name: "RS Mitra Sejati", time: "07:16", distance: 1600 },
      { id: "b15", name: "Simpang Marendal", time: "07:28", distance: 4400 },
      { id: "b16", name: "Depan Bus ALS", time: "07:39", distance: 3600 },
      { id: "b17", name: "RS Mitra Medika Amp", time: "07:48", distance: 2800 },
      { id: "b18", name: "Tol/Simpang Amplas", time: "07:52", distance: 1200 },
      { id: "b19", name: "KNO", time: "08:25", distance: 30000 },
    ]
  },
  {
    id: "rayon-c",
    name: "RAYON-C",
    destination: "KNO",
    basePrice: 125000,
    pickupPoints: [
      { id: "c1", name: "Adi Mulia", time: "06:00", distance: 0 },
      { id: "c2", name: "Santika", time: "06:03", distance: 450 },
      { id: "c3", name: "Arya Duta", time: "06:05", distance: 240 },
      { id: "c4", name: "Aston Grand City Hall", time: "06:08", distance: 230 },
      { id: "c5", name: "Grand Inna", time: "06:10", distance: 130 },
      { id: "c6", name: "Reiz Suite Artotel", time: "06:13", distance: 450 },
      { id: "c7", name: "Podomoro", time: "06:18", distance: 700 },
      { id: "c8", name: "JW Marriot", time: "06:23", distance: 750 },
      { id: "c9", name: "Emerald Garden", time: "06:28", distance: 750 },
      { id: "c10", name: "Grand Mercure", time: "06:38", distance: 1600 },
      { id: "c11", name: "RS Columbia Asia Aks", time: "06:50", distance: 4800 },
      { id: "c12", name: "Tol Bandar Selamat", time: "06:55", distance: 1300 },
      { id: "c13", name: "Tol KNO", time: "07:30", distance: 20000 },
    ]
  },
  {
    id: "rayon-d",
    name: "RAYON-D",
    destination: "KNO",
    basePrice: 135000,
    pickupPoints: [
      { id: "d1", name: "Hotel TD Pardede", time: "06:00", distance: 0 },
      { id: "d2", name: "Hermes Palace", time: "06:10", distance: 2400 },
      { id: "d3", name: "Ibis Styles", time: "06:21", distance: 3500 },
      { id: "d4", name: "Fave Hotel", time: "06:24", distance: 850 },
      { id: "d5", name: "Masjid Al Jihad", time: "06:29", distance: 1300 },
      { id: "d6", name: "Hotel Deli", time: "06:31", distance: 550 },
      { id: "d7", name: "Grand Central", time: "06:33", distance: 350 },
      { id: "d8", name: "Grand Impression Ho", time: "06:38", distance: 1600 },
      { id: "d9", name: "RAZ Hotel", time: "06:40", distance: 550 },
      { id: "d10", name: "Rumah Sakit USU", time: "06:45", distance: 1600 },
      { id: "d11", name: "Grand Dhika Hotel", time: "07:01", distance: 2000 },
      { id: "d12", name: "Sky View Apart", time: "07:09", distance: 2400 },
      { id: "d13", name: "Simpang Harmonika", time: "07:15", distance: 1800 },
      { id: "d14", name: "Citra Garden", time: "07:23", distance: 3700 },
      { id: "d15", name: "Simpang POS", time: "07:32", distance: 2700 },
      { id: "d16", name: "Asrama Haji", time: "07:39", distance: 2800 },
      { id: "d17", name: "Simpang Amplas", time: "07:55", distance: 5900 },
      { id: "d18", name: "Kualanamu", time: "08:32", distance: 30000 },
    ]
  }
];

export const shuttleSchedules: ShuttleSchedule[] = [
  { id: "sch-1", rayonId: "rayon-a", departureTime: "06:00", availableSeats: 12 },
  { id: "sch-2", rayonId: "rayon-a", departureTime: "10:00", availableSeats: 8 },
  { id: "sch-3", rayonId: "rayon-b", departureTime: "06:00", availableSeats: 15 },
  { id: "sch-4", rayonId: "rayon-b", departureTime: "14:00", availableSeats: 4 },
  { id: "sch-5", rayonId: "rayon-c", departureTime: "06:00", availableSeats: 10 },
  { id: "sch-6", rayonId: "rayon-d", departureTime: "06:00", availableSeats: 14 },
];

export const shuttleServices: ShuttleService[] = [
  { tier: "Regular", amenities: ["AC", "Standard Seat"], priceMultiplier: 1.0 },
  { tier: "Semi Executive", amenities: ["AC", "Comfort Seat", "Water"], priceMultiplier: 1.25 },
  { tier: "Executive", amenities: ["AC", "Reclining Seat", "Water", "Snack", "WiFi"], priceMultiplier: 1.5 },
];

export const shuttleVehicles: ShuttleVehicle[] = [
  { 
    type: "Mini Car", 
    capacity: 4, 
    basePrice: 50000,
    layout: { 
      rows: 2, cols: 3, 
      seats: [
        { id: "s-d", label: "1", isAvailable: true, type: "standard" },
        { id: "s-1", label: "", isAvailable: false, type: "empty" },
        { id: "s-2", label: "D", isAvailable: true, type: "driver" },
        { id: "s-3", label: "2", isAvailable: true, type: "standard" },
        { id: "s-4", label: "3", isAvailable: true, type: "standard" },
        { id: "s-5", label: "4", isAvailable: true, type: "standard" },
      ]
    }
  },
  { 
    type: "SUV", 
    capacity: 7, 
    basePrice: 80000,
    layout: { 
      rows: 3, cols: 3, 
      seats: [
        { id: "s-1", label: "1", isAvailable: true, type: "standard" },
        { id: "e-1", label: "", isAvailable: false, type: "empty" },
        { id: "s-d", label: "D", isAvailable: true, type: "driver" },
        { id: "s-2", label: "2", isAvailable: true, type: "standard" },
        { id: "s-3", label: "3", isAvailable: true, type: "standard" },
        { id: "s-4", label: "4", isAvailable: true, type: "standard" },
        { id: "s-5", label: "5", isAvailable: true, type: "standard" },
        { id: "s-6", label: "6", isAvailable: true, type: "standard" },
        { id: "s-7", label: "7", isAvailable: true, type: "standard" },
      ]
    }
  },
  { 
    type: "Hiace", 
    capacity: 14, 
    basePrice: 180000,
    layout: { 
      rows: 5, cols: 4, 
      seats: [
        { id: "s-1", label: "1", isAvailable: true, type: "standard" },
        { id: "e-1", label: "", isAvailable: false, type: "empty" },
        { id: "e-2", label: "", isAvailable: false, type: "empty" },
        { id: "s-1", label: "D", isAvailable: false, type: "driver" },
        
        { id: "e-2", label: "", isAvailable: false, type: "empty" },
        { id: "s-4", label: "4", isAvailable: true, type: "standard" },
        { id: "s-3", label: "3", isAvailable: true, type: "standard" },
        { id: "s-2", label: "2", isAvailable: true, type: "standard" }, // Door Area
        
        { id: "s-7", label: "7", isAvailable: true, type: "standard" },
        { id: "e-3", label: "", isAvailable: false, type: "empty" },
        { id: "s-6", label: "6", isAvailable: true, type: "standard" }, // Aisle  
        { id: "s-5", label: "5", isAvailable: true, type: "standard" },
        
        { id: "s-10", label: "10", isAvailable: true, type: "standard" },
        { id: "e-4", label: "", isAvailable: false, type: "empty" },
        { id: "s-9", label: "9", isAvailable: true, type: "standard" }, // Aisle
        { id: "s-8", label: "8", isAvailable: true, type: "standard" },
        
        { id: "s-14", label: "14", isAvailable: true, type: "standard" },
        { id: "s-13", label: "13", isAvailable: true, type: "standard" },
        { id: "s-12", label: "12", isAvailable: true, type: "standard" },
        { id: "s-11", label: "11", isAvailable: true, type: "standard" },
      ]
    }
  },
];

// ============================================================================
// SHUTTLE FARE CALCULATION SERVICE
// ============================================================================

/**
 * Shuttle Fare Service - Calculate and manage shuttle fares
 * Integrates with FareCalculator for consistent pricing
 */
export const ShuttleFareService = {
  /**
   * Calculate shuttle fare for a specific rayon, route, and service tier
   * @param rayonId - Rayon identifier (rayon-a, rayon-b, rayon-c, rayon-d)
   * @param pickupPointId - Selected pickup point ID
   * @param serviceTier - Service tier (Regular, Semi Executive, Executive)
   * @param vehicleType - Vehicle type (Mini Car, SUV, Hiace)
   * @param passengers - Passenger breakdown (adults, children, seniors)
   * @param promoCode - Optional promotional code
   * @param isRoundTrip - Whether booking is round trip
   * @returns Detailed fare calculation result
   * 
   * @example
   * const fare = await ShuttleFareService.calculateShuttleFare({
   *   rayonId: 'rayon-a',
   *   pickupPointId: 'a1',
   *   serviceTier: 'Regular',
   *   vehicleType: 'Hiace',
   *   passengers: [{ category: 'adult', count: 2 }],
   *   promoCode: 'SHUTTLEDEALS'
   * });
   */
  async calculateShuttleFare(params: {
    rayonId: string;
    pickupPointId: string;
    serviceTier: ShuttleServiceTier;
    vehicleType: VehicleType;
    passengers: PassengerCount[];
    promoCode?: string;
    isRoundTrip?: boolean;
  }): Promise<FareCalculationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find rayon and pickup point to get actual distance
    const rayon = shuttleRayons.find(r => r.id === params.rayonId);
    const pickupPoint = rayon?.pickupPoints.find(p => p.id === params.pickupPointId);

    if (!rayon || !pickupPoint) {
      throw new Error('Rayon atau pickup point tidak ditemukan');
    }

    // Convert distance from meters to kilometers
    const distanceKm = pickupPoint.distance / 1000;

    // Get fare rule for this rayon
    const fareRule = SHUTTLE_FARE_RULES.find(r => r.rayonId === params.rayonId) 
      || SHUTTLE_FARE_RULES[0];

    // Get promo if provided
    const promo = params.promoCode 
      ? SHUTTLE_PROMOS.find(p => p.code === params.promoCode) 
      : undefined;

    // Calculate using FareCalculator
    const result = FareCalculator.calculateFare({
      distance: distanceKm,
      serviceTier: params.serviceTier,
      vehicleType: params.vehicleType,
      passengers: params.passengers,
      rule: fareRule,
      surgeRules: SHUTTLE_SURGE_RULES,
      promoCode: promo,
      isRoundTrip: params.isRoundTrip
    });

    return result;
  },

  /**
   * Get fare estimate based on simple base price (for quick preview)
   * @param rayonId - Rayon identifier
   * @param serviceTier - Service tier
   * @returns Quick fare estimate
   */
  async getQuickFareEstimate(rayonId: string, serviceTier: ShuttleServiceTier = 'Regular'): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const rayon = shuttleRayons.find(r => r.id === rayonId);
    if (!rayon) throw new Error('Rayon tidak ditemukan');

    const basePrice = rayon.basePrice;
    const serviceTierMultiplier = {
      'Regular': 1.0,
      'Semi Executive': 1.5,
      'Executive': 2.0
    };

    return Math.round(basePrice * (serviceTierMultiplier[serviceTier] || 1));
  },

  /**
   * Calculate fare for route from one pickup point to another
   * @param rayonId - Rayon identifier
   * @param fromPickupId - Starting pickup point
   * @param toPickupId - Ending pickup point
   * @param serviceTier - Service tier
   * @param passengers - Passenger breakdown
   * @returns Fare calculation result
   */
  async calculateRouteFare(params: {
    rayonId: string;
    fromPickupId: string;
    toPickupId: string;
    serviceTier: ShuttleServiceTier;
    vehicleType: VehicleType;
    passengers: PassengerCount[];
    promoCode?: string;
  }): Promise<FareCalculationResult> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const rayon = shuttleRayons.find(r => r.id === params.rayonId);
    if (!rayon) throw new Error('Rayon tidak ditemukan');

    const fromPoint = rayon.pickupPoints.find(p => p.id === params.fromPickupId);
    const toPoint = rayon.pickupPoints.find(p => p.id === params.toPickupId);

    if (!fromPoint || !toPoint) {
      throw new Error('Pickup point tidak ditemukan');
    }

    // Calculate distance difference
    const distanceDifference = Math.abs(toPoint.distance - fromPoint.distance) / 1000;

    const fareRule = SHUTTLE_FARE_RULES.find(r => r.rayonId === params.rayonId) 
      || SHUTTLE_FARE_RULES[0];

    const promo = params.promoCode 
      ? SHUTTLE_PROMOS.find(p => p.code === params.promoCode) 
      : undefined;

    return FareCalculator.calculateFare({
      distance: distanceDifference,
      serviceTier: params.serviceTier,
      vehicleType: params.vehicleType,
      passengers: params.passengers,
      rule: fareRule,
      surgeRules: SHUTTLE_SURGE_RULES,
      promoCode: promo
    });
  },

  /**
   * Validate promo code
   * @param promoCode - Code to validate
   * @returns Promo details if valid
   */
  validatePromoCode(promoCode: string): PromoCode | null {
    const promo = SHUTTLE_PROMOS.find(p => p.code === promoCode && p.isActive);
    
    if (!promo) return null;

    const today = new Date().toISOString().split('T')[0];
    if (today < promo.validFrom || today > promo.validUntil) {
      return null;
    }

    return promo;
  },

  /**
   * Get all active promos
   * @returns Array of active promotional codes
   */
  getActivePromos(): PromoCode[] {
    const today = new Date().toISOString().split('T')[0];
    return SHUTTLE_PROMOS.filter(p => 
      p.isActive && 
      today >= p.validFrom && 
      today <= p.validUntil
    );
  },

  /**
   * Calculate passenger total fare
   * Sums up individual passenger fares for a group booking
   */
  calculateGroupFare(fares: number[]): number {
    return fares.reduce((sum, fare) => sum + fare, 0);
  }
};
