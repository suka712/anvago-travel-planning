import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Globe, Crown, LogOut, ArrowLeft,
  Check, Camera, Trash2, Moon, Sun, ChevronRight
} from 'lucide-react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

type TabId = 'profile' | 'notifications' | 'preferences' | 'subscription';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    tripReminders: true,
    weatherAlerts: true,
    promotions: false,
    weeklyDigest: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'VND',
    distanceUnit: 'km',
    theme: 'light',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: User },
    { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
    { id: 'preferences' as TabId, label: 'Preferences', icon: Globe },
    { id: 'subscription' as TabId, label: 'Subscription', icon: Crown },
  ];

  // Toggle switch component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full border-2 border-black transition-colors ${
        checked ? 'bg-sky-primary' : 'bg-gray-200'
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full border-2 border-black shadow-sm"
        animate={{ left: checked ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-600 flex items-center gap-1 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Saved
                  </motion.span>
                )}
              </AnimatePresence>
              <Button onClick={handleSave} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="md:w-64 flex-shrink-0">
            <Card className="md:sticky md:top-24">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-sky-primary text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                        : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}

                <hr className="my-4 border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors border-2 border-transparent"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card>
                    <h2 className="text-lg font-bold mb-6">Profile Information</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-sky-primary rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-white text-3xl font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold">{user?.name}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {user?.isPremium && (
                          <Badge variant="warning" className="mt-2 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium Member
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        leftIcon={<User className="w-4 h-4" />}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        leftIcon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                  </Card>

                  <Card>
                    <h2 className="text-lg font-bold mb-6">Change Password</h2>
                    <div className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={formData.currentPassword}
                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                        leftIcon={<Lock className="w-4 h-4" />}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="New Password"
                          type="password"
                          value={formData.newPassword}
                          onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                          leftIcon={<Lock className="w-4 h-4" />}
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                          leftIcon={<Lock className="w-4 h-4" />}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-red-300 bg-red-50">
                    <h2 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h2>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="secondary" className="text-red-600 border-red-400 hover:bg-red-100">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </Card>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
                    <div className="space-y-1">
                      {[
                        { key: 'tripReminders', label: 'Trip Reminders', desc: 'Get reminded about upcoming trips and activities' },
                        { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Receive alerts for weather changes affecting your trips' },
                        { key: 'promotions', label: 'Promotions & Offers', desc: 'Stay updated on deals and special offers' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your travel activities and recommendations' },
                      ].map((item, idx) => (
                        <div
                          key={item.key}
                          className={`flex items-center justify-between py-4 ${
                            idx < 3 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <Toggle
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() =>
                              setNotifications(prev => ({
                                ...prev,
                                [item.key]: !prev[item.key as keyof typeof prev],
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <h2 className="text-lg font-bold mb-6">App Preferences</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-black focus:shadow-[4px_4px_0px_#4FC3F7] outline-none transition-shadow"
                        >
                          <option value="en">English</option>
                          <option value="vi">Tiếng Việt</option>
                          <option value="ja">日本語</option>
                          <option value="ko">한국어</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select
                          value={preferences.currency}
                          onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-black focus:shadow-[4px_4px_0px_#4FC3F7] outline-none transition-shadow"
                        >
                          <option value="VND">Vietnamese Dong (₫)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Distance Unit</label>
                        <div className="flex gap-3">
                          {['km', 'miles'].map(unit => (
                            <button
                              key={unit}
                              onClick={() => setPreferences({ ...preferences, distanceUnit: unit })}
                              className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                                preferences.distanceUnit === unit
                                  ? 'border-black bg-sky-primary shadow-[3px_3px_0px_#000]'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {unit === 'km' ? 'Kilometers' : 'Miles'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Theme</label>
                        <div className="flex gap-3">
                          {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                          ].map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => setPreferences({ ...preferences, theme: theme.id })}
                              className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                                preferences.theme === theme.id
                                  ? 'border-black bg-sky-primary shadow-[3px_3px_0px_#000]'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <theme.icon className="w-4 h-4" />
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card
                    className={
                      user?.isPremium
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                        : ''
                    }
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold mb-1">
                          {user?.isPremium ? 'Premium Plan' : 'Free Plan'}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {user?.isPremium
                            ? 'You have access to all premium features'
                            : 'Upgrade to unlock all features'}
                        </p>
                      </div>
                      {user?.isPremium && (
                        <Badge variant="warning">
                          <Crown className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>

                    {!user?.isPremium && (
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <Card className="border-2 border-gray-200">
                          <h3 className="font-bold mb-2">Free</h3>
                          <p className="text-3xl font-black mb-4">
                            $0<span className="text-sm font-normal text-gray-500">/month</span>
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              AI itineraries
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Save up to 3 trips
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Basic customization
                            </li>
                          </ul>
                        </Card>

                        <Card className="border-2 border-sky-primary bg-sky-primary/5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sky-dark">Premium</h3>
                            <Badge variant="primary" className="text-[10px]">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-3xl font-black mb-4">
                            280,000₫<span className="text-sm font-normal text-gray-500">/month</span>
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Everything in Free
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              AI optimization
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Smart search
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Local gems
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Unlimited trips
                            </li>
                          </ul>
                        </Card>
                      </div>
                    )}

                    <Button
                      fullWidth={!user?.isPremium}
                      variant={user?.isPremium ? 'secondary' : 'primary'}
                    >
                      {user?.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                    </Button>
                  </Card>

                  {user?.isPremium && (
                    <Card>
                      <h3 className="font-bold mb-4">Billing History</h3>
                      <div className="space-y-1">
                        {[
                          { date: 'Dec 1, 2024', amount: '280,000₫', status: 'Paid' },
                          { date: 'Nov 1, 2024', amount: '280,000₫', status: 'Paid' },
                          { date: 'Oct 1, 2024', amount: '280,000₫', status: 'Paid' },
                        ].map((invoice, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between py-3 ${
                              idx < 2 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <div>
                              <p className="font-medium">{invoice.date}</p>
                              <p className="text-sm text-gray-500">Monthly subscription</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{invoice.amount}</p>
                              <Badge variant="success" className="text-[10px]">
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
