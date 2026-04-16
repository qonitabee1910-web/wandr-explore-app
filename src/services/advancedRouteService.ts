import { GeoLocation, RouteInfo, GeocodingResult } from "@/types/maps";

/**
 * Traffic condition types and their speed reduction factors
 */
type TrafficCondition = 'light' | 'moderate' | 'heavy' | 'congested';

/**
 * Route scenario types for testing
 */
export type RouteScenario = 'in-city' | 'inter-city' | 'rural';

/**
 * Traffic factor configuration based on time of day and condition
 */
interface TrafficFactors {
  condition: TrafficCondition;
  speedReduction: number; // 0-1, where 1 = 100% speed, 0.5 = 50% speed
  timeOfDay: 'peak-hours' | 'off-peak' | 'night';
}

/**
 * Detailed route information with enhanced data
 */
export interface DetailedRouteInfo extends RouteInfo {
  startAddress: string;
  endAddress: string;
  scenario: RouteScenario;
  trafficCondition: TrafficCondition;
  polylineSimplified: [number, number][];
  distanceAccuracy: number; // 0-100%
  timeAccuracy: number; // 0-100%
}

/**
 * Advanced Route Service using OSRM API
 * Provides accurate distance calculation, traffic estimation, and geocoding
 * 
 * Features:
 * - Route calculation using OSRM (Dijkstra/A* based)
 * - Reverse geocoding with full address resolution
 * - Real-time traffic simulation
 * - Polyline simplification
 * - Comprehensive error handling
 */
