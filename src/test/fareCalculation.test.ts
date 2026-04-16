import { describe, it, expect } from 'vitest';
import { FareCalculator } from '../lib/fareCalculation';
import { FareRule, SurgeRule, PromoCode, PassengerCount } from '../types/pricing';

describe('FareCalculator', () => {
  const mockRule: FareRule = {
    id: "fr-1",
    rayonId: "rayon-1",
    baseFare: 50000,
    perKmRate: 2000,
    minCharge: 70000,
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
      'child': 0.5,
      'senior': 0.8
    }
  };

  const passengers: PassengerCount[] = [
    { category: 'adult', count: 1 }
  ];

  it('should calculate basic fare correctly', () => {
    const result = FareCalculator.calculateFare({
      distance: 10, // 10km * 2000 = 20000. Total = 50000 + 20000 = 70000
      serviceTier: 'Regular',
      vehicleType: 'Mini Car',
      passengers,
      rule: mockRule,
      surgeRules: []
    });

    expect(result.totalFare).toBe(70000);
    expect(result.distanceFare).toBe(20000);
  });

  it('should apply service tier multiplier', () => {
    const result = FareCalculator.calculateFare({
      distance: 10,
      serviceTier: 'Executive', // 2.0x
      vehicleType: 'Mini Car',
      passengers,
      rule: mockRule,
      surgeRules: []
    });

    // (50000 + 20000) * 2.0 = 140000
    expect(result.totalFare).toBe(140000);
    expect(result.serviceSurcharge).toBe(70000);
  });

  it('should apply surge pricing', () => {
    const surgeRules: SurgeRule[] = [{
      id: 'surge-1',
      startTime: '08:00',
      endTime: '10:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      multiplier: 1.5,
      label: 'Rush Hour'
    }];

    // Mock Monday at 9:00 AM
    const mondayMorning = new Date('2024-05-20T09:00:00');

    const result = FareCalculator.calculateFare({
      distance: 10,
      serviceTier: 'Regular',
      vehicleType: 'Mini Car',
      passengers,
      rule: mockRule,
      surgeRules,
      currentTime: mondayMorning
    });

    // 70000 * 1.5 = 105000
    expect(result.totalFare).toBe(105000);
    expect(result.surgeApplied).toBe('Rush Hour');
  });

  it('should apply promo codes', () => {
    const promo: PromoCode = {
      id: 'p-1',
      code: 'DISCOUNT20',
      type: 'percentage',
      value: 20,
      minSpend: 50000,
      validFrom: '2020-01-01',
      validUntil: '2030-01-01',
      isActive: true
    };

    const result = FareCalculator.calculateFare({
      distance: 10,
      serviceTier: 'Regular',
      vehicleType: 'Mini Car',
      passengers,
      rule: mockRule,
      surgeRules: [],
      promoCode: promo
    });

    // 70000 - (70000 * 0.2) = 56000
    expect(result.totalFare).toBe(56000);
    expect(result.promoDiscount).toBe(140000 * 0.1); // Wait, check logic
    // Actually: 70000 - 14000 = 56000. 
  });

  it('should handle passenger categories correctly', () => {
    const mixedPassengers: PassengerCount[] = [
      { category: 'adult', count: 1 }, // 1.0x
      { category: 'child', count: 1 }  // 0.5x
    ];

    const result = FareCalculator.calculateFare({
      distance: 10,
      serviceTier: 'Regular',
      vehicleType: 'Mini Car',
      passengers: mixedPassengers,
      rule: mockRule,
      surgeRules: []
    });

    // Base = 70000
    // Adult = 70000 * 1.0 = 70000
    // Child = 70000 * 0.5 = 35000
    // Total = 105000
    expect(result.totalFare).toBe(105000);
  });
});
