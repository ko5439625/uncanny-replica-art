import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
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
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto px-4 py-4 space-y-4"
      >
        <motion.div variants={itemVariants}>
          <AnnouncementBanner />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Calendar />
        </motion.div>

        <motion.div variants={itemVariants}>
          <BalanceGame />
        </motion.div>

        <motion.div variants={itemVariants}>
          <RulesList />
        </motion.div>
      </motion.main>

      <BottomNav />
    </div>
  );
}
