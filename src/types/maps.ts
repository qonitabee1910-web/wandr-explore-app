export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
  polyline: [number, number][]; // [lat, lng]
  summary: string;
}

export interface GeocodingResult {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    village?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}
