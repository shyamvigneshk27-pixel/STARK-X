import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  try {
    return format(typeof date === 'string' ? new Date(date) : date, fmt);
  } catch {
    return 'Invalid date';
  }
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function getDurationLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function getCostLabel(costIndex: number): string {
  if (costIndex <= 1.5) return 'Budget';
  if (costIndex <= 2.5) return 'Mid-range';
  return 'Premium';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTripStatus(startDate: string, endDate: string, hasStops: boolean): 'upcoming' | 'active' | 'past' | 'draft' {
  if (!hasStops) return 'draft';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'active';
}

export function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'from-violet-600 to-indigo-600',
    'from-blue-600 to-cyan-500',
    'from-emerald-600 to-teal-500',
    'from-orange-600 to-amber-500',
    'from-pink-600 to-rose-500',
    'from-purple-600 to-pink-500',
    'from-cyan-600 to-blue-500',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
