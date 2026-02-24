export type AvailabilityDay = 'M' | 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su';

export interface BookableUnit {
  id: string;
  name: string;
  price: number;
  currency: string;
  activeDays: AvailabilityDay[];
  instantBooking: boolean;
  type: 'activity' | 'spa' | 'rental';
  imageUrl?: string;
  duration?: string;
}

export interface ExperienceDetails {
  id: string;
  title: string;
  category: string; // Breadcrumb category
  status: 'Active' | 'Draft' | 'Archived';
  units: BookableUnit[];
  source?: string; // Availability source (e.g., 'bored.', 'Turneo')
}

export type TabOption = 'general' | 'units' | 'media' | 'calendar' | 'settings';

export interface Review {
  id: string;
  experienceTitle: string;
  rating: number; // 1-5
  author: string;
  date: string;
  text: string;
  status: 'Published' | 'Pending' | 'Archived';
  imageUrl: string;
  location: string;
}

export interface Booking {
  id: string;
  experienceName: string;
  date: string;
  time: string;
  price: number;
  currency: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  subItems?: string[];
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
}

export interface CalendarBooking {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;
  resourceId: string;
  date: string; // YYYY-MM-DD
  utilizationHours?: string; // e.g., "2/8h"
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface BookingItem {
  id: string;
  experienceName: string;
  category: string;
  guestName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  currency: string;
  guests: number;
  imageUrl?: string;
}

export interface EarningsData {
  period: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}