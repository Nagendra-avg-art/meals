import { Donation, User } from './types';

// Helper to set future expiry
const hoursFromNow = (h: number) => Date.now() + h * 60 * 60 * 1000;

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'd1',
    userId: 'user-donor-1',
    donorName: 'Fresh Bakery',
    foodItems: 'Assorted Pastries & Bread',
    servings: 15,
    location: '42 Market St, Downtown',
    phoneNumber: '555-0123',
    timestamp: '09:30 AM',
    status: 'available',
    distance: '0.8 km',
    createdAt: Date.now() - 3600000,
    expiresAt: hoursFromNow(2) // Expires in 2 hours
  },
  {
    id: 'd2',
    userId: 'user-donor-2',
    donorName: 'Grand Hotel',
    foodItems: 'Rice, Curry, and Vegetables',
    servings: 50,
    location: '10 Park Avenue',
    phoneNumber: '555-0199',
    timestamp: '11:15 AM',
    status: 'available',
    distance: '2.3 km',
    createdAt: Date.now() - 1800000,
    expiresAt: hoursFromNow(4) // Expires in 4 hours
  },
  {
    id: 'd3',
    userId: 'user-donor-1',
    donorName: 'Fresh Bakery',
    foodItems: 'Yesterday\'s Bagels',
    servings: 10,
    location: '42 Market St, Downtown',
    phoneNumber: '555-0123',
    timestamp: 'Yesterday',
    status: 'claimed',
    distance: '0.8 km',
    claimedByUserId: 'user-demo-1',
    createdAt: Date.now() - 86400000,
    expiresAt: Date.now() - 4000000 // Already expired
  },
  {
    id: 'd4',
    userId: 'user-donor-2',
    donorName: 'Suburban Catering',
    foodItems: 'Leftover Event Catering',
    servings: 100,
    location: 'North Hills Community Center',
    phoneNumber: '555-9876',
    timestamp: '12:00 PM',
    status: 'available',
    distance: '18.5 km',
    createdAt: Date.now() - 600000,
    expiresAt: hoursFromNow(5) // Expires in 5 hours
  }
];

export const INITIAL_USERS: User[] = [
  { 
    id: 'user-demo-1', 
    name: 'Demo Receiver', 
    phone: '1234567890', 
    password: '123',
    isVerified: true
  },
  { 
    id: 'user-donor-1', 
    name: 'Fresh Bakery Owner', 
    phone: '5550123456', 
    password: '123',
    isVerified: true
  }
];