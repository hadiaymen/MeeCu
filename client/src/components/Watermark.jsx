import { motion } from 'framer-motion';

export default function Watermark() {
  return (
    <div className="fixed bottom-[88px] left-0 right-0 z-[9999] flex justify-center pointer-events-none" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <motion.div 
        className="watermark-glass watermark-wobble pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="watermark-dot"></div>
        <span className="watermark-text">Powered by imen</span>
      </motion.div>
    </div>
  );
}
