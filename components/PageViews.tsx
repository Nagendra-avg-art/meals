import React, { useState } from 'react';
import { 
  Heart, Utensils, Lock, AlertCircle, Phone, ArrowRight, Users, 
  MapPin, Clock, Navigation, Calendar, MessageCircle, ChevronRight, CheckCircle, Plus, XCircle, UserCheck
} from 'lucide-react';
import { Button, Card, Badge } from './Common';
import { User, Donation, ViewState, ContactModalState } from '../types';

// --- Landing Page ---
interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
  handleAuthRequired: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ handleAuthRequired }) => (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="relative bg-green-50 overflow-hidden flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-green-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Stop Food Waste,</span>{' '}
                  <span className="block text-green-600 xl:inline">Feed a Soul.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Connect surplus food from weddings, hotels, and homes with orphanages and people in need. A simple bridge between abundance and hunger.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button onClick={() => handleAuthRequired('donor-dashboard')} className="w-full sm:w-auto h-12 text-lg">
                    I want to Donate <Heart className="ml-2 h-5 w-5" />
                  </Button>
                  <Button onClick={() => handleAuthRequired('receiver')} variant="secondary" className="w-full sm:w-auto h-12 text-lg">
                    I need Food <Utensils className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-200 flex items-center justify-center min-h-[400px]">
            <div className="text-center p-8">
                <div className="inline-block p-8 bg-white rounded-full shadow-2xl mb-4">
                    <Heart className="w-32 h-32 text-red-500 fill-current animate-pulse" />
                </div>
                <p className="text-gray-500 font-medium">Connecting 100+ Donors & Receivers</p>
            </div>
        </div>
      </div>
    </div>
);

