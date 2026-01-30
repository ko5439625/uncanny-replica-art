// Header component - now simplified as TopNav is replaced by AppSidebar
// This component is kept for backward compatibility but no longer used in main layout

import { useApp } from '@/contexts/AppContext';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const { data } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <span className="text-xl font-bold text-foreground tracking-tight">잠깐, 이거 맞아?</span>
          </div>

          {data.currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
              <span className="text-lg">{data.currentUser.emoji}</span>
              <span className="text-sm font-medium">{data.currentUser.nickname}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
