export interface Ride {
  id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
  image: string;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  validUntil: string;
  code: string;
  image: string;
  terms: string[];
}

export interface Booking {
  id: string;
  type: 'hotel' | 'shuttle' | 'ride';
  name: string;
  date: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
  total: number;
  guests: number;
}
