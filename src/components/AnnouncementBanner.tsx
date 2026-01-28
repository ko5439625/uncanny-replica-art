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
      className="bg-foreground text-background rounded-xl p-4 relative"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-background/10 rounded transition-colors"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="text-xl shrink-0">📢</span>
        <p className="text-body">{data.announcement.text}</p>
      </div>
    </motion.div>
  );
}
