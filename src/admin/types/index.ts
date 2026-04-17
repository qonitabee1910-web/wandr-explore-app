/**
 * Admin Dashboard Types
 * Comprehensive type definitions for all admin modules
 */

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DashboardStats {
  totalRides: number;
  totalShuttles: number;
  totalDrivers: number;
  activeUsers: number;
  totalRevenue: number;
  completedRides: number;
  pendingApprovals: number;
  canceledRides: number;
}

export interface AnalyticsData {
  date: string;
  rides: number;
  revenue: number;
  users: number;
  shuttles: number;
}

export interface DashboardChartData {
  label: string;
  value: number;
  percentage?: number;
}

// ============================================================================
// DRIVER MANAGEMENT
// ============================================================================

export interface Driver {
  id: string;
  user_id: string;
  full_name: string;
  name: string; // Keep for backward compatibility if needed
  email: string;
  phone: string;
  avatar_url?: string;
  national_id: string;
  license_number: string;
  license_expiry: string;
  vehicle_type: 'ride' | 'shuttle';
  status: 'pending' | 'active' | 'approved' | 'rejected' | 'suspended';
  approval_date?: string;
  approved_by?: string;
  documents: DriverDocument[];
  rating: number;
  total_rides: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: 'license' | 'insurance' | 'inspection' | 'background_check';
  document_url: string;
  verified: boolean;
  expiry_date?: string;
  uploaded_at: string;
}

export interface DriverApprovalRequest {
  driver_id: string;
  approved: boolean;
  rejection_reason?: string;
  approval_notes?: string;
}

// ============================================================================
// RIDE MONITORING
// ============================================================================

