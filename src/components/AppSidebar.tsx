import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Settings, Menu, X, LogOut, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_ITEMS = [
  { path: '/main', label: '메인', icon: Home },
  { path: '/tmi', label: 'TMI', icon: MessageCircle },
  { path: '/meetings', label: '모임 기록장', icon: BookOpen },
];

interface AppSidebarProps {
  onLogout: () => void;
  onPasswordChange: () => void;
}

export default function AppSidebar({ onLogout, onPasswordChange }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useApp();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const allNavItems = data.currentUser?.isAdmin
    ? [...NAV_ITEMS, { path: '/settings', label: '설정', icon: Settings }]
    : NAV_ITEMS;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const SidebarContent = ({ expanded }: { expanded: boolean }) => (
    <div className="flex flex-col h-full py-4">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 mb-6 transition-all duration-200",
        expanded ? "justify-start" : "justify-center"
      )}>
        <span className="text-2xl">💬</span>
        {expanded && (
          <span className="text-lg font-bold text-foreground whitespace-nowrap overflow-hidden">
            잠깐, 이거 맞아?
          </span>
        )}
      </div>

      {/* User Info */}
      {data.currentUser && expanded && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <span className="text-lg">{data.currentUser.emoji}</span>
            <span className="text-sm font-medium">
              {data.currentUser.nickname}
              <span className="text-muted-foreground ml-1">({data.currentUser.name})</span>
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {allNavItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                expanded ? "justify-start" : "justify-center",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-1 px-2 mt-auto pt-4 border-t border-border">
        <button
          onClick={() => {
            onPasswordChange();
            setIsOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <Key className="w-5 h-5 flex-shrink-0" />
          {expanded && <span className="text-sm font-medium">비밀번호 변경</span>}
        </button>
        <button
          onClick={() => {
            onLogout();
            setIsOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {expanded && <span className="text-sm font-medium">로그아웃</span>}
        </button>
      </div>
    </div>
  );

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
          <div className="flex items-center justify-between px-3 py-2 min-h-[48px]">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground flex-shrink-0">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SidebarContent expanded={true} />
                </SheetContent>
              </Sheet>
              <span className="text-lg flex-shrink-0">💬</span>
              <span className="text-sm font-bold truncate">잠깐, 이거 맞아?</span>
            </div>
            {data.currentUser && (
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full flex-shrink-0 ml-2">
                <span className="text-sm">{data.currentUser.emoji}</span>
                <span className="text-xs font-medium whitespace-nowrap">{data.currentUser.nickname}</span>
              </div>
            )}
          </div>
        </header>
        {/* Spacer for fixed header */}
        <div className="h-[48px]" />
      </>
    );
  }

  // Desktop: Hover-expand sidebar
  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-0 left-0 h-full bg-background border-r border-border transition-all duration-200 z-50",
        isHovered ? "w-56" : "w-16"
      )}
    >
      <SidebarContent expanded={isHovered} />
    </aside>
  );
}
