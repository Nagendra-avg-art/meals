export type ViewState = 'landing' | 'login' | 'donor' | 'donor-dashboard' | 'receiver' | 'bookings';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
}

export interface Donation {
  id: number;
  userId: string;
  donorName: string;
  foodItems: string;
  servings: number;
  location: string;
  phoneNumber: string;
  timestamp: string;
  status: 'available' | 'claimed' | 'cancelled' | 'completed';
  distance: string;
  claimedByUserId?: string;
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