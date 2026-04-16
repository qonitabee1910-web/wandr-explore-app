import { ShuttleServiceTier, VehicleType } from "./shuttle";

export type PassengerCategory = 'adult' | 'child' | 'senior';

export interface PassengerCount {
  category: PassengerCategory;
  count: number;
}

export interface FareRule {
  id: string;
  rayonId: string;
  baseFare: number;
  perKmRate: number;
  minCharge: number;
  
  // Multipliers
  serviceMultipliers: Record<ShuttleServiceTier, number>;
  vehicleMultipliers: Record<VehicleType, number>;
  passengerMultipliers: Record<PassengerCategory, number>;
}

export interface SurgeRule {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  daysOfWeek: number[]; // 0-6
  multiplier: number;
  label: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface FareCalculationResult {
  baseFare: number;
  distanceFare: number;
  serviceSurcharge: number;
  vehicleSurcharge: number;
  surgeSurcharge: number;
  passengerBreakdown: {
    category: PassengerCategory;
    count: number;
    subtotal: number;
  }[];
  subtotal: number;
  promoDiscount: number;
  totalFare: number;
  surgeApplied?: string;
  promoApplied?: string;
  isRoundTrip: boolean;
  roundTripDiscount?: number;
}

export interface TransactionLog {
  id: string;
  timestamp: string;
  bookingId?: string;
  requestedPath: {
    from: string;
    to: string;
    distance: number;
  };
  calculation: FareCalculationResult;
  metadata: {
    userId?: string;
    userAgent: string;
    ipAddress: string;
  };
}
