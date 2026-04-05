import { useState, useEffect } from 'react';
import {
  Users, Map, Calendar, Settings,
  RefreshCw, Eye, Edit, Plus,
  BarChart3, Globe,
  Loader2, AlertTriangle, Crown, Trash2, Shield, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Badge } from '@/components/ui';
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleRefresh = async () => {
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
      toast.success('Data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <p className="text-sm text-gray-600">Anvago Management</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={handleRefresh}>
              Refresh
            </Button>
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

                {/* System Status */}
                <Card>
                  <h3 className="font-bold mb-4">System Status</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'API Server', status: 'online' },
                      { name: 'Database', status: 'online' },
                      { name: 'Payment Gateway (SePay)', status: 'online' },
                      { name: 'AI Service', status: 'online' },
                    ].map(service => (
                      <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span>{service.name}</span>
                        <Badge variant="success">{service.status}</Badge>
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
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Crown className="w-4 h-4 text-amber-500" /> {users.filter(u => u.isPremium).length} Premium</span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-red-500" /> {users.filter(u => u.isAdmin).length} Admin</span>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] bg-white"
                  />
                </div>

                <Card padding="none">
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b sticky top-0">
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
                        {filteredUsers.map(user => (
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={user.isPremium ? 'Remove Premium' : 'Grant Premium'}
                                  onClick={async () => {
                                    try {
                                      await adminAPI.togglePremium(user.id);
                                      setUsers(prev => prev.map(u =>
                                        u.id === user.id ? { ...u, isPremium: !u.isPremium } : u
                                      ));
                                      toast.success(user.isPremium ? 'Premium removed' : 'Premium granted');
                                    } catch {
                                      toast.error('Failed to update user');
                                    }
                                  }}
                                >
                                  <Crown className={`w-4 h-4 ${user.isPremium ? 'text-amber-500' : 'text-gray-400'}`} />
                                </Button>
                                {!user.isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Delete User"
                                    onClick={async () => {
                                      if (!confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
                                      try {
                                        await adminAPI.deleteUser(user.id);
                                        setUsers(prev => prev.filter(u => u.id !== user.id));
                                        toast.success('User deleted');
                                      } catch {
                                        toast.error('Failed to delete user');
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                  </Button>
                                )}
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

          </div>
        </div>
      </div>
    </div>
  );
}