// --- Login Page ---
interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  onRegisterUser: (user: User) => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, users = [], onRegisterUser, onCancel }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSignUp) {
            const existingUser = users.find(u => u.phone === phoneNumber);
            if (existingUser) {
                setError("This phone number is already registered. Please sign in.");
                return;
            }
            const newUser: User = { 
                id: `user-${Date.now()}`,
                name, 
                phone: phoneNumber, 
                password 
            };
            onRegisterUser(newUser);
        } else {
            const user = users.find(u => u.phone === phoneNumber && u.password === password);
            if (user) {
                onLoginSuccess(user);
            } else {
                setError("Invalid phone number or password. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isSignUp ? "Join using your mobile number." : "Sign in to manage donations and bookings."}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="bg-white text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                className="bg-white text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder="9876543210"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="bg-white text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full h-12">
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </div>
                </form>
                
                <div className="flex flex-col gap-4 text-center mt-4">
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                    
                    <button 
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Donor Form ---
interface DonorFormProps {
  currentUser: User | null;
  onAddDonation: (donation: Donation) => void;
  onCancel: () => void;
}

export const DonorForm: React.FC<DonorFormProps> = ({ currentUser, onAddDonation, onCancel }) => {
    const [formData, setFormData] = useState({
      donorName: currentUser ? currentUser.name : '',
      phoneNumber: currentUser ? currentUser.phone : '',
      foodItems: '',
      servings: '',
      location: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!currentUser) return;

      const { servings, ...rest } = formData;
      const newDonation: Donation = {
        id: Date.now(),
        userId: currentUser.id,
        ...rest,
        timestamp: "Just now",
        status: "available",
        distance: "0.5 km",
        servings: Number(servings) || 0
      };
      onAddDonation(newDonation);
    };

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button onClick={onCancel} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center">
          ← Back
        </button>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Donate Food</h2>
          <p className="text-gray-500 mt-2">Fill in the details so nearby receivers can find you.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name / Organization</label>
                <input 
                    required
                    type="text" 
                    placeholder="e.g. Hotel Grand"
                    className="bg-white text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                    value={formData.donorName}
                    onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                        required
                        type="tel" 
                        placeholder="e.g. 9876543210"
                        className="bg-white text-gray-900 w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Items Description</label>
              <textarea 
                required
                rows={3}
                placeholder="e.g. 5kg Rice, 2kg Dal, 20 Roti"
                className="bg-white text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                value={formData.foodItems}
                onChange={(e) => setFormData({...formData, foodItems: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servings (People)</label>
                <div className="relative">
                    <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                        required
                        type="number" 
                        placeholder="e.g. 20"
                        className="bg-white text-gray-900 w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                        value={formData.servings}
                        onChange={(e) => setFormData({...formData, servings: e.target.value})}
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                        required
                        type="text" 
                        placeholder="Address or Landmark"
                        className="bg-white text-gray-900 w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-lg">
                Post Donation <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
};

// --- Donor Dashboard ---
interface DonorDashboardProps {
  donations: Donation[];
  currentUser: User | null;
  onNewDonationClick: () => void;
  onCancelDonation: (id: number) => void;
  onCompleteDonation: (id: number) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ donations, currentUser, onNewDonationClick, onCancelDonation, onCompleteDonation }) => {
    // FILTER: Only show donations created by the current user
    const myDonations = donations.filter(d => d.userId === currentUser?.id);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Donations</h2>
                    <p className="text-gray-500">Manage your active food listings.</p>
                </div>
                <Button onClick={onNewDonationClick} className="shadow-lg">
                    <Plus className="h-5 w-5" /> New Donation
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {myDonations.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No donations yet. Click "New Donation" to start.
                        </div>
                    )}
                    {myDonations.map((item) => (
                        <li key={item.id} className="p-6 hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-1">
                                        <h3 className={`text-lg font-medium mr-3 ${item.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.foodItems}</h3>
                                        <Badge type={item.status === 'available' ? 'success' : item.status === 'claimed' ? 'blue' : item.status === 'completed' ? 'neutral' : 'warning'}>
                                            {item.status === 'available' ? 'Active' : item.status === 'claimed' ? 'Reserved' : item.status === 'completed' ? 'Picked Up' : 'Cancelled'}
                                        </Badge>
                                    </div>
                                    <div className="flex text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center"><Users className="h-4 w-4 mr-1"/> {item.servings} servings</span>
                                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1"/> {item.timestamp}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {item.status === 'available' ? (
                                        <button 
                                            onClick={() => onCancelDonation(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    ) : item.status === 'claimed' ? (
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-blue-600 font-medium">Waiting for pickup</span>
                                            <Button variant="outline" className="text-xs h-8" onClick={() => onCompleteDonation(item.id)}>
                                                Confirm Pickup
                                            </Button>
                                        </div>
                                    ) : item.status === 'completed' ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-5 w-5 mr-1" /> Picked up
                                        </div>
                                    ) : (
                                         <div className="flex items-center text-gray-400 text-sm">
                                            <XCircle className="h-5 w-5 mr-1" /> Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- Receiver Dashboard ---
interface ReceiverDashboardProps {
  donations: Donation[];
  onClaim: (id: number) => void;
  onNavigateToBookings: () => void;
  onOpenMap: (address: string) => void;
}

export const ReceiverDashboard: React.FC<ReceiverDashboardProps> = ({ donations, onClaim, onNavigateToBookings, onOpenMap }) => {
    const activeDonations = donations.filter(d => d.status === 'available');

    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Available Food</h2>
            <p className="text-gray-500 mt-1">Find donations near you and claim them.</p>
          </div>
          <Button variant="outline" onClick={onNavigateToBookings} className="hidden sm:flex">
             View My Bookings <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDonations.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl">
                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No food currently available</h3>
                <p className="text-gray-500">Please check back later.</p>
            </div>
          ) : (
            activeDonations.map((donation) => (
              <Card key={donation.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{donation.donorName}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" /> {donation.timestamp}
                    </div>
                  </div>
                  <Badge type="success">Available</Badge>
                </div>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-start gap-2">
                    <Utensils className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-700">{donation.foodItems}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-700">Feeds <span className="font-bold">{donation.servings}</span> people</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-700 text-sm">{donation.location} <span className="text-gray-400">({donation.distance})</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                   <Button variant="outline" onClick={() => onOpenMap(donation.location)} className="w-full text-sm">
                     <Navigation className="h-4 w-4" /> Map
                   </Button>
                   <Button onClick={() => onClaim(donation.id)} className="w-full text-sm">
                     Claim
                   </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
};

// --- Receiver Bookings ---
interface ReceiverBookingsProps {
  donations: Donation[];
  currentUser: User | null;
  onFindMore: () => void;
  onOpenMap: (address: string) => void;
  onContact: (type: 'phone', value: string) => void;
  onCompleteDonation: (id: number) => void;
}

export const ReceiverBookings: React.FC<ReceiverBookingsProps> = ({ donations, currentUser, onFindMore, onOpenMap, onContact, onCompleteDonation }) => {
    // FILTER: Only show bookings claimed by the current user
    const myBookings = donations.filter(d => d.claimedByUserId === currentUser?.id);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
                    <p className="text-gray-500 mt-1">Food you have reserved. Contact donors for pickup.</p>
                </div>
                <Button variant="secondary" onClick={onFindMore}>
                    Find More Food
                </Button>
            </div>

            {myBookings.length === 0 ? (
                 <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No active bookings</h3>
                    <p className="text-gray-500 mb-6">You haven't claimed any food donations yet.</p>
                    <Button onClick={onFindMore}>Browse Donations</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myBookings.map(item => (
                        <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 ${item.status === 'completed' ? 'border-gray-200' : 'border-l-4 border-l-green-500'}`}>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{item.donorName}</h3>
                                    <Badge type={item.status === 'completed' ? 'neutral' : 'blue'}>
                                        {item.status === 'completed' ? 'Picked Up' : 'Reserved'}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 font-medium mb-4">{item.foodItems}</p>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" /> {item.servings} servings
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> {item.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> {item.phoneNumber}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                {item.status === 'claimed' && (
                                    <>
                                        <Button 
                                            onClick={() => onCompleteDonation(item.id)}
                                            className="w-full text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4" /> I took the food
                                        </Button>
                                    </>
                                )}
                                
                                <Button variant="outline" onClick={() => onOpenMap(item.location)} className="w-full text-xs sm:text-sm">
                                    <Navigation className="h-4 w-4" /> Navigate
                                </Button>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => onContact('phone', item.phoneNumber)}
                                        className="flex-1 text-xs sm:text-sm bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                        <Phone className="h-4 w-4" /> Call
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        href={`https://wa.me/${item.phoneNumber}`}
                                        className="flex-1 text-xs sm:text-sm bg-green-50 text-green-700 border-green-200"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};