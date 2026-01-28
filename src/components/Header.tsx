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

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast('다음에 또 만나요! 👋');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-3xl mx-auto px-4">
        {/* Top Row: Logo & User */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <span className="text-xl font-bold text-foreground tracking-tight">잠깐, 이거 맞아?</span>
          </div>

          {data.currentUser && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                <span className="text-lg">{data.currentUser.emoji}</span>
                <span className="text-caption font-medium">{data.currentUser.nickname}</span>
              </div>
              
              {/* 관리자만 설정 버튼 표시 */}
              {data.currentUser.isAdmin && (
                <button
                  onClick={handleSettings}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                  aria-label="설정"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
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
