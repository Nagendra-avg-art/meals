import React, { useState, useEffect } from 'react';
import { CheckCircle, Phone, Copy, MessageCircle, Smartphone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage, LoginPage, DonorForm, DonorDashboard, ReceiverDashboard, ReceiverBookings } from './components/PageViews';
import { Button } from './components/Common';
import { ViewState, Donation, User, NotificationItem, ToastState, ContactModalState } from './types';
import { INITIAL_USERS, INITIAL_DONATIONS } from './constants';

export default function App() {
  const [view, setView] = useState<ViewState>('landing'); 
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [notification, setNotification] = useState<ToastState | null>(null); 
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([]);
  
  // Modals
  const [claimedDonation, setClaimedDonation] = useState<Donation | null>(null);
  const [contactModal, setContactModal] = useState<ContactModalState | null>(null); 
  
  // Local User State (Mock Auth)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Derived State
  const isLoggedIn = currentUser !== null;

  // --- EXPIRATION CHECKER ---
  useEffect(() => {
    const checkExpiration = () => {
      setDonations(currentDonations => {
        let hasChanges = false;
        const now = Date.now();
        const updated = currentDonations.map(d => {
          if (d.status === 'available' && d.expiresAt < now) {
             hasChanges = true;
             return { ...d, status: 'expired' as const };
          }
          return d;
        });
        return hasChanges ? updated : currentDonations;
      });
    };

    // Run immediately on mount
    checkExpiration();

    // Check for expired donations every minute
    const interval = setInterval(checkExpiration, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);
  
  const showToast = (message: string, type: 'success' | 'error' | 'neutral' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addNotificationLog = (message: string) => {
    const newNote: NotificationItem = {
        id: Date.now(),
        text: message,
        time: 'Just now',
        read: false
    };
    setNotificationHistory(prev => [newNote, ...prev]);
  };

  // --- ACTIONS ---

  const openMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const handleAuthRequired = (targetView: ViewState) => {
    if (isLoggedIn) {
      setView(targetView);
    } else {
      setView('login');
    }
  };

  const handleNewDonationClick = () => {
    if (!isLoggedIn) {
        setView('login');
        return;
    }
    setView('donor');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setView('landing');
    showToast("Logged out successfully", "neutral");
  };

  const handleAddDonation = async (newDonationData: Omit<Donation, 'id' | 'timestamp' | 'createdAt' | 'status' | 'distance' | 'userId'>) => {
    if (!currentUser) return;
    
    // Simulate random distance between 0.5 and 15.0 km
    const randomDistance = (Math.random() * 14.5 + 0.5).toFixed(1);

    const newDonation: Donation = {
        id: `local-${Date.now()}`,
        userId: currentUser.id,
        ...newDonationData, // This now includes expiresAt from DonorForm
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        status: 'available',
        distance: `${randomDistance} km`
    };

    setDonations(prev => [newDonation, ...prev]);
    addNotificationLog(`Donation Posted: ${newDonationData.foodItems}`);
    showToast("Thank you! Your donation has been listed.");
    setView('donor-dashboard');
  };

  const handleClaimDonation = async (id: string) => {
    if (!isLoggedIn) {
        setView('login');
        return;
    }
    const donation = donations.find(d => d.id === id);
    if (!donation) return;

    // Prevent donor from claiming their own food
    if (donation.userId === currentUser?.id) {
        showToast("You cannot claim your own donation.", "error");
        return;
    }

    // Check if expired (double check in case UI is stale)
    if (donation.expiresAt < Date.now()) {
        showToast("This donation has expired.", "error");
        setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'expired' } : d));
        return;
    }

    const updatedDonation = {
        ...donation,
        status: 'claimed' as const,
        claimedByUserId: currentUser?.id
    };

    setDonations(prev => prev.map(d => d.id === id ? updatedDonation : d));
    addNotificationLog(`Booking Confirmed: ${donation.foodItems}`);
    setClaimedDonation(updatedDonation);
  };

  const handleCompleteDonation = async (id: string) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));
    showToast("Pickup confirmed! Thank you.", "success");
  };

  const handleCancelDonation = async (id: string) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'cancelled' } : d));
    showToast("Donation cancelled", "neutral");
  };

  const handleLogin = async (phone: string, pass: string) => {
      // Mock Login Logic
      const foundUser = users.find(u => u.phone === phone && u.password === pass);

      if (foundUser) {
          setCurrentUser(foundUser);
          showToast("Login successful!");
          setView('landing');
      } else {
          showToast("Invalid credentials. Try 1234567890 / 123", "error");
      }
  };

  const handleRegister = async (phone: string, pass: string, name: string) => {
      // Mock Register Logic
      const existingUser = users.find(u => u.phone === phone);
      if (existingUser) {
          showToast("Phone number already registered", "error");
          return;
      }

      const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          phone,
          password: pass,
          isVerified: true // Auto-verify new users
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);

      addNotificationLog(`Welcome to ShareMeal, ${name}!`);
      showToast("Account created successfully!");
      setView('landing');
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar 
        view={view}
        setView={setView}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        handleAuthRequired={handleAuthRequired}
        notifications={notificationHistory}
      />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
            <div className={`rounded-lg p-4 shadow-lg text-white flex items-center ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-500' : 'bg-gray-700'}`}>
                <CheckCircle className="h-5 w-5 mr-2" />
                {notification.message}
            </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Donor</h3>
                    <p className="text-gray-500 mb-4">Please dial the number below to reach the donor.</p>
                    <div className="bg-gray-100 p-4 rounded-lg font-mono text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                        <span>{contactModal.value}</span>
                         <button 
                            className="text-gray-400 hover:text-blue-600"
                            onClick={() => {
                                navigator.clipboard.writeText(contactModal.value);
                                showToast("Number copied to clipboard");
                            }}
                            title="Copy Number"
                        >
                            <Copy className="h-5 w-5" />
                        </button>
                    </div>
                    <Button onClick={() => setContactModal(null)} className="w-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Claim Success Modal */}
      {claimedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Food Reserved!</h3>
                    <p className="text-sm text-gray-500">The food is held for you.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 text-sm">Donor</span>
                        <span className="font-medium text-gray-900 text-sm">{claimedDonation.donorName}</span>
                    </div>
                     <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-500 text-sm">Location</span>
                        <span className="font-medium text-gray-900 text-sm text-right">{claimedDonation.location}</span>
                    </div>
                     <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500 text-sm">Contact</span>
                        <div className="flex gap-3">
                             <Button 
                                onClick={() => setContactModal({ type: 'phone', value: claimedDonation.phoneNumber })} 
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full w-10 h-10 p-0"
                             >
                                <Phone size={18} />
                             </Button>
                             <Button 
                                href={`https://wa.me/${claimedDonation.phoneNumber}`} 
                                className="bg-green-100 text-green-600 hover:bg-green-200 rounded-full w-10 h-10 p-0"
                             >
                                <MessageCircle size={18} />
                             </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={() => { setClaimedDonation(null); setView('bookings'); }} className="w-full">
                        View in My Bookings
                    </Button>
                    <Button variant="outline" onClick={() => setClaimedDonation(null)} className="w-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* View Routing */}
      {view === 'landing' && <LandingPage onNavigate={setView} handleAuthRequired={handleAuthRequired} />}
      
      {view === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onRegister={handleRegister}
          onCancel={() => setView('landing')}
        />
      )}
      
      {view === 'donor' && (
        <DonorForm 
          currentUser={currentUser} 
          onAddDonation={handleAddDonation} 
          onCancel={() => setView('landing')}
        />
      )}
      
      {view === 'donor-dashboard' && (
        <DonorDashboard 
          donations={donations} 
          currentUser={currentUser}
          onNewDonationClick={handleNewDonationClick} 
          onCancelDonation={handleCancelDonation}
          onCompleteDonation={handleCompleteDonation}
        />
      )}
      
      {view === 'receiver' && (
        <ReceiverDashboard 
          donations={donations} 
          onClaim={handleClaimDonation}
          onNavigateToBookings={() => handleAuthRequired('bookings')}
          onOpenMap={openMaps}
        />
      )}
      
      {view === 'bookings' && (
        <ReceiverBookings 
          donations={donations}
          currentUser={currentUser}
          onFindMore={() => handleAuthRequired('receiver')}
          onOpenMap={openMaps}
          onContact={(type, value) => setContactModal({ type, value })}
          onCompleteDonation={handleCompleteDonation}
        />
      )}
    </div>
  );
}