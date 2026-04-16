import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShuttleBookingState, Rayon, ShuttleSchedule, PickupPoint, ShuttleService, ShuttleVehicle } from '../types/shuttle';
import { FareService } from '../services/fareService';
import { PassengerCount, PassengerCategory } from '../types/pricing';

interface ShuttleContextType {
  state: ShuttleBookingState;
  setRayon: (rayon: Rayon) => void;
  setSchedule: (schedule: ShuttleSchedule) => void;
  setPickupPoint: (point: PickupPoint) => void;
  setService: (service: ShuttleService) => void;
  setVehicle: (vehicle: ShuttleVehicle) => void;
  toggleSeat: (seatId: string) => void;
  setPassengers: (passengers: PassengerCount[]) => void;
  setPromoCode: (code: string | null) => void;
  setRoundTrip: (isRoundTrip: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  finalizeBooking: () => void;
  setPaymentMethod: (method: string) => void;
}

const initialState: ShuttleBookingState = {
  step: 1,
  selectedRayon: null,
  selectedSchedule: null,
  selectedPickupPoint: null,
  selectedService: null,
  selectedVehicle: null,
  selectedSeats: [],
  passengerCounts: [{ category: 'adult', count: 1 }],
  totalPrice: 0,
  fareBreakdown: null,
  bookingStatus: 'draft',
  paymentMethod: null,
  ticketId: null,
  isRoundTrip: false,
  promoCode: null,
};

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export const ShuttleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ShuttleBookingState>(initialState);

  // Real-time fare calculation
  useEffect(() => {
    const updateFare = async () => {
      if (state.selectedRayon && state.selectedService && state.selectedVehicle) {
        try {
          const estimate = await FareService.getEstimate({
            rayonId: state.selectedRayon.id,
            distance: state.selectedPickupPoint?.distance ? state.selectedPickupPoint.distance / 1000 : 50, // Default 50km if not selected
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
  }, [
    state.selectedRayon, 
    state.selectedService, 
    state.selectedVehicle, 
    state.selectedPickupPoint,
    state.passengerCounts,
    state.promoCode,
    state.isRoundTrip
  ]);

  const setRayon = (rayon: Rayon) => {
    setState(prev => ({ 
      ...initialState, 
      selectedRayon: rayon, 
      step: 2 
    }));
  };

  const setSchedule = (schedule: ShuttleSchedule) => {
    setState(prev => ({ ...prev, selectedSchedule: schedule, step: 3 }));
  };

  const setPickupPoint = (point: PickupPoint) => {
    setState(prev => ({ ...prev, selectedPickupPoint: point, step: 4 }));
  };

  const setService = (service: ShuttleService) => {
    setState(prev => ({ ...prev, selectedService: service, step: 5 }));
  };

  const setVehicle = (vehicle: ShuttleVehicle) => {
    setState(prev => ({ ...prev, selectedVehicle: vehicle, step: 6 }));
  };

  const toggleSeat = (seatId: string) => {
    setState(prev => {
      const isSelected = prev.selectedSeats.includes(seatId);
      const newSeats = isSelected 
        ? prev.selectedSeats.filter(id => id !== seatId)
        : [...prev.selectedSeats, seatId];
      
      // Sync passenger counts with seat selection if needed
      // For now, we'll just update the total seats
      return { ...prev, selectedSeats: newSeats };
    });
  };

  const setPassengers = (passengers: PassengerCount[]) => {
    setState(prev => ({ ...prev, passengerCounts: passengers }));
  };

  const setPromoCode = (code: string | null) => {
    setState(prev => ({ ...prev, promoCode: code }));
  };

  const setRoundTrip = (isRoundTrip: boolean) => {
    setState(prev => ({ ...prev, isRoundTrip }));
  };

  const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  
  const setPaymentMethod = (method: string) => {
    setState(prev => ({ ...prev, paymentMethod: method }));
  };

  const finalizeBooking = () => {
    setState(prev => ({ 
      ...prev, 
      bookingStatus: 'paid', 
      ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      step: 9
    }));
  };

  const resetBooking = () => setState(initialState);

  return (
    <ShuttleContext.Provider value={{ 
      state, setRayon, setSchedule, setPickupPoint, setService, 
      setVehicle, toggleSeat, setPassengers, setPromoCode, setRoundTrip,
      nextStep, prevStep, resetBooking,
      finalizeBooking, setPaymentMethod
    }}>
      {children}
    </ShuttleContext.Provider>
  );
};

export const useShuttle = () => {
  const context = useContext(ShuttleContext);
  if (!context) throw new Error('useShuttle must be used within a ShuttleProvider');
  return context;
};
