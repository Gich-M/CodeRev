import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Home, 
  PlusCircle, 
  Search, 
  User,
  Settings,
  LogOut,
  ChevronDown,
  Info,
  Mail,
  Phone,
  Grid,
  Bell,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata: {
    status: string;
    reviewer_username: string;
    snippet_title: string;
  };
};

export function Header() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDashMenu, setShowDashMenu] = useState(false);
  const dashMenuRef = useRef<HTMLDivElement>(null);
  const dashButtonRef = useRef<HTMLButtonElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ totalSnippets: 0, pendingReviews: 0 });
  const notificationsRef = useRef<HTMLDivElement>(null);

  const searchItems = [
    {
      id: 'submit',
      title: 'Submit Code',
      path: '/new-snippet',
      icon: <PlusCircle className="w-5 h-5 text-blue-500" />,
      description: 'Share your code and get valuable feedback'
    },
    {
      id: 'browse',
      title: 'Browse Reviews',
      path: '/feed',
      icon: <Search className="w-5 h-5 text-purple-500" />,
      description: 'Explore code submissions and learn from others'
    },
    {
      id: 'submissions',
      title: 'My Submissions',
      path: '/my-submissions',
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
      description: 'Track your submissions and review progress'
    },
    {
      id: 'review',
      title: 'Review Code',
      path: '/pending-reviews',
      icon: <Star className="w-5 h-5 text-green-500" />,
      description: 'Help others improve and earn points'
    }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        dashMenuRef.current && 
        !dashMenuRef.current.contains(event.target as Node) &&
        dashButtonRef.current &&
        !dashButtonRef.current.contains(event.target as Node)
      ) {
        setShowDashMenu(false);
      }
      if (
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAsRead = async (notificationId?: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq(notificationId ? 'id' : 'read', notificationId || false);

      if (error) throw error;

      if (notificationId) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <header className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-3"
            >
              <Code2 className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">CodeReview</span>
            </Link>

            {/* Grid Menu Button */}
            {user && (
              <div className="relative">
                <button
                  ref={dashButtonRef}
                  onClick={() => setShowDashMenu(!showDashMenu)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-blue-500 hover:bg-gray-800 rounded transition-colors"
                >
                  <Grid className="w-5 h-5" />
                  <span className="text-sm font-medium">Menu</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {showDashMenu && (
                  <motion.div
                    ref={dashMenuRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-2 w-[680px] bg-gradient-to-b from-gray-800 to-gray-850 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
                  >
                    <div className="p-6">
                      {/* Menu Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/50">
                        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                        <span className="text-sm text-gray-400">Access your tools and resources</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Submit Code */}
                        <Link
                          to="/new-snippet"
                          onClick={() => setShowDashMenu(false)}
                          className="group p-4 rounded-lg bg-gray-800/50 hover:bg-gray-750 transition-all duration-200 border border-gray-700/50 hover:border-blue-500/50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                              <PlusCircle className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">Submit Code</h3>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed mb-3">
                            Share your code and get valuable feedback from experienced developers
                          </p>
                          <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300">
                            <span>Start sharing</span>
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>

                        {/* Browse Reviews */}
                        <Link
                          to="/feed"
                          onClick={() => setShowDashMenu(false)}
                          className="group p-4 rounded-lg bg-gray-800/50 hover:bg-gray-750 transition-all duration-200 border border-gray-700/50 hover:border-purple-500/50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                              <Search className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">Browse Reviews</h3>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed mb-3">
                            Explore code submissions and learn from other developers
                          </p>
                          <div className="flex items-center text-sm text-purple-400 group-hover:text-purple-300">
                            <span>Start exploring</span>
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>

                        {/* My Submissions */}
                        <Link
                          to="/my-submissions"
                          onClick={() => setShowDashMenu(false)}
                          className="group p-4 rounded-lg bg-gray-800/50 hover:bg-gray-750 transition-all duration-200 border border-gray-700/50 hover:border-indigo-500/50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                              <Code2 className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">My Submissions</h3>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed mb-3">
                            Track your submissions and review progress
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-indigo-400 group-hover:text-indigo-300">
                              <span>View submissions</span>
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <span className="px-2 py-1 text-xs bg-gray-700/50 rounded-full text-gray-300">
                              {stats?.totalSnippets || 0} Snippets
                            </span>
                          </div>
                        </Link>

                        {/* Review Code */}
                        <Link
                          to="/pending-reviews"
                          onClick={() => setShowDashMenu(false)}
                          className="group p-4 rounded-lg bg-gray-800/50 hover:bg-gray-750 transition-all duration-200 border border-gray-700/50 hover:border-emerald-500/50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                              <Star className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">Review Code</h3>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed mb-3">
                            Help others improve and earn reputation points
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-emerald-400 group-hover:text-emerald-300">
                              <span>Start reviewing</span>
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <span className="px-2 py-1 text-xs bg-gray-700/50 rounded-full text-gray-300">
                              {stats?.pendingReviews || 0} Pending
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Center section with search */}
          {user && (
            <div className="flex-1 max-w-xl mx-auto px-4">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-gray-800 text-gray-300 pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 mt-2 bg-gray-800 rounded-md shadow-lg border border-gray-700"
                  >
                    {searchItems
                      .filter(item => 
                        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(item => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className="flex items-center px-4 py-3 hover:bg-gray-700"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                        >
                          <div className="p-2 bg-gray-750 rounded-md mr-3">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">{item.title}</h4>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Main Navigation - Remove Dashboard button */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user && (
              <>
                <Link
                  to="/"
                  className="px-4 py-2 text-white border border-blue-500 rounded-md hover:bg-blue-500 transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 text-white border border-blue-500 rounded-md hover:bg-blue-500 transition-colors duration-200"
                >
                  About
                </Link>
                <div className="relative group">
                  <div className="flex items-center space-x-1 text-white hover:text-blue-500 cursor-pointer px-4 py-2">
                    <span>Contact</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <div className="absolute right-0 mt-1 w-48 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700"
                    >
                      <a href="mailto:gichmuriuki21@gmail.com" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                      <a href="tel:+254743597648" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone
                      </a>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    ref={notificationButtonRef}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div 
                      ref={notificationsRef}
                      className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead();
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`px-4 py-2 hover:bg-gray-800 cursor-pointer ${
                              !notification.read ? 'bg-gray-800/50' : ''
                            }`}
                          >
                            <div className="text-sm font-medium text-white">
                              {notification.title}
                            </div>
                            <div className="text-xs text-gray-400">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Existing User Menu Button */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 text-white hover:text-blue-500 transition-colors px-3 py-2 rounded-md hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700"
                    >
                      <Link
                        to={`/profile/${user.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <Link
                        to="/about"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Info className="w-4 h-4 mr-3" />
                        About
                      </Link>
                      <div className="relative group">
                        <div className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                          <Mail className="w-4 h-4 mr-3" />
                          Contact
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </div>
                        <div className="absolute left-full top-0 w-48 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150">
                          <div className="bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 ml-2">
                            <a
                              href="mailto:gichmuriuki21@gmail.com"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              <Mail className="w-4 h-4 mr-3" />
                              Email
                            </a>
                            <a
                              href="tel:+254743597648"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              <Phone className="w-4 h-4 mr-3" />
                              Phone
                            </a>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 border-t border-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-white border border-blue-500 rounded-md hover:bg-blue-500 transition-colors duration-200"
                  onClick={() => {
                    window.history.replaceState({}, '', '/auth');
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?signup=true"
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => {
                    window.history.replaceState({}, '', '/auth?signup=true');
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}