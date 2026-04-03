import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Globe, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const from = (location.state as any)?.from || '/dashboard';

  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every(r => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      const msg = 'Please agree to the terms and conditions';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!isPasswordValid) {
      const msg = 'Please meet all password requirements';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to Anvago! 🎉');
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.message || 'Registration failed';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#4FC3F7]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#81D4FA]/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#4FC3F7] rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black">Anvago</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-600">Start planning your perfect trip</p>
        </div>

        <Card>
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                {passwordRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${
                      req.met ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{req.text}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-[#2196F3] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#2196F3] hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={!agreed || !isPasswordValid}
            >
              Create Account
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Free account includes:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'AI-generated itineraries',
                'Save and organize trips',
                'Weather-smart planning',
                'Basic trip customization',
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2196F3] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

