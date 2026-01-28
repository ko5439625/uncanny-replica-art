import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import TopNav from './TopNav';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const navigate = useNavigate();
  const { data, logout } = useApp();
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 10) {
      toast.success('🔓 관리자 모드 활성화!');
      navigate('/settings');
      setClickCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast('다음에 또 만나요! 👋');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-3xl mx-auto px-4">
        {/* Top Row: Logo & User */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 select-none"
          >
            <span className="text-2xl">🗨️</span>
            <div>
              <h1 className="text-h3 text-foreground leading-tight">스몰토크</h1>
              <p className="text-small text-muted-foreground">Small Talk</p>
            </div>
          </button>

          {data.currentUser && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border">
                <span className="text-lg">{data.currentUser.emoji}</span>
                <span className="text-caption font-medium">{data.currentUser.nickname}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                aria-label="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        {showNav && (
          <div className="pb-3">
            <TopNav />
          </div>
        )}
      </div>
    </header>
  );
}
