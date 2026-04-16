import { PassengerCount } from "./pricing";

export type ShuttleServiceTier = 'Regular' | 'Semi Executive' | 'Executive';

export type VehicleType = 'Mini Car' | 'SUV' | 'Hiace';

export interface PickupPoint {
  id: string;
  name: string;
  time: string;
  distance: number; // in meters (Mtr)
}

export interface Rayon {
  id: string;
  name: string; // e.g., "RAYON-A"
  destination: string; // e.g., "KNO"
  pickupPoints: PickupPoint[];
  basePrice: number;
}

export interface ShuttleSchedule {
  id: string;
  rayonId: string;
  departureTime: string;
  availableSeats: number;
}

export interface ShuttleService {
  tier: ShuttleServiceTier;
  amenities: string[];
  priceMultiplier: number;
}

export interface ShuttleVehicle {
  type: VehicleType;
  capacity: number;
  layout: SeatLayout;
  basePrice: number;
}

export interface SeatLayout {
  rows: number;
  cols: number;
  seats: SeatInfo[];
}

export interface SeatInfo {
  id: string;
  label: string;
  isAvailable: boolean;
  type: 'standard' | 'empty' | 'driver';
}

export interface ShuttleBookingState {
  step: number;
  selectedRayon: Rayon | null;
  selectedSchedule: ShuttleSchedule | null;
  selectedPickupPoint: PickupPoint | null;
  selectedService: ShuttleService | null;
  selectedVehicle: ShuttleVehicle | null;
  selectedSeats: string[];
  passengerCounts: PassengerCount[];
  totalPrice: number;
  fareBreakdown: any | null; // Detailed calculation
  bookingStatus: 'draft' | 'validating' | 'confirmed' | 'paid' | 'completed';
  paymentMethod: string | null;
  ticketId: string | null;
  isRoundTrip: boolean;
  promoCode: string | null;
}
