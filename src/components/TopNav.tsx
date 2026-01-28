import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/main', label: '홈', emoji: '🏠' },
  { path: '/tmi', label: 'TMI', emoji: '💬' },
];

export default function TopNav() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 bg-muted/50 p-1 rounded-xl">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-body font-medium transition-all relative',
              isActive
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-card rounded-lg shadow-soft"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.emoji}</span>
            <span className="relative z-10">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
