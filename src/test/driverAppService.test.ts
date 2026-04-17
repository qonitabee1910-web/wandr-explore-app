import { describe, it, expect, vi, beforeEach } from 'vitest';
import { driverAppService } from '../services/driverAppService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => {
  const createMockChain = () => {
    const chain: any = vi.fn(() => chain);
    
    // Common methods that return the chain
    ['from', 'select', 'update', 'insert', 'eq', 'order', 'limit', 'channel', 'on', 'subscribe'].forEach(method => {
      chain[method] = vi.fn(() => chain);
    });

    // Method that usually ends the chain with a Promise
    chain.single = vi.fn(() => Promise.resolve({ data: chain._data || null, error: chain._error || null }));

    // Make the chain itself thenable so it can be awaited at any point (like after .eq())
    chain.then = (resolve: any) => {
      const result = { data: chain._data || null, error: chain._error || null };
      // Reset for next call if needed, or keep for multiple steps
      return Promise.resolve(result).then(resolve);
    };

    // Helper to mock resolved values
    chain.mockResolvedValue = (val: any) => {
      chain._data = val.data;
      chain._error = val.error;
      return chain;
    };

    chain.mockResolvedValueOnce = (val: any) => {
      chain._data = val.data;
      chain._error = val.error;
      return chain;
    };

    return chain;
  };

  const mockChain = createMockChain();

  return {
    supabase: mockChain
  };
});

describe('driverAppService', () => {
  const mockDriverId = 'driver-123';
  const mockRideId = 'ride-456';

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase as any)._data = null;
    (supabase as any)._error = null;
  });

  describe('toggleOnlineStatus', () => {
    it('should successfully toggle status to online', async () => {
      const mockData = { id: mockDriverId, is_online: true, status: 'available' };
      (supabase as any)._data = mockData;

      const result = await driverAppService.toggleOnlineStatus(mockDriverId, true);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle error when toggling status', async () => {
      (supabase as any)._error = new Error('Database error');

      const result = await driverAppService.toggleOnlineStatus(mockDriverId, true);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateLocation', () => {
    it('should successfully update driver location', async () => {
      (supabase as any)._error = null;
      const result = await driverAppService.updateLocation(mockDriverId, -6.2, 106.8);
      expect(result.success).toBe(true);
    });
  });

  describe('acceptRide', () => {
    it('should successfully accept a requested ride', async () => {
      // For multiple calls in one function, this simple mock might need more logic
      // but let's see if setting the 'final' successful state works
      (supabase as any)._data = { id: mockRideId, status: 'accepted' };
      
      // We need to pass the first check 'requested'
      // Since our mock is very simple, let's make it return 'requested' first
      (supabase as any).single.mockResolvedValueOnce({ data: { status: 'requested' }, error: null })
                             .mockResolvedValueOnce({ data: { id: mockRideId, status: 'accepted' }, error: null });

      const result = await driverAppService.acceptRide(mockRideId, mockDriverId);
      
      expect(result.success).toBe(true);
    });
  });

  describe('completeTrip', () => {
    it('should successfully complete a trip and update stats', async () => {
      (supabase as any).single
        .mockResolvedValueOnce({ data: { id: mockRideId, status: 'completed', total_fare: 50000 }, error: null })
        .mockResolvedValueOnce({ data: { total_earnings: 100000, completed_trips: 5 }, error: null });

      const result = await driverAppService.completeTrip(mockRideId, mockDriverId);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('completed');
    });
  });
});
