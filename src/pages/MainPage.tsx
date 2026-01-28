import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import BalanceGame from '@/components/BalanceGame';
import RulesList from '@/components/RulesList';
import AnnouncementBanner from '@/components/AnnouncementBanner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MainPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 py-6"
      >
        <motion.div variants={itemVariants}>
          <AnnouncementBanner />
        </motion.div>

        {/* 캘린더 - 크게 */}
        <motion.div variants={itemVariants} className="mt-4">
          <Calendar />
        </motion.div>

        {/* 밸런스 게임 */}
        <motion.div variants={itemVariants} className="mt-4">
          <BalanceGame />
        </motion.div>

        {/* 우리의 룰 - 하이라이트 */}
        <motion.div variants={itemVariants} className="mt-4">
          <RulesList />
        </motion.div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-small text-muted-foreground">
            💬 Small Talk
          </p>
        </div>
      </footer>
    </div>
  );
}
