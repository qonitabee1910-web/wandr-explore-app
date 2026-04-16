import { 
  FareRule, 
  SurgeRule, 
  PromoCode, 
  FareCalculationResult, 
  PassengerCount,
  PassengerCategory
} from "@/types/pricing";
import { ShuttleServiceTier, VehicleType } from "@/types/shuttle";

/**
 * Core Fare Calculation Module
 */
export class FareCalculator {
  /**
   * Calculate real-time fare estimation
   */
  static calculateFare(params: {
    distance: number; // km
    serviceTier: ShuttleServiceTier;
    vehicleType: VehicleType;
    passengers: PassengerCount[];
    rule: FareRule;
    surgeRules: SurgeRule[];
    promoCode?: PromoCode;
    isRoundTrip?: boolean;
    currentTime?: Date;
  }): FareCalculationResult {
    const { 
      distance, 
      serviceTier, 
      vehicleType, 
      passengers, 
      rule, 
      surgeRules, 
      promoCode, 
      isRoundTrip = false,
      currentTime = new Date()
    } = params;

    // 1. Calculate Base and Distance Fare
    const distanceFare = distance * rule.perKmRate;
    const initialBase = Math.max(rule.baseFare + distanceFare, rule.minCharge);

    // 2. Multipliers
    const serviceMultiplier = rule.serviceMultipliers[serviceTier] || 1;
    const vehicleMultiplier = rule.vehicleMultipliers[vehicleType] || 1;
    
    const serviceSurcharge = initialBase * (serviceMultiplier - 1);
    const vehicleSurcharge = initialBase * (vehicleMultiplier - 1);

    // 3. Surge Pricing
    let surgeMultiplier = 1;
    let surgeLabel = "";
    
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentDay = currentTime.getDay();
    const timeInMinutes = currentHour * 60 + currentMinute;

    for (const surge of surgeRules) {
      const [startH, startM] = surge.startTime.split(':').map(Number);
      const [endH, endM] = surge.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (surge.daysOfWeek.includes(currentDay)) {
        if (timeInMinutes >= startMinutes && timeInMinutes <= endMinutes) {
          if (surge.multiplier > surgeMultiplier) {
            surgeMultiplier = surge.multiplier;
            surgeLabel = surge.label;
          }
        }
      }
    }

    const baseAfterMultipliers = initialBase + serviceSurcharge + vehicleSurcharge;
    const surgeSurcharge = baseAfterMultipliers * (surgeMultiplier - 1);

    // 4. Passenger Breakdown
    let totalBeforePromo = 0;
    const passengerBreakdown = passengers.map(p => {
      const pMultiplier = rule.passengerMultipliers[p.category] || 1;
      const perPersonFare = (baseAfterMultipliers + surgeSurcharge) * pMultiplier;
      const subtotal = perPersonFare * p.count;
      totalBeforePromo += subtotal;
      
      return {
        category: p.category,
        count: p.count,
        subtotal
      };
    });

    // 5. Round Trip Discount (e.g., 10% off second leg)
    let roundTripDiscount = 0;
    if (isRoundTrip) {
      // For simplicity, we double the fare and apply 10% discount on the total
      totalBeforePromo *= 2;
      roundTripDiscount = totalBeforePromo * 0.1;
      totalBeforePromo -= roundTripDiscount;
    }

    // 6. Promo Code Application
    let promoDiscount = 0;
    if (promoCode && promoCode.isActive) {
      const now = new Date();
      const validFrom = new Date(promoCode.validFrom);
      const validUntil = new Date(promoCode.validUntil);

      if (now >= validFrom && now <= validUntil && totalBeforePromo >= promoCode.minSpend) {
        if (promoCode.type === 'percentage') {
          promoDiscount = totalBeforePromo * (promoCode.value / 100);
          if (promoCode.maxDiscount) {
            promoDiscount = Math.min(promoDiscount, promoCode.maxDiscount);
          }
        } else {
          promoDiscount = promoCode.value;
        }
      }
    }

    const finalTotal = Math.max(0, totalBeforePromo - promoDiscount);

    return {
      baseFare: rule.baseFare,
      distanceFare,
      serviceSurcharge,
      vehicleSurcharge,
      surgeSurcharge,
      passengerBreakdown,
      subtotal: totalBeforePromo + roundTripDiscount + promoDiscount,
      promoDiscount,
      totalFare: finalTotal,
      surgeApplied: surgeLabel || undefined,
      promoApplied: promoCode?.code,
      isRoundTrip,
      roundTripDiscount: roundTripDiscount || undefined
    };
  }
}
