import React, { useState, useEffect } from 'react';
import { CheckCircle, Phone, Copy, MessageCircle, Database } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage, LoginPage, DonorForm, DonorDashboard, ReceiverDashboard, ReceiverBookings } from './components/PageViews';
import { Button } from './components/Common';
import { ViewState, Donation, User, NotificationItem, ToastState, ContactModalState } from './types';
import { INITIAL_DONATIONS } from './constants';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState<ViewState>('landing'); 
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notification, setNotification] = useState<ToastState | null>(null); 
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([]);
  
  // Modals
  const [claimedDonation, setClaimedDonation] = useState<Donation | null>(null);
  const [contactModal, setContactModal] = useState<ContactModalState | null>(null); 
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Derived State
  const isLoggedIn = currentUser !== null;

  // --- 1. AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extra user details (phone/name) from Firestore 'users' collection
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
               const userData = userDoc.data() as User;
               setCurrentUser(userData);
            } else {
               // Fallback if doc doesn't exist yet
               setCurrentUser({
                 id: firebaseUser.uid,
                 name: firebaseUser.displayName || 'User',
                 phone: '', 
                 isVerified: true
               });
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DATA LISTENER (Real-time Database) ---
  useEffect(() => {
    // Subscribe to donations collection, ordered by newest first
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDonations: Donation[] = [];
      snapshot.forEach((doc) => {
        fetchedDonations.push({ id: doc.id, ...doc.data() } as Donation);
      });
      setDonations(fetchedDonations);
    }, (error) => {
        console.error("Database connection error:", error);
        if (error.code === 'permission-denied') {
            showToast("Database permission denied. Check Firebase rules.", "error");
        }
    });

    return () => unsubscribe();
  }, []);

  // --- 3. EXPIRATION CHECKER ---
  // Runs every minute to auto-expire items in the database
  useEffect(() => {
    const checkExpiration = () => {
      donations.forEach(async (d) => {
        const now = Date.now();
        if (d.status === 'available' && d.expiresAt < now) {
            // Update in Firebase
            try {
                await updateDoc(doc(db, 'donations', d.id), {
                    status: 'expired'
                });
                console.log(`Expired donation ${d.id}`);
            } catch (err) {
                console.error("Error expiring donation", err);
            }
        }
      });
    };

    const interval = setInterval(checkExpiration, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [donations]);
  
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
    try {
        await signOut(auth);
        setView('landing');
        showToast("Logged out successfully", "neutral");
    } catch (error) {
        showToast("Error logging out", "error");
    }
  };

  const handleAddDonation = async (newDonationData: Omit<Donation, 'id' | 'timestamp' | 'createdAt' | 'status' | 'distance' | 'userId'>) => {
    if (!currentUser) return;
    
    // Simulate random distance between 0.5 and 15.0 km
    const randomDistance = (Math.random() * 14.5 + 0.5).toFixed(1);

    const donationPayload = {
        userId: currentUser.id,
        ...newDonationData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        status: 'available',
        distance: `${randomDistance} km`
    };

    try {
        await addDoc(collection(db, 'donations'), donationPayload);
        addNotificationLog(`Donation Posted: ${newDonationData.foodItems}`);
        showToast("Thank you! Your donation has been listed.");
        setView('donor-dashboard');
    } catch (error) {
        console.error("Error adding document: ", error);
        showToast("Failed to post donation. Check connection.", "error");
    }
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

    if (donation.expiresAt < Date.now()) {
        showToast("This donation has expired.", "error");
        // Force update DB just in case
        await updateDoc(doc(db, 'donations', id), { status: 'expired' });
        return;
    }

    try {
        await updateDoc(doc(db, 'donations', id), {
            status: 'claimed',
            claimedByUserId: currentUser?.id
        });
        
        const updatedDonation = { ...donation, status: 'claimed' as const, claimedByUserId: currentUser?.id };
        addNotificationLog(`Booking Confirmed: ${donation.foodItems}`);
        setClaimedDonation(updatedDonation);
    } catch (error) {
        showToast("Failed to claim donation.", "error");
    }
  };

  const handleCompleteDonation = async (id: string) => {
    try {
        await updateDoc(doc(db, 'donations', id), { status: 'completed' });
        showToast("Pickup confirmed! Thank you.", "success");
    } catch (error) {
        showToast("Error updating status.", "error");
    }
  };

  const handleCancelDonation = async (id: string) => {
    try {
        await updateDoc(doc(db, 'donations', id), { status: 'cancelled' });
        showToast("Donation cancelled", "neutral");
    } catch (error) {
        showToast("Error cancelling.", "error");
    }
  };
  
  // --- UTILS ---
  const handleSeedData = async () => {
    try {
        for (const d of INITIAL_DONATIONS) {
            // Remove the hardcoded ID so Firestore generates a unique one
            const { id, ...data } = d;
            // Update timestamps to be current so they aren't expired immediately
            const freshData = {
                ...data,
                createdAt: Date.now(),
                expiresAt: Date.now() + 4 * 60 * 60 * 1000, // 4 hours from now
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            await addDoc(collection(db, 'donations'), freshData);
        }
        showToast("Demo data added successfully!", "success");
    } catch (error) {
        console.error("Error seeding data:", error);
        showToast("Failed to seed data.", "error");
    }
  };

  // --- AUTH HANDLERS (Mapped to Firebase) ---

  const getEmailFromPhone = (phone: string) => `${phone}@sharemeal.app`;

  const handleLogin = async (phone: string, pass: string) => {
      try {
        const email = getEmailFromPhone(phone);
        await signInWithEmailAndPassword(auth, email, pass);
        showToast("Login successful!");
        setView('landing');
      } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
             showToast("Invalid Phone or Password.", "error");
        } else {
             showToast("Login failed: " + error.message, "error");
        }
      }
  };

  const handleRegister = async (phone: string, pass: string, name: string) => {
      try {
        const email = getEmailFromPhone(phone);
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, { displayName: name });

        // 3. Store extra details in Firestore 'users' collection
        const newUser: User = {
            id: user.uid,
            name: name,
            phone: phone,
            isVerified: true
        };
        
        await setDoc(doc(db, 'users', user.uid), newUser);

        setCurrentUser(newUser); // Optimistic update
        addNotificationLog(`Welcome to ShareMeal, ${name}!`);
        showToast("Account created successfully!");
        setView('landing');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            showToast("This phone number is already registered.", "error");
        } else if (error.code === 'auth/weak-password') {
            showToast("Password should be at least 6 characters.", "error");
        } else {
            showToast("Registration failed: " + error.message, "error");
        }
      }
  };

  if (isAuthLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-green-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
      );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
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

      {/* Helper Button to Seed Data if Empty */}
      {donations.length === 0 && isLoggedIn && (
          <div className="fixed bottom-6 right-6 z-40">
              <Button onClick={handleSeedData} variant="secondary" className="shadow-xl bg-white/90 backdrop-blur border-green-200 text-xs">
                  <Database className="h-4 w-4" /> Load Demo Data
              </Button>
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