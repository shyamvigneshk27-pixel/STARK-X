import { create } from 'zustand';
import { Trip } from '../types';

interface TripState {
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
}

const useTripStore = create<TripState>((set) => ({
  currentTrip: null,
  setCurrentTrip: (trip) => set({ currentTrip: trip })
}));

export default useTripStore;
