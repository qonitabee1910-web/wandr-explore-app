import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoLocation, RouteInfo } from '@/types/maps';
import { MapService } from '@/services/mapService';
import { AdvancedRouteService, DetailedRouteInfo } from '@/services/advancedRouteService';
import { AlertCircle } from 'lucide-react';

// Fix Leaflet marker icons for Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom icons for start and end markers
const StartIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAzMiA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI2IiBmaWxsPSIjMDAwMDAwIi8+PHBhdGggZD0iTTE2IDQxQzYgMzAgMCAyMCAwIDEwQzAgNC40NzcgNy4xNjMgMCAxNiAwQzI0LjgzNyAwIDMyIDQuNDc3IDMyIDEwQzMyIDIwIDI2IDMwIDE2IDQxWiIgZmlsbD0iIzAwN0NFRSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    shadowUrl: iconShadow,
});

const EndIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAzMiA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI2IiBmaWxsPSIjZmZmZmZmIi8+PHBhdGggZD0iTTE2IDQxQzYgMzAgMCAyMCAwIDEwQzAgNC40NzcgNy4xNjMgMCAxNiAwQzI0LjgzNyAwIDMyIDQuNDc3IDMyIDEwQzMyIDIwIDI2IDMwIDE2IDQxWiIgZmlsbD0iI0UyNDMyQiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  pickup: GeoLocation | null;
  destination: GeoLocation | null;
  onRouteUpdate?: (route: RouteInfo | DetailedRouteInfo) => void;
  className?: string;
  useAdvanced?: boolean; // If true, uses AdvancedRouteService instead of MapService
}

// Internal component to handle map movement/fitting
const MapController: React.FC<{ pickup: GeoLocation | null; destination: GeoLocation | null }> = ({ pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 15);
    }
  }, [pickup, destination, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ 
  pickup, 
  destination, 
  onRouteUpdate, 
  className = "h-[300px] w-full",
  useAdvanced = true 
}) => {
  const [route, setRoute] = useState<RouteInfo | DetailedRouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (pickup && destination) {
        setLoading(true);
        setError(null);
        try {
          let routeInfo: RouteInfo | DetailedRouteInfo;
          
          if (useAdvanced) {
            try {
              routeInfo = await AdvancedRouteService.getDetailedRoute(pickup, destination);
            } catch (advError) {
              console.error("Advanced route fetch failed, falling back to basic:", advError);
              // Fallback to basic service
              routeInfo = await MapService.getRoute(pickup, destination);
            }
          } else {
            routeInfo = await MapService.getRoute(pickup, destination);
          }
          
          setRoute(routeInfo);
          if (onRouteUpdate) onRouteUpdate(routeInfo);
        } catch (error) {
          console.error("MapView Route Error:", error);
          setError(error instanceof Error ? error.message : 'Gagal mengambil rute');
          setRoute(null);
        } finally {
          setLoading(false);
        }
      } else {
        setRoute(null);
        setError(null);
      }
    };

    fetchRoute();
  }, [pickup, destination, onRouteUpdate, useAdvanced]);

  const defaultCenter: [number, number] = [-6.2000, 106.8166]; // Jakarta
  const isDetailedRoute = (route: any): route is DetailedRouteInfo => 'scenario' in route;

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-inner ${className} bg-muted`}>
      <MapContainer 
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter} 
        zoom={13} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ZoomControl position="bottomright" />
        
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={StartIcon}>
            {/* Popup with address */}
          </Marker>
        )}
        
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={EndIcon} />
        )}
        
        {route && 'polyline' in route && route.polyline.length > 0 && (
          <Polyline 
            positions={route.polyline} 
            color={isDetailedRoute(route) ? getPolylineColor(route.trafficCondition) : "#007CEE"}
            weight={5} 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        <MapController pickup={pickup} destination={destination} />
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="bg-background/80 px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Menghitung Rute...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {route && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-border space-y-2">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Jarak</p>
                <p className="text-sm font-black text-primary">{route.distance} km</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Waktu</p>
                <p className="text-sm font-black text-primary">{route.duration} mnt</p>
              </div>
            </div>
            
            {isDetailedRoute(route) && (
              <>
                <div className="w-full h-px bg-border" />
                <div className="text-[10px] space-y-1">
                  {route.startAddress && (
                    <p className="text-muted-foreground">
                      <span className="font-bold">Dari:</span> {route.startAddress.substring(0, 40)}...
                    </p>
                  )}
                  {route.endAddress && (
                    <p className="text-muted-foreground">
                      <span className="font-bold">Ke:</span> {route.endAddress.substring(0, 40)}...
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    <span className="font-bold">Kondisi:</span> {getTrafficLabel(route.trafficCondition)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Get polyline color based on traffic condition
 */
function getPolylineColor(condition: string): string {
  const colors: Record<string, string> = {
    'light': '#28a745',      // Green
    'moderate': '#ffc107',    // Yellow
    'heavy': '#fd7e14',       // Orange
    'congested': '#dc3545'    // Red
  };
  return colors[condition] || '#007CEE';
}

/**
 * Get human-readable traffic label
 */
function getTrafficLabel(condition: string): string {
  const labels: Record<string, string> = {
    'light': 'Lancar',
    'moderate': 'Sedang',
    'heavy': 'Padat',
    'congested': 'Sangat Padat'
  };
  return labels[condition] || condition;
}
