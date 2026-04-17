import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUserAuth } from './UserAuthContext';
import { driverAppService } from '@/services/driverAppService';
import { toast } from '@/hooks/use-toast';

interface DriverState {
  isOnline: boolean;
  status: 'available' | 'busy' | 'on_trip' | 'offline';
  currentLocation: { lat: number; lng: number } | null;
  totalEarnings: number;
  completedTrips: number;
}

interface RideRequest {
  id: string;
  passenger_id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  total_fare: number;
  distance_km: number;
  duration_minutes: number;
  passenger_name?: string;
}

interface DriverContextType {
  driverState: DriverState | null;
  activeTrip: any | null;
  incomingRequest: RideRequest | null;
  isLoading: boolean;
  toggleOnline: (online: boolean) => Promise<void>;
  acceptRequest: (rideId: string) => Promise<void>;
  rejectRequest: (rideId: string) => void;
  startTrip: () => Promise<void>;
  completeTrip: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUserAuth();
  const [driverState, setDriverState] = useState<DriverState | null>(null);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Driver
  const initDriver = useCallback(async () => {
    if (!user || user.role !== 'driver') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await driverAppService.initializeDriver(user.id);
    if (result.success && result.data) {
      setDriverState({
        isOnline: result.data.is_online,
        status: result.data.status,
        currentLocation: result.data.current_latitude ? {
          lat: result.data.current_latitude,
          lng: result.data.current_longitude
        } : null,
        totalEarnings: result.data.total_earnings,
        completedTrips: result.data.completed_trips
      });
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    initDriver();
  }, [initDriver]);

  // Handle Location Updates
  useEffect(() => {
    if (driverState?.isOnline && user) {
      // Start tracking
      locationIntervalRef.current = setInterval(() => {
        // Simulating location update for web
        // In a real mobile app, this would use Capacitor/Cordova Geolocation
        const newLat = (driverState.currentLocation?.lat || -6.2) + (Math.random() - 0.5) * 0.001;
        const newLng = (driverState.currentLocation?.lng || 106.8) + (Math.random() - 0.5) * 0.001;
        
        driverAppService.updateLocation(user.id, newLat, newLng);
        setDriverState(prev => prev ? {
          ...prev,
          currentLocation: { lat: newLat, lng: newLng }
        } : null);
      }, 5000);
    } else {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    }

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [driverState?.isOnline, user]);

  // Subscribe to Ride Requests
  useEffect(() => {
    if (driverState?.isOnline && driverState.status === 'available' && user) {
      const subscription = driverAppService.subscribeToRideRequests(user.id, (payload) => {
        const newRequest = payload.new as RideRequest;
        
        // Show request
        setIncomingRequest(newRequest);
        
        // Auto-reject after 30 seconds
        if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = setTimeout(() => {
          setIncomingRequest(null);
          toast({
            title: "Permintaan Kadaluarsa",
            description: "Anda tidak merespon permintaan perjalanan tepat waktu.",
            variant: "destructive"
          });
        }, 30000);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [driverState?.isOnline, driverState?.status, user]);

  const toggleOnline = async (online: boolean) => {
    if (!user) return;
    const result = await driverAppService.toggleOnlineStatus(user.id, online);
    if (result.success) {
      setDriverState(prev => prev ? {
        ...prev,
        isOnline: online,
        status: online ? 'available' : 'offline'
      } : null);
      
      toast({
        title: online ? "Anda sekarang Online" : "Anda sekarang Offline",
        description: online ? "Siap menerima pesanan!" : "Istirahatlah sejenak.",
      });
    }
  };

  const acceptRequest = async (rideId: string) => {
    if (!user) return;
    if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    
    const result = await driverAppService.acceptRide(rideId, user.id);
    if (result.success) {
      setActiveTrip(result.data);
      setIncomingRequest(null);
      setDriverState(prev => prev ? { ...prev, status: 'busy' } : null);
      
      toast({
        title: "Pesanan Diterima",
        description: "Silakan menuju lokasi penjemputan.",
      });
    } else {
      setIncomingRequest(null);
      toast({
        title: "Gagal Menerima Pesanan",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const rejectRequest = (rideId: string) => {
    if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    setIncomingRequest(null);
    driverAppService.rejectRide(rideId, user?.id || '');
  };

  const startTrip = async () => {
    if (!activeTrip) return;
    const result = await driverAppService.startTrip(activeTrip.id);
    if (result.success) {
      setActiveTrip(result.data);
      setDriverState(prev => prev ? { ...prev, status: 'on_trip' } : null);
      toast({
        title: "Perjalanan Dimulai",
        description: "Semoga sampai tujuan dengan selamat.",
      });
    }
  };

  const completeTrip = async () => {
    if (!activeTrip || !user) return;
    const result = await driverAppService.completeTrip(activeTrip.id, user.id);
    if (result.success) {
      // Refresh driver stats
      const { data: driver } = await driverAppService.initializeDriver(user.id);
      if (driver) {
        setDriverState({
          isOnline: driver.is_online,
          status: driver.status,
          currentLocation: driver.current_latitude ? {
            lat: driver.current_latitude,
            lng: driver.current_longitude
          } : null,
          totalEarnings: driver.total_earnings,
          completedTrips: driver.completed_trips
        });
      }
      
      setActiveTrip(null);
      toast({
        title: "Perjalanan Selesai",
        description: `Anda mendapatkan Rp ${result.data.total_fare.toLocaleString()}`,
      });
    }
  };

  return (
    <DriverContext.Provider value={{
      driverState,
      activeTrip,
      incomingRequest,
      isLoading,
      toggleOnline,
      acceptRequest,
      rejectRequest,
      startTrip,
      completeTrip
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error('useDriver must be used within DriverProvider');
  }
  return context;
};
