import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-9xl font-black text-[#4FC3F7] mb-6"
        >
          404
        </motion.div>

        <div className="w-20 h-20 mx-auto mb-6 bg-[#4FC3F7]/20 rounded-full flex items-center justify-center">
          <Compass className="w-10 h-10 text-[#4FC3F7]" />
        </div>

        <h1 className="text-3xl font-bold mb-3">Lost your way?</h1>
        <p className="text-gray-600 mb-8">
          Looks like this destination doesn't exist. Even the best explorers take wrong turns sometimes!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Return Home
          </Button>
        </div>

        {/* Fun suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t"
        >
          <p className="text-sm text-gray-500 mb-4">While you're here, why not:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate('/discover')}
              className="px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-[#4FC3F7] transition-colors text-sm"
            >
              🗺️ Plan a trip
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-[#4FC3F7] transition-colors text-sm"
            >
              ✨ Explore features
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

