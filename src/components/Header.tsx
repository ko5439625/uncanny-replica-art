import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
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
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 select-none"
        >
          <span className="text-xl">🗨️</span>
          <span className="text-h3 text-foreground">스몰토크</span>
        </button>

        {showLogout && data.currentUser && (
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-foreground">
              {data.currentUser.emoji} {data.currentUser.nickname}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
