import { 
  FareRule, 
  SurgeRule, 
  PromoCode, 
  FareCalculationResult, 
  TransactionLog,
  PassengerCount
} from "@/types/pricing";
import { ShuttleServiceTier, VehicleType } from "@/types/shuttle";
import { FareCalculator } from "@/lib/fareCalculation";

// Mock Database
const MOCK_FARE_RULES: FareRule[] = [
  {
    id: "fr-1",
    rayonId: "rayon-1",
    baseFare: 0,
    perKmRate: 2500,
    minCharge: 0,
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

const MOCK_SURGE_RULES: SurgeRule[] = [
  {
    id: "surge-peak-morning",
    startTime: "07:00",
    endTime: "09:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    multiplier: 1.3,
    label: "Morning Rush Hour"
  },
  {
    id: "surge-peak-evening",
    startTime: "17:00",
    endTime: "19:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    multiplier: 1.4,
    label: "Evening Rush Hour"
  },
  {
    id: "surge-weekend",
    startTime: "00:00",
    endTime: "23:59",
    daysOfWeek: [0, 6],
    multiplier: 1.2,
    label: "Weekend Demand"
  }
];

const MOCK_PROMOS: PromoCode[] = [
  {
    id: "promo-welcome",
    code: "WELCOMEWANDR",
    type: "percentage",
    value: 20,
    minSpend: 100000,
    maxDiscount: 50000,
    validFrom: "2024-01-01",
    validUntil: "2026-12-31",
    isActive: true
  }
];

/**
 * Fare Service (Simulating RESTful API)
 */
export const FareService = {
  /**
   * GET /api/fares/estimate
   */
  async getEstimate(params: {
    rayonId: string;
    distance: number;
    serviceTier: ShuttleServiceTier;
    vehicleType: VehicleType;
    passengers: PassengerCount[];
    promoCode?: string;
    isRoundTrip?: boolean;
  }): Promise<FareCalculationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const rule = MOCK_FARE_RULES.find(r => r.rayonId === params.rayonId) || MOCK_FARE_RULES[0];
    const promo = params.promoCode ? MOCK_PROMOS.find(p => p.code === params.promoCode) : undefined;

    const result = FareCalculator.calculateFare({
      distance: params.distance,
      serviceTier: params.serviceTier,
      vehicleType: params.vehicleType,
      passengers: params.passengers,
      rule,
      surgeRules: MOCK_SURGE_RULES,
      promoCode: promo,
      isRoundTrip: params.isRoundTrip
    });

    // Log the calculation (Simulating database write)
    this.logTransaction(params, result);

    return result;
  },

  /**
   * POST /api/fares/log
   */
  logTransaction(request: any, result: FareCalculationResult) {
    const log: TransactionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      requestedPath: {
        from: "Unknown", // In real scenario, get from rayonId
        to: "Unknown",
        distance: request.distance
      },
      calculation: result,
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: "127.0.0.1"
      }
    };
    
    // In a real app, this would be a POST request to a logging endpoint
    const logs = JSON.parse(localStorage.getItem('fare_logs') || '[]');
    logs.push(log);
    localStorage.setItem('fare_logs', JSON.stringify(logs.slice(-50))); // Keep last 50
    
    console.log("[FareService] Transaction Logged:", log);
  },

  /**
   * GET /api/admin/fare-rules
   */
  async getAdminRules(): Promise<FareRule[]> {
    return MOCK_FARE_RULES;
  },

  /**
   * GET /api/admin/transaction-logs
   */
  async getTransactionLogs(): Promise<TransactionLog[]> {
    return JSON.parse(localStorage.getItem('fare_logs') || '[]');
  }
};
