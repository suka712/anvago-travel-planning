import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Sparkles, Compass, Zap, Clock, Shield,
  ChevronRight, Play, Star, Globe,
  Bike, Coffee, Camera, Sunset
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { DemoModal } from '@/components/modals';
import { useAuthStore } from '@/stores/authStore';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Planning',
    description: 'Tell us your vibe, we\'ll craft the perfect itinerary',
    color: 'from-purple-400 to-pink-400',
  },
  {
    icon: Compass,
    title: 'Local Intelligence',
    description: 'Real-time weather, traffic, and local insights',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Zap,
    title: 'One-Tap Booking',
    description: 'Grab rides, tours, and reservations instantly',
    color: 'from-orange-400 to-red-400',
  },
  {
    icon: Clock,
    title: 'Smart Routing',
    description: 'Live navigation and schedule optimization',
    color: 'from-green-400 to-emerald-400',
  },
];

const testimonials = [
  {
    name: 'Sarah L.',
    avatar: '👩‍💼',
    text: 'Anvago made my Danang trip absolutely seamless. The AI suggestions were spot-on!',
    rating: 5,
  },
  {
    name: 'Mike T.',
    avatar: '🧑‍💻',
    text: 'Love how it adapts to weather changes. Saved my trip when it started raining!',
    rating: 5,
  },
  {
    name: 'Yuki M.',
    avatar: '👩‍🎨',
    text: 'Found hidden gems I would never have discovered on my own. Amazing local spots!',
    rating: 5,
  },
];

const stats = [
  { value: '10K+', label: 'Happy Travelers' },
  { value: '500+', label: 'Local Spots' },
  { value: '4.9', label: 'App Rating' },
  { value: '98%', label: 'Satisfaction' },
];

const vibeIcons = [
  { icon: Bike, label: 'Adventure' },
  { icon: Coffee, label: 'Cafe Hopping' },
  { icon: Camera, label: 'Photo Spots' },
  { icon: Sunset, label: 'Beaches' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    <div className="min-h-screen bg-[#FAFAF8] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4FC3F7]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#81D4FA]/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-[#B3E5FC]/40 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#4FC3F7] rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <span className="text-2xl font-black tracking-tight">Anvago</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-sky-primary rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-sm font-bold">{user?.name?.[0] || 'U'}</span>
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0] || 'Dashboard'}</span>
                </button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/discover')}>
                    Start Planning
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="primary" className="mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered Travel Planning
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Travel the world
              <br />
              <span className="text-[#2196F3]">your way</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Plan your perfect trip in minutes. AI-crafted itineraries, live navigation, 
              and local insights – all in one app.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/discover')}
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                Plan Your Trip Free
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                leftIcon={<Play className="w-5 h-5" />}
                onClick={() => setShowDemo(true)}
              >
                Watch Demo
              </Button>
            </div>

            {/* Quick Vibe Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Quick start:</span>
              <div className="flex gap-2">
                {vibeIcons.map((vibe) => (
                  <motion.button
                    key={vibe.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/discover')}
                    className="w-12 h-12 bg-white rounded-xl border-2 border-gray-200 hover:border-[#4FC3F7] flex items-center justify-center transition-colors"
                    title={vibe.label}
                  >
                    <vibe.icon className="w-5 h-5 text-gray-600" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Interactive Trip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="relative"
          >
            <Card className="p-0 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800"
                  alt="Danang Beach"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Badge variant="success" className="mb-2">95% Match</Badge>
                  <h3 className="text-xl font-bold">Beach & Culture Explorer</h3>
                  <p className="text-sm opacity-80">3 days in Danang</p>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {[
                    { time: '7:00', place: 'Sunrise at My Khe Beach', icon: '🌅' },
                    { time: '10:00', place: 'Marble Mountains', icon: '⛰️' },
                    { time: '14:00', place: 'Han Market Food Tour', icon: '🍜' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-mono text-gray-500">{item.time}</span>
                      <span className="text-sm font-medium">{item.place}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6"
            >
              <Card className="p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">AI Optimized</p>
                    <p className="text-xs text-gray-500">Best routes</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4"
            >
              <Card className="p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">500+ spots</p>
                    <p className="text-xs text-gray-500">Danang</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#4FC3F7]/5 border-y-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-black text-[#2196F3]">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-black mb-4">Everything you need for the perfect trip</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From planning to navigation, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hoverable className="h-full text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-[#4FC3F7]/10 to-[#81D4FA]/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-black mb-4">Loved by travelers worldwide</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-[#4FC3F7] to-[#2196F3] text-white p-12">
              <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl font-black mb-4">Ready to explore?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-lg mx-auto">
                Start planning your perfect trip in just 2 minutes. No credit card required.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/discover')}
                rightIcon={<ChevronRight className="w-5 h-5" />}
                className="bg-white text-[#2196F3] hover:bg-gray-100"
              >
                Start Planning Free
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4FC3F7] rounded-xl border-2 border-black flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xl font-black">Anvago</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2026 Anvago. Explore Danang your way.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-[#2196F3]">Privacy</a>
              <a href="#" className="hover:text-[#2196F3]">Terms</a>
              <a href="#" className="hover:text-[#2196F3]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

