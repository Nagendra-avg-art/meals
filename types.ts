export type ViewState = 'landing' | 'login' | 'donor' | 'donor-dashboard' | 'receiver' | 'bookings';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  isVerified?: boolean;
}

export interface Donation {
  id: string;
  userId: string;
  donorName: string;
  foodItems: string;
  servings: number;
  location: string;
  phoneNumber: string;
  timestamp: string;
  status: 'available' | 'claimed' | 'cancelled' | 'completed' | 'expired';
  distance: string;
  claimedByUserId?: string;
  createdAt: number;
  expiresAt: number;
}

export interface NotificationItem {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'neutral';
}

export interface ContactModalState {
  type: 'phone';
  value: string;
}