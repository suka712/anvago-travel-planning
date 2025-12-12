import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens, loadUser } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          setTokens(accessToken, refreshToken);
          await loadUser();
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } catch (err) {
          setStatus('error');
          setErrorMessage('Failed to authenticate. Please try again.');
        }
      } else {
        setStatus('error');
        setErrorMessage('Invalid authentication response');
      }
    };

    handleCallback();
  }, [searchParams, setTokens, loadUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#4FC3F7] rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black">Anvago</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-[#4FC3F7] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Completing sign in...</h1>
            <p className="text-gray-600">Please wait while we set up your account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Anvago!</h1>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Try Again
              </Button>
              <Button onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

