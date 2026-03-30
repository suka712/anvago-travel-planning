import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { paymentsAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

type Status = 'polling' | 'completed' | 'failed';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuthStore();

  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');

  const [status, setStatus] = useState<Status>('polling');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // MoMo includes resultCode=0 in the redirect URL on success
    if (resultCode && resultCode !== '0') {
      setStatus('failed');
      return;
    }

    if (!orderId) {
      setStatus('failed');
      return;
    }

    // Poll the backend until the IPN has been processed (or timeout after 30s)
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await paymentsAPI.getStatus(orderId);
        const paymentStatus = res.data.data.status;

        if (paymentStatus === 'completed') {
          clearInterval(intervalRef.current!);
          await loadUser(); // refresh auth store so isPremium is up to date
          setStatus('completed');
        } else if (paymentStatus === 'failed' || attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalRef.current!);
          setStatus(paymentStatus === 'failed' ? 'failed' : 'polling');
          if (attempts >= MAX_ATTEMPTS) setStatus('failed');
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalRef.current!);
          setStatus('failed');
        }
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId, resultCode, loadUser]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center"
      >
        {status === 'polling' && (
          <>
            <Loader2 className="w-16 h-16 text-[#4FC3F7] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Confirming payment...</h1>
            <p className="text-gray-500">Please wait while we verify your payment with MoMo.</p>
          </>
        )}

        {status === 'completed' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">You're now Premium!</h1>
            <p className="text-gray-500 mb-8">
              Your MoMo payment was confirmed. Enjoy all premium features for the next 30 days.
            </p>
            <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Payment failed</h1>
            <p className="text-gray-500 mb-8">
              Your payment could not be completed. No charges were made. Please try again.
            </p>
            <div className="space-y-3">
              <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
