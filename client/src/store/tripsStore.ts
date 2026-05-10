import { create } from 'zustand';
import { Trip } from '../types';

interface TripsState {
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
}

export const useTripsStore = create<TripsState>((set) => ({
  trips: [],
  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  updateTrip: (id, data) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTrip: (id) =>
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
    })),
}));
