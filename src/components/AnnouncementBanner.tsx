import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function AnnouncementBanner() {
  const { data, updateAnnouncement } = useApp();

  if (!data.announcement.visible || !data.announcement.text) return null;

  const handleDismiss = () => {
    updateAnnouncement(data.announcement.text, false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-accent text-accent-foreground rounded-2xl p-4 shadow-soft relative"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-accent-foreground/10 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-2 pr-6">
        <span className="text-xl shrink-0">📢</span>
        <p className="text-body">{data.announcement.text}</p>
      </div>
    </motion.div>
  );
}
