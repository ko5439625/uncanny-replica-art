import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/main', label: '메인', icon: Home, emoji: '🏠' },
  { path: '/tmi', label: 'TMI', icon: MessageCircle, emoji: '💬' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center py-3 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-xl mb-0.5">{item.emoji}</span>
              <span
                className={cn(
                  'text-small transition-colors',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
