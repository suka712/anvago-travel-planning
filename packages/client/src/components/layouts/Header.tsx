import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Coins, Flame, ChevronRight, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useRewardsStore, REWARD_TIERS, GIFTS } from '@/stores/rewardsStore';
import { Button } from '@/components/ui';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRewardsPanel, setShowRewardsPanel] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { points, streakDays, getCurrentTier, getNextTier, getProgressToNextTier } = useRewardsStore();
  const navigate = useNavigate();

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-30 ${
        transparent
          ? 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
          : 'bg-white border-b-2 border-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-primary rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold hidden sm:block">Anvago</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/discover"
              className="font-medium text-gray-600 hover:text-black transition-colors"
            >
              Discover
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="font-medium text-gray-600 hover:text-black transition-colors"
              >
                My Trips
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Points/Rewards Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowRewardsPanel(!showRewardsPanel)}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 border-2 border-amber-300 transition-all"
                  >
                    <span className="text-lg">{currentTier.icon}</span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-amber-700">{points}</span>
                    </div>
                    {streakDays > 1 && (
                      <div className="flex items-center gap-0.5 text-orange-500">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{streakDays}</span>
                      </div>
                    )}
                  </button>

                  {/* Rewards Panel Dropdown */}
                  <AnimatePresence>
                    {showRewardsPanel && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowRewardsPanel(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden z-50"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{currentTier.icon}</span>
                                <div>
                                  <p className="font-bold">{currentTier.name}</p>
                                  <p className="text-xs text-white/80">Level {REWARD_TIERS.indexOf(currentTier) + 1}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{points}</p>
                                <p className="text-xs text-white/80">points</p>
                              </div>
                            </div>

                            {/* Progress to next tier */}
                            {nextTier && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{currentTier.name}</span>
                                  <span>{nextTier.name}</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-white rounded-full"
                                  />
                                </div>
                                <p className="text-xs text-white/80 mt-1">
                                  {nextTier.points - (getCurrentTier().points + Math.round((progress / 100) * (nextTier.points - getCurrentTier().points)))} points to {nextTier.name}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Streak */}
                          {streakDays > 0 && (
                            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Flame className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <p className="font-semibold text-orange-700">{streakDays}-day streak!</p>
                                    <p className="text-xs text-orange-600">Keep contributing daily</p>
                                  </div>
                                </div>
                                <span className="text-xl">🔥</span>
                              </div>
                            </div>
                          )}

                          {/* Quick rewards preview */}
                          <div className="p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Redeem Points</p>
                            <div className="space-y-2">
                              {GIFTS.slice(0, 3).map((gift) => (
                                <div
                                  key={gift.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border ${
                                    points >= gift.points
                                      ? 'border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100'
                                      : 'border-gray-100 bg-gray-50 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium">{gift.name}</span>
                                  </div>
                                  <span className={`text-sm font-bold ${points >= gift.points ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {gift.points} pts
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Earn more link */}
                            <button
                              onClick={() => {
                                setShowRewardsPanel(false);
                                navigate('/dashboard');
                              }}
                              className="w-full mt-3 flex items-center justify-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
                            >
                              Earn more points
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Avatar */}
                <Link
                  to="/dashboard"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  {user?.isPremium && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-400 text-black rounded-full border border-black z-10">
                      PRO
                    </span>
                  )}
                  <div className="w-8 h-8 bg-sky-primary rounded-full border-2 border-black flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{user?.name?.[0] || 'U'}</span>
                    )}
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/discover"
              className="block py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Trips
                </Link>
                <Link
                  to="/settings"
                  className="block py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 font-medium text-sky-dark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block py-2 font-medium text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