export interface Ride {
  id: string;
  driver_id: string;
  passenger_id: string;
  user_id: string; // Keep for backward compatibility
  pickup_location: Location;
  dropoff_location: Location;
  status: 'requested' | 'accepted' | 'started' | 'in_progress' | 'completed' | 'cancelled' | 'canceled';
  ride_type: 'regular' | 'shared';
  total_fare: number;
  fare: number; // Keep for backward compatibility
  distance: number;
  duration: number; // in seconds
  passenger_rating?: number;
  driver_rating?: number;
  rating?: number; // Keep for backward compatibility
  feedback?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  canceled_at?: string; // Keep for backward compatibility
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RideTracking {
  ride_id: string;
  driver_location: Location;
  driver_name: string;
  driver_rating: number;
  vehicle_info: string;
  estimated_arrival: number; // in seconds
  distance_to_destination: number; // in km
  updated_at: string;
}

export interface RideMetrics {
  totalRides: number;
  completedRides: number;
  canceledRides: number;
  averageRating: number;
  averageFare: number;
  peakHours: string[];
}

// ============================================================================
// SHUTTLE MANAGEMENT
// ============================================================================

export interface Shuttle {
  id: string;
  name: string;
  license_plate: string;
  capacity: number;
  current_occupancy: number;
  vehicle_type: string;
  status: 'active' | 'maintenance' | 'inactive';
  driver_id?: string;
  current_location?: Location;
  route_id?: string;
  next_stop?: string;
  created_at: string;
  updated_at: string;
}

export interface ShuttleRoute {
  id: string;
  name: string;
  start_point: Location;
  end_point: Location;
  stops: Stop[];
  estimated_duration: number; // in minutes
  distance: number; // in km
  frequency: string; // e.g., "every 30 minutes"
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  sequence: number;
  location: Location;
  name: string;
  wait_time: number; // in seconds
}

export interface ShuttleSchedule {
  id: string;
  shuttle_id: string;
  route_id: string;
  departure_time: string; // HH:mm format
  arrival_time: string; // HH:mm format
  days_of_week: string[]; // ['Monday', 'Tuesday', ...]
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ShuttleBooking {
  id: string;
  user_id: string;
  shuttle_id: string;
  route_id: string;
  schedule_id: string;
  seat_number: number;
  boarding_point: string;
  alighting_point: string;
  status: 'booked' | 'completed' | 'canceled';
  fare: number;
  booking_date: string;
  travel_date: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRICING CONTROL
// ============================================================================

export interface PricingRule {
  id: string;
  rule_type: 'base_fare' | 'distance_rate' | 'time_rate' | 'surge' | 'promo';
  name: string;
  description?: string;
  service_type: 'ride' | 'shuttle';
  value: number;
  condition?: PricingCondition;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PricingCondition {
  type: 'time' | 'distance' | 'location' | 'weather' | 'demand';
  operator: '>' | '<' | '=' | '>=' | '<=' | 'between';
  value: number | string;
  min?: number;
  max?: number;
}

export interface SurgeMultiplier {
  id: string;
  location_id?: string;
  time_start: string; // HH:mm
  time_end: string; // HH:mm
  multiplier: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FareEstimate {
  distance: number;
  duration: number;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  surge_multiplier: number;
  total_fare: number;
  currency: string;
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface PaymentGatewaySetting {
  id: string;
  gateway_name: string; // 'stripe', 'paypal', 'local'
  api_key: string;
  secret_key: string;
  webhook_url: string;
  active: boolean;
  commission_percentage: number;
  settlement_frequency: string; // 'daily', 'weekly', 'monthly'
  created_at: string;
  updated_at: string;
}

export interface EmailSetting {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  tls_enabled: boolean;
  test_email?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: 'ride_accepted' | 'ride_completed' | 'driver_approved' | 'promo_available' | 'payment_receipt';
  subject: string;
  body: string;
  variables: string[]; // Template variables like {{driver_name}}, {{fare}}
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  id: string;
  app_name: string;
  app_version: string;
  maintenance_mode: boolean;
  max_ride_distance: number;
  min_ride_distance: number;
  max_surge_multiplier: number;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROMO CONTROL
// ============================================================================

export interface Promo {
  id: string;
  code: string;
  name: string;
  description: string;
  promo_type: 'percentage' | 'fixed_amount' | 'free_ride';
  value: number;
  min_ride_value?: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  applicable_to: 'all' | 'new_users' | 'specific_users';
  valid_from: string;
  valid_to: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface PromoUsage {
  id: string;
  promo_id: string;
  user_id: string;
  ride_id?: string;
  discount_amount: number;
  used_at: string;
}

// ============================================================================
// ADS CONTROL
// ============================================================================

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  ad_link: string;
  placement: 'home_banner' | 'ride_screen' | 'booking_page' | 'result_page';
  ad_type: 'image' | 'video' | 'carousel';
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  valid_from: string;
  valid_to: string;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  status: 'planning' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
  target_audience: string;
  ads: Advertisement[];
  created_at: string;
  updated_at: string;
}

export interface AdMetrics {
  ad_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  cost_per_click: number;
  cost_per_conversion: number;
  date: string;
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  name: string; // Keep for backward compatibility
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  permissions: string[];
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermission[];
  description: string;
  created_at: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: string; // 'drivers', 'rides', 'shuttles', etc.
  action: 'create' | 'read' | 'update' | 'delete';
  description: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================================================
// FILTERS & SEARCH
// ============================================================================

export interface FilterOptions {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DriverFilter extends FilterOptions {
  vehicleType?: 'ride' | 'shuttle';
  approvalStatus?: string;
  rating?: number;
}

export interface RideFilter extends FilterOptions {
  status?: string;
  rideType?: string;
  minFare?: number;
  maxFare?: number;
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export interface RealtimeMessage<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  schema: string;
  table: string;
}

export interface RideUpdateEvent {
  rideId: string;
  status: Ride['status'];
  location?: Location;
  timestamp: string;
}

export interface DriverStatusEvent {
  driverId: string;
  status: Driver['status'];
  timestamp: string;
}

export interface ShuttleLocationEvent {
  shuttleId: string;
  location: Location;
  timestamp: string;
  occupancy: number;
}
