import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/main', label: '홈' },
  { path: '/tmi', label: 'TMI' },
];

export default function TopNav() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 border border-border p-1 rounded-lg">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex-1 flex items-center justify-center py-2 px-4 rounded-md text-body font-medium transition-all',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
