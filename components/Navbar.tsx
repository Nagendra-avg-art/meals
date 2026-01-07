import React, { useState } from 'react';
import { Utensils, Bell, LogOut, User, Menu, X } from 'lucide-react';
import { ViewState, NotificationItem } from '../types';

interface NavbarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  isLoggedIn: boolean;
  handleLogout: () => void;
  handleAuthRequired: (target: ViewState) => void;
  notifications: NotificationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ 
  view, 
  setView, 
  isLoggedIn, 
  handleLogout, 
  handleAuthRequired,
  notifications 
}) => {
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-green-600 p-2 rounded-lg mr-2">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShareMeal</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center space-x-1">
            <button onClick={() => setView('landing')} className={`px-3 py-2 rounded-md font-medium ${view === 'landing' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'}`}>Home</button>
            <button onClick={() => handleAuthRequired('donor-dashboard')} className={`px-3 py-2 rounded-md font-medium ${view === 'donor' || view === 'donor-dashboard' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'}`}>Donate</button>
            <button onClick={() => handleAuthRequired('receiver')} className={`px-3 py-2 rounded-md font-medium ${view === 'receiver' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'}`}>Find Food</button>
            <button onClick={() => handleAuthRequired('bookings')} className={`px-3 py-2 rounded-md font-medium ${view === 'bookings' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'}`}>My Bookings</button>
            
            {isLoggedIn && (
                <div className="relative ml-2">
                    <button 
                        onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotificationsPanel && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                            <div className="p-3 bg-gray-50 border-b font-medium text-gray-700">Notifications</div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                                ) : (
                                    notifications.map(note => (
                                        <div key={note.id} className={`p-4 border-b hover:bg-gray-50 transition ${!note.read ? 'bg-blue-50/50' : ''}`}>
                                            <p className="text-sm text-gray-800">{note.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isLoggedIn ? (
                 <button onClick={handleLogout} className="ml-4 flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 font-medium">
                    <LogOut className="h-5 w-5" /> Logout
                 </button>
            ) : (
                <button onClick={() => handleAuthRequired('landing')} className="ml-4 flex items-center gap-2 text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg font-medium transition">
                    <User className="h-5 w-5" /> Login
                </button>
            )}
          </div>

          <div className="flex items-center sm:hidden gap-4">
            {isLoggedIn && (
                 <button onClick={() => setShowNotificationsPanel(!showNotificationsPanel)} className="text-gray-600">
                    <Bell className="h-6 w-6" />
                </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b p-4 space-y-2">
           <button onClick={() => { setView('landing'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Home</button>
           <button onClick={() => { handleAuthRequired('donor-dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Donate</button>
           <button onClick={() => { handleAuthRequired('receiver'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Find Food</button>
           <button onClick={() => { handleAuthRequired('bookings'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">My Bookings</button>
           {isLoggedIn ? (
               <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left text-red-600 py-2">Logout</button>
           ) : (
               <button onClick={() => { handleAuthRequired('landing'); setMobileMenuOpen(false); }} className="block w-full text-left text-green-600 py-2 font-bold">Login / Sign Up</button>
           )}
        </div>
      )}
    </nav>
  );
};