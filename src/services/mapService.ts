import { GeoLocation, RouteInfo, GeocodingResult } from "@/types/maps";

/**
 * MapService handles routing (OSRM), geocoding (Nominatim), and distance/time calculations.
 */
export const MapService = {
  /**
   * Fetch route from OSRM API (Dijkstra/A* based actual road routing)
   * @param start Starting GeoLocation
   * @param end Destination GeoLocation
   * @returns Promise<RouteInfo>
   */
  async getRoute(start: GeoLocation, end: GeoLocation): Promise<RouteInfo> {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil rute dari OSRM");
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes[0]) {
        throw new Error("Rute tidak ditemukan untuk lokasi tersebut");
      }

      const route = data.routes[0];
      const distance = route.distance / 1000; // convert to km
      
      // Speed factors based on road conditions (simulated real-time)
      const avgSpeed = 40; // Default 40km/h
      const trafficFactor = 1.2; // 20% slower due to traffic
      const duration = (distance / avgSpeed) * 60 * trafficFactor;

      return {
        distance: Number(distance.toFixed(2)),
        duration: Math.ceil(duration),
        polyline: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]),
        summary: route.legs[0].summary || "Rute tercepat"
      };
    } catch (error) {
      console.error("[MapService] getRoute Error:", error);
      throw error;
    }
  },

  /**
   * Reverse Geocoding using Nominatim (OSM)
   * @param lat Latitude
   * @param lng Longitude
   * @returns Promise<string> formatted address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Traveloka-Clone-Demo-App'
        }
      });
      if (!response.ok) throw new Error("Gagal melakukan geocoding");
      
      const data: GeocodingResult = await response.json();
      
      // Build readable address: Road, Suburb/City, State
      const addr = data.address;
      const parts = [
        addr.road,
        addr.suburb || addr.city,
        addr.state
      ].filter(Boolean);

      return parts.join(', ') || data.display_name;
    } catch (error) {
      console.error("[MapService] reverseGeocode Error:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // fallback to coordinates
    }
  },

  /**
   * Search location by query
   * @param query Search string
   * @returns Promise<GeoLocation[]>
   */
  async searchLocation(query: string): Promise<GeoLocation[]> {
    if (query.length < 3) return [];
    
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Traveloka-Clone-Demo-App'
        }
      });
      const data = await response.json();
      
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.name,
        address: item.display_name
      }));
    } catch (error) {
      console.error("[MapService] searchLocation Error:", error);
      return [];
    }
  }
};
