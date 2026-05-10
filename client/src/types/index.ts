export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  language?: string;
  isAdmin: boolean;
  createdAt?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  costIndex: number;
  popularity: number;
  lat: number;
  lng: number;
  imageUrl?: string | null;
}

export interface Activity {
  id: string;
  stopId: string;
  name: string;
  type: string;
  estimatedCost: number;
  durationHrs: number;
  startTime?: string | null;
  notes?: string | null;
  isBooked?: boolean;
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  city: City;
  arrivalDate: string | Date;
  departureDate: string | Date;
  order: number;
  activities: Activity[];
}

export interface Note {
  id: string;
  tripId: string;
  content: string;
  stopId?: string | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  label: string;
  isPacked: boolean;
  category: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  coverPhoto?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  totalBudget: number;
  isPublic: boolean;
  shareId?: string;
  createdAt: string;
  updatedAt: string;
  stops?: Stop[];
  notes?: Note[];
  checklist?: ChecklistItem[];
}
