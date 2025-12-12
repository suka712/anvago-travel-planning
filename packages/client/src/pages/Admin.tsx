import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Map, Calendar, TrendingUp, Settings, Database,
  RefreshCw, Play, Pause, Eye, Edit, Trash2, Plus,
  BarChart3, Globe, Sparkles, Cloud, CheckCircle2
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';

// Mock admin data
const mockStats = {
  totalUsers: 1247,
  activeTrips: 89,
  itinerariesGenerated: 3456,
  avgRating: 4.8,
};

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', isPremium: true, trips: 5, joined: '2024-10-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', isPremium: false, trips: 2, joined: '2024-11-01' },
  { id: '3', name: 'Demo User', email: 'demo@anvago.com', isPremium: false, trips: 3, joined: '2024-11-20' },
];

const mockLocations = [
  { id: '1', name: 'My Khe Beach', type: 'beach', city: 'Danang', isActive: true, views: 1234 },
  { id: '2', name: 'Marble Mountains', type: 'nature', city: 'Danang', isActive: true, views: 987 },
  { id: '3', name: 'Han Market', type: 'shopping', city: 'Danang', isActive: true, views: 756 },
  { id: '4', name: 'Dragon Bridge', type: 'attraction', city: 'Danang', isActive: true, views: 1567 },
];

const demoScenarios = [
  { id: 'weather', name: 'Weather Alert', description: 'Trigger rain warning and smart reroute', icon: Cloud },
  { id: 'traffic', name: 'Traffic Update', description: 'Show traffic delay notification', icon: TrendingUp },
  { id: 'arrival', name: 'Arrival Detection', description: 'Simulate arriving at destination', icon: CheckCircle2 },
  { id: 'transport', name: 'Transport Offer', description: 'Show Grab booking prompt', icon: Globe },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'demo'>('overview');
  const [demoState, setDemoState] = useState({
    weatherAlert: false,
    trafficDelay: false,
    mockLocation: true,
    aiResponses: true,
  });

  const toggleDemoState = (key: keyof typeof demoState) => {
    setDemoState(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: mockStats.totalUsers, icon: Users, color: 'blue' },
                    { label: 'Active Trips', value: mockStats.activeTrips, icon: Map, color: 'green' },
                    { label: 'Itineraries', value: mockStats.itinerariesGenerated, icon: Calendar, color: 'purple' },
                    { label: 'Avg Rating', value: mockStats.avgRating, icon: TrendingUp, color: 'yellow' },
                  ].map(stat => (
                    <Card key={stat.label}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card>
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="flex gap-3">
                    <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Refresh Data
                    </Button>
                    <Button variant="secondary" leftIcon={<Database className="w-4 h-4" />}>
                      Reseed Database
                    </Button>
                    <Button variant="secondary" leftIcon={<Sparkles className="w-4 h-4" />}>
                      Generate Sample Trips
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
                      { name: 'AI Service', status: 'mock' },
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
                  <h2 className="text-2xl font-bold">Users</h2>
                  <Button leftIcon={<Plus className="w-4 h-4" />}>Add User</Button>
                </div>
                
                <Card padding="none">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Trips</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.isPremium ? 'warning' : 'secondary'}>
                              {user.isPremium ? 'Premium' : 'Free'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{user.trips}</td>
                          <td className="px-4 py-3 text-gray-500">{user.joined}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
                  <h2 className="text-2xl font-bold">Locations</h2>
                  <Button leftIcon={<Plus className="w-4 h-4" />}>Add Location</Button>
                </div>
                
                <Card padding="none">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Views</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockLocations.map(location => (
                        <tr key={location.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{location.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{location.type}</Badge>
                          </td>
                          <td className="px-4 py-3">{location.city}</td>
                          <td className="px-4 py-3">{location.views.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={location.isActive ? 'success' : 'secondary'}>
                              {location.isActive ? 'Active' : 'Inactive'}
                            </Badge>
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

            {activeTab === 'demo' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Demo Control Panel</h2>
                <p className="text-gray-600">Control demo scenarios and mock data for presentations.</p>
                
                {/* Demo Toggles */}
                <Card>
                  <h3 className="font-bold mb-4">Mock Data Controls</h3>
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

                {/* Trigger Scenarios */}
                <Card>
                  <h3 className="font-bold mb-4">Trigger Demo Scenarios</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {demoScenarios.map(scenario => (
                      <button
                        key={scenario.id}
                        className="p-4 rounded-xl border-2 hover:border-[#4FC3F7] transition-colors text-left"
                      >
                        <scenario.icon className="w-8 h-8 text-[#4FC3F7] mb-2" />
                        <h4 className="font-bold">{scenario.name}</h4>
                        <p className="text-sm text-gray-500">{scenario.description}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Demo User Quick Actions */}
                <Card>
                  <h3 className="font-bold mb-4">Demo User Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary">Switch to Premium User</Button>
                    <Button variant="secondary">Reset Demo Data</Button>
                    <Button variant="secondary">Start Sample Trip</Button>
                    <Button variant="secondary">Generate Itinerary</Button>
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