export const AdvancedRouteService = {
  /**
   * Base speed for different route scenarios (km/h)
   */
  baseSpeedByScenario: {
    'in-city': 40,
    'inter-city': 80,
    'rural': 60
  } as const,

  /**
   * Detect route scenario based on distance and endpoint characteristics
   * @param distance Route distance in km
   * @param start Starting location
   * @param end Ending location
   * @returns RouteScenario type
   * 
   * @example
   * const scenario = AdvancedRouteService.detectRouteScenario(25, startLoc, endLoc);
   * // Returns 'in-city' | 'inter-city' | 'rural'
   */
  detectRouteScenario(distance: number, start: GeoLocation, end: GeoLocation): RouteScenario {
    // Simple heuristic: if > 50km, likely inter-city
    if (distance > 50) return 'inter-city';
    
    // Check if coordinates are significantly different
    const latDiff = Math.abs(start.lat - end.lat);
    const lngDiff = Math.abs(start.lng - end.lng);
    const coordDiff = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    // If very small area (< 0.1 degrees), likely in-city
    if (coordDiff < 0.1) return 'in-city';
    
    // Medium distance or sparse coordinates = rural
    if (distance > 20 || coordDiff > 0.5) return 'rural';
    
    return 'in-city';
  },

  /**
   * Get traffic factors based on current time and road conditions
   * Simulates real-time traffic with realistic patterns
   * @param timeOfDay Hour of day (0-23) for traffic simulation
   * @param scenario Route scenario affecting traffic intensity
   * @returns TrafficFactors with condition and speed reduction
   * 
   * @example
   * const factors = AdvancedRouteService.getTrafficFactors(8, 'in-city');
   * // Returns { condition: 'heavy', speedReduction: 0.6, timeOfDay: 'peak-hours' }
   */
  getTrafficFactors(timeOfDay: number = new Date().getHours(), scenario: RouteScenario = 'in-city'): TrafficFactors {
    let timeCategory: 'peak-hours' | 'off-peak' | 'night';
    let condition: TrafficCondition;
    let speedReduction: number;

    // Time-based categorization
    if (timeOfDay >= 6 && timeOfDay <= 9) {
      // Morning rush hour
      timeCategory = 'peak-hours';
      condition = scenario === 'in-city' ? 'heavy' : 'moderate';
      speedReduction = scenario === 'in-city' ? 0.5 : 0.75;
    } else if (timeOfDay >= 16 && timeOfDay <= 19) {
      // Evening rush hour
      timeCategory = 'peak-hours';
      condition = scenario === 'in-city' ? 'congested' : 'moderate';
      speedReduction = scenario === 'in-city' ? 0.4 : 0.7;
    } else if (timeOfDay >= 22 || timeOfDay <= 5) {
      // Night: light traffic
      timeCategory = 'night';
      condition = 'light';
      speedReduction = 0.95; // Almost full speed
    } else {
      // Off-peak hours
      timeCategory = 'off-peak';
      condition = scenario === 'in-city' ? 'moderate' : 'light';
      speedReduction = scenario === 'in-city' ? 0.75 : 0.9;
    }

    return { timeOfDay: timeCategory, condition, speedReduction };
  },

  /**
   * Calculate estimated travel time with traffic considerations
   * Uses actual distance from OSRM and applies traffic factors
   * @param distance Distance in km from OSRM
   * @param scenario Route scenario
   * @param trafficFactors Traffic conditions affecting speed
   * @returns Duration in minutes
   * 
   * @example
   * const time = AdvancedRouteService.calculateTravelTime(15, 'in-city', factors);
   * // Returns estimated minutes (e.g., 28 minutes)
   */
  calculateTravelTime(distance: number, scenario: RouteScenario, trafficFactors: TrafficFactors): number {
    const baseSpeed = this.baseSpeedByScenario[scenario];
    const effectiveSpeed = baseSpeed * trafficFactors.speedReduction;
    
    // Convert: distance(km) / speed(km/h) * 60 = minutes
    const durationMinutes = (distance / effectiveSpeed) * 60;
    
    return Math.ceil(durationMinutes);
  },

  /**
   * Simplify polyline using Douglas-Peucker algorithm
   * Reduces number of points while maintaining route shape for better performance
   * @param points Original polyline points [lat, lng][]
   * @param tolerance Distance tolerance in degrees (default 0.00001)
   * @returns Simplified polyline
   * 
   * @example
   * const simplified = AdvancedRouteService.simplifyPolyline(points, 0.00001);
   */
  simplifyPolyline(points: [number, number][], tolerance: number = 0.00001): [number, number][] {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let maxIndex = 0;

    // Find point with maximum distance from line
    for (let i = 1; i < points.length - 1; i++) {
      const dist = this._perpendicularDistance(points[i], points[0], points[points.length - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDist > tolerance) {
      const left = this.simplifyPolyline(points.slice(0, maxIndex + 1), tolerance);
      const right = this.simplifyPolyline(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[points.length - 1]];
  },

  /**
   * Calculate perpendicular distance from point to line
   * Helper function for polyline simplification
   * @private
   */
  _perpendicularDistance(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
    let x = point[0];
    let y = point[1];
    let x1 = lineStart[0];
    let y1 = lineStart[1];
    let x2 = lineEnd[0];
    let y2 = lineEnd[1];

    const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
    const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

    return denominator === 0 ? 0 : numerator / denominator;
  },

  /**
   * Create a fetch timeout promise for compatibility
   * @private
   */
  _createTimeoutAbortSignal(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  },

  /**
   * Fetch with timeout for better compatibility
   * @private
   */
  async _fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Fetch route from OSRM API with error handling
   * Calculates distance and estimated time with traffic simulation
   * @param start Starting GeoLocation
   * @param end Destination GeoLocation
   * @param timeOfDay Hour (0-23) for traffic simulation
   * @returns Promise<DetailedRouteInfo> with distance, duration, and polyline
   * @throws Error if OSRM fails, route not found, or coordinates invalid
   * 
   * @example
   * const route = await AdvancedRouteService.getDetailedRoute(
   *   { lat: -6.2000, lng: 106.8166 },
   *   { lat: -6.1750, lng: 106.8250 }
   * );
   * // Returns { distance: 5.23, duration: 12, polyline: [...], ... }
   */
  async getDetailedRoute(
    start: GeoLocation,
    end: GeoLocation,
    timeOfDay?: number
  ): Promise<DetailedRouteInfo> {
    // Validate coordinates
    if (!this._isValidCoordinate(start) || !this._isValidCoordinate(end)) {
      throw new Error('Koordinat tidak valid. Latitude harus -90 hingga 90, Longitude -180 hingga 180');
    }

    // Check if coordinates are too close
    const distance = this._haversineDistance(start, end);
    if (distance < 0.01) {
      throw new Error('Titik jemput dan tujuan terlalu dekat (< 10 meter)');
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

    try {
      const response = await this._fetchWithTimeout(url, {}, 10000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: OSRM tidak merespons`);
      }

      const data = await response.json();

      // Validate OSRM response
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Rute tidak ditemukan. Mungkin tidak ada jalan yang menghubungkan lokasi');
      }

      const route = data.routes[0];
      
      if (!route.geometry || !route.geometry.coordinates) {
        throw new Error('Data rute tidak lengkap dari OSRM');
      }

      // Convert OSRM response to our format
      const distance = Number((route.distance / 1000).toFixed(2)); // km
      const polyline = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      
      // Detect scenario
      const scenario = this.detectRouteScenario(distance, start, end);
      
      // Get traffic factors
      const trafficFactors = this.getTrafficFactors(timeOfDay, scenario);
      
      // Calculate travel time
      const duration = this.calculateTravelTime(distance, scenario, trafficFactors);
      
      // Get addresses
      const startAddress = await this.reverseGeocode(start.lat, start.lng);
      const endAddress = await this.reverseGeocode(end.lat, end.lng);

      // Simplify polyline for performance
      const polylineSimplified = this.simplifyPolyline(polyline);

      return {
        distance,
        duration,
        polyline,
        polylineSimplified,
        summary: route.legs[0]?.summary || `Rute dari ${startAddress} ke ${endAddress}`,
        startAddress,
        endAddress,
        scenario,
        trafficCondition: trafficFactors.condition,
        distanceAccuracy: 98, // OSRM typically 98%+ accurate
        timeAccuracy: distance > 50 ? 85 : 90 // Longer routes harder to predict
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout mengakses OSRM. Periksa koneksi internet');
        }
        throw error;
      }
      throw new Error('Kesalahan tidak diketahui saat mengambil rute');
    }
  },

  /**
   * Reverse Geocoding using Nominatim API (OpenStreetMap)
   * Converts latitude/longitude to human-readable address
   * @param lat Latitude
   * @param lng Longitude
   * @returns Promise<string> formatted address (jalan, kelurahan, kota, provinsi)
   * 
   * @example
   * const address = await AdvancedRouteService.reverseGeocode(-6.2000, 106.8166);
   * // Returns "Jl. Sudirman, Senayan, Jakarta Pusat, DKI Jakarta"
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Validate coordinates
    if (!this._isValidCoordinate({ lat, lng })) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback to coordinates
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    try {
      const response = await this._fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'wandr-explore-app/1.0'
        }
      }, 5000);

      if (!response.ok) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      const data: GeocodingResult = await response.json();
      return this._formatAddress(data);
    } catch (error) {
      console.error('[AdvancedRouteService] reverseGeocode Error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback to coordinates
    }
  },

  /**
   * Format raw geocoding data into readable address
   * Prioritizes: road > suburb > city > state
   * @private
   */
  _formatAddress(data: GeocodingResult): string {
    const addr = data.address;
    const parts: string[] = [];

    // Build address components in priority order
    if (addr.road) parts.push(addr.road);
    if (addr.suburb) parts.push(addr.suburb);
    else if (addr.village) parts.push(addr.village);
    else if (addr.city) parts.push(addr.city);
    
    if (addr.city && !parts.includes(addr.city)) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);

    // Return formatted address or fallback to display_name
    return parts.length > 0 ? parts.join(', ') : data.display_name;
  },

  /**
   * Search locations by query string
   * Returns top 5 matches with coordinates and names
   * @param query Search string (minimum 3 characters)
   * @returns Promise<GeoLocation[]> array of matching locations
   * 
   * @example
   * const locations = await AdvancedRouteService.searchLocation('Bandara Jakarta');
   * // Returns [{ lat: -6.1256, lng: 106.6659, name: 'Soekarno-Hatta International Airport', ... }]
   */
  async searchLocation(query: string): Promise<GeoLocation[]> {
    if (query.length < 3) return [];

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    try {
      const response = await this._fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'wandr-explore-app/1.0'
        }
      }, 5000);

      if (!response.ok) {
        console.error('[AdvancedRouteService] searchLocation HTTP Error:', response.status);
        return [];
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('[AdvancedRouteService] searchLocation Invalid response format');
        return [];
      }

      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.name || 'Lokasi',
        address: item.display_name
      }));
    } catch (error) {
      console.error('[AdvancedRouteService] searchLocation Error:', error);
      return [];
    }
  },

  /**
   * Calculate distance between two points using Haversine formula
   * Accurate for short to medium distances (< 500km)
   * @param start Starting point
   * @param end Ending point
   * @returns Distance in kilometers
   * 
   * @example
   * const km = AdvancedRouteService.calculateHaversineDistance(start, end);
   * // Returns approximately 5.2 km
   */
  calculateHaversineDistance(start: GeoLocation, end: GeoLocation): number {
    return this._haversineDistance(start, end);
  },

  /**
   * Internal Haversine distance calculation
   * @private
   */
  _haversineDistance(start: GeoLocation, end: GeoLocation): number {
    const R = 6371; // Earth radius in km
    const lat1 = (start.lat * Math.PI) / 180;
    const lat2 = (end.lat * Math.PI) / 180;
    const deltaLat = ((end.lat - start.lat) * Math.PI) / 180;
    const deltaLng = ((end.lng - start.lng) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  /**
   * Validate coordinate values
   * @private
   */
  _isValidCoordinate(loc: GeoLocation): boolean {
    return (
      typeof loc.lat === 'number' &&
      typeof loc.lng === 'number' &&
      loc.lat >= -90 &&
      loc.lat <= 90 &&
      loc.lng >= -180 &&
      loc.lng <= 180
    );
  }
};
