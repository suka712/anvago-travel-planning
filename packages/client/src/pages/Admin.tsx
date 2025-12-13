import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Map, Calendar, TrendingUp, Settings, Database,
  RefreshCw, Play, Pause, Eye, Edit, Trash2, Plus,
  BarChart3, Globe, Sparkles, Cloud, CheckCircle2, CloudRain,
  Loader2, AlertTriangle, Car
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { adminAPI } from '@/services/api';

interface AdminStats {
  users: { total: number; premium: number; newToday: number };
  itineraries: { total: number; templates: number; generated: number };
  trips: { total: number; active: number; completed: number };
  locations: { total: number; verified: number; categories: Record<string, number> };
}

interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  _count: { itineraries: number; trips: number };
}

interface Location {
  id: string;
  name: string;
  category: string;
  city: string;
  isAnvaVerified: boolean;
  isHiddenGem: boolean;
  rating: number;
}

const demoScenarios = [
  { id: 'weather', name: 'Weather Alert', description: 'Trigger rain warning and smart reroute', icon: CloudRain, action: 'trigger_weather', payload: { weather: { type: 'rain', message: 'Heavy rain expected at 3 PM' } } },
  { id: 'traffic', name: 'Traffic Update', description: 'Show traffic delay notification', icon: Car, action: 'trigger_traffic', payload: { traffic: { status: 'heavy', area: 'Dragon Bridge' } } },
  { id: 'arrival', name: 'Advance Location', description: 'Move to next destination', icon: CheckCircle2, action: 'advance_location', payload: {} },
  { id: 'complete', name: 'Complete Trip', description: 'Mark current trip as completed', icon: Sparkles, action: 'complete_trip', payload: {} },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'demo'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [demoState, setDemoState] = useState({
    weatherAlert: false,
    trafficDelay: false,
    mockLocation: true,
    aiResponses: true,
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usersRes, locationsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
          adminAPI.getLocations(),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setLocations(locationsRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDemoState = (key: keyof typeof demoState) => {
    setDemoState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTriggerScenario = async (scenario: typeof demoScenarios[0]) => {
    setTriggering(scenario.id);
    try {
      await adminAPI.updateDemoState({
        action: scenario.action,
        payload: scenario.payload,
      });
      setNotification(`✓ ${scenario.name} triggered successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(`✗ Failed to trigger ${scenario.name}`);
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setTriggering(null);
    }
  };

  const handleReseedDatabase = async () => {
    if (!confirm('This will reset all demo data. Continue?')) return;
    setTriggering('reseed');
    try {
      await adminAPI.reseedDatabase();
      setNotification('✓ Database reseeded successfully!');
      // Refresh data
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setNotification('✗ Failed to reseed database');
    } finally {
      setTriggering(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#4FC3F7] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Make sure you're logged in as an admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4FC3F7] rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-gray-600">Anvago Management & Demo Control</p>
              </div>
            </div>
            <Badge variant="warning">Demo Mode Active</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'locations', label: 'Locations', icon: Map },
                  { id: 'demo', label: 'Demo Control', icon: Play },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#4FC3F7] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.users.total, icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600' },
                    { label: 'Active Trips', value: stats.trips.active, icon: Map, color: 'bg-green-100', iconColor: 'text-green-600' },
                    { label: 'Itineraries', value: stats.itineraries.total, icon: Calendar, color: 'bg-purple-100', iconColor: 'text-purple-600' },
                    { label: 'Locations', value: stats.locations.total, icon: Globe, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
                  ].map(stat => (
                    <Card key={stat.label}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                          <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* More Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <h3 className="font-bold mb-3">Users</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Premium</span>
                        <span className="font-medium">{stats.users.premium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Today</span>
                        <span className="font-medium">{stats.users.newToday}</span>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <h3 className="font-bold mb-3">Trips</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium">{stats.trips.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-medium">{stats.trips.total}</span>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <h3 className="font-bold mb-3">Locations</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified</span>
                        <span className="font-medium">{stats.locations.verified}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categories</span>
                        <span className="font-medium">{Object.keys(stats.locations.categories).length}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="flex gap-3">
                    <Button 
                      variant="secondary" 
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => window.location.reload()}
                    >
                      Refresh Data
                    </Button>
                    <Button 
                      variant="secondary" 
                      leftIcon={<Database className="w-4 h-4" />}
                      onClick={handleReseedDatabase}
                      isLoading={triggering === 'reseed'}
                    >
                      Reseed Database
                    </Button>
                  </div>
                </Card>

                {/* System Status */}
                <Card>
                  <h3 className="font-bold mb-4">System Status</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'API Server', status: 'online' },
                      { name: 'Database', status: 'online' },
                      { name: 'Weather API', status: 'mock' },
                      { name: 'AI Service (Gemini)', status: process.env.VITE_GEMINI_API_KEY ? 'online' : 'mock' },
                      { name: 'Grab Integration', status: 'mock' },
                    ].map(service => (
                      <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span>{service.name}</span>
                        <Badge variant={service.status === 'online' ? 'success' : 'warning'}>
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Users ({users.length})</h2>
                </div>
                
                <Card padding="none">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Itineraries</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Trips</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {user.isAdmin && (
                                <Badge variant="error">Admin</Badge>
                              )}
                              <Badge variant={user.isPremium ? 'warning' : 'secondary'}>
                                {user.isPremium ? 'Premium' : 'Free'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">{user._count.itineraries}</td>
                          <td className="px-4 py-3">{user._count.trips}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Locations ({locations.length})</h2>
                  <Button leftIcon={<Plus className="w-4 h-4" />}>Add Location</Button>
                </div>
                
                <Card padding="none">
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Badges</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {locations.map(location => (
                          <tr key={location.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-gray-500">{location.city}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{location.category}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1">
                                ⭐ {location.rating}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {location.isAnvaVerified && (
                                  <Badge variant="success" className="text-xs">Verified</Badge>
                                )}
                                {location.isHiddenGem && (
                                  <Badge variant="warning" className="text-xs">Hidden Gem</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Demo Control Panel</h2>
                <p className="text-gray-600">Control demo scenarios and mock data for presentations.</p>

                {/* Notification */}
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${
                      notification.startsWith('✓') 
                        ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                        : 'bg-red-100 text-red-800 border-2 border-red-200'
                    }`}
                  >
                    {notification}
                  </motion.div>
                )}
                
                {/* Trigger Scenarios */}
                <Card>
                  <h3 className="font-bold mb-4">🎬 Trigger Demo Scenarios</h3>
                  <p className="text-sm text-gray-600 mb-4">Click to trigger scenarios during a live demo presentation.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {demoScenarios.map(scenario => (
                      <motion.button
                        key={scenario.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTriggerScenario(scenario)}
                        disabled={triggering === scenario.id}
                        className="p-4 rounded-xl border-2 border-black hover:border-[#4FC3F7] hover:bg-[#4FC3F7]/5 transition-colors text-left shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
                      >
                        {triggering === scenario.id ? (
                          <Loader2 className="w-8 h-8 text-[#4FC3F7] mb-2 animate-spin" />
                        ) : (
                          <scenario.icon className="w-8 h-8 text-[#4FC3F7] mb-2" />
                        )}
                        <h4 className="font-bold">{scenario.name}</h4>
                        <p className="text-sm text-gray-500">{scenario.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </Card>

                {/* Demo Toggles */}
                <Card>
                  <h3 className="font-bold mb-4">⚙️ Mock Data Controls</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'mockLocation', label: 'Mock Location', description: 'Simulate GPS location changes' },
                      { key: 'weatherAlert', label: 'Weather Alerts', description: 'Enable weather warning notifications' },
                      { key: 'trafficDelay', label: 'Traffic Delays', description: 'Simulate traffic conditions' },
                      { key: 'aiResponses', label: 'AI Responses', description: 'Use mock AI for itinerary generation' },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{toggle.label}</p>
                          <p className="text-sm text-gray-500">{toggle.description}</p>
                        </div>
                        <button
                          onClick={() => toggleDemoState(toggle.key as keyof typeof demoState)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            demoState[toggle.key as keyof typeof demoState] ? 'bg-[#4FC3F7]' : 'bg-gray-300'
                          }`}
                        >
                          <motion.div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            animate={{ left: demoState[toggle.key as keyof typeof demoState] ? '28px' : '4px' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Demo Quick Actions */}
                <Card>
                  <h3 className="font-bold mb-4">🚀 Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="secondary"
                      onClick={handleReseedDatabase}
                      isLoading={triggering === 'reseed'}
                      leftIcon={<Database className="w-4 h-4" />}
                    >
                      Reset All Demo Data
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => window.open('/discover', '_blank')}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Generate Itinerary (New Tab)
                    </Button>
                  </div>
                </Card>

                {/* Demo Login Info */}
                <Card className="bg-gradient-to-r from-[#4FC3F7]/10 to-[#81D4FA]/10">
                  <h3 className="font-bold mb-4">📧 Demo Account Credentials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-500">Admin Account</p>
                      <p className="font-mono text-sm">admin@anvago.com</p>
                      <p className="font-mono text-sm text-gray-600">admin123</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-500">Demo User (Premium)</p>
                      <p className="font-mono text-sm">demo@anvago.com</p>
                      <p className="font-mono text-sm text-gray-600">demo123</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

