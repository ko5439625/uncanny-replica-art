import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Key } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import TopNav from './TopNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const navigate = useNavigate();
  const { data, logout, verifyPassword, changePassword } = useApp();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast('다음에 또 만나요! 👋');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handlePasswordChange = async () => {
    if (!data.currentUser) return;

    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요');
      return;
    }

    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('비밀번호는 4자리 이상이어야 해요');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않아요');
      return;
    }

    setIsChanging(true);

    // 현재 비밀번호 확인
    const isValid = await verifyPassword(data.currentUser.id, currentPassword);
    if (!isValid) {
      setPasswordError('현재 비밀번호가 틀렸어요');
      setIsChanging(false);
      return;
    }

    // 비밀번호 변경
    await changePassword(data.currentUser.id, newPassword);
    
    setIsChanging(false);
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('비밀번호가 변경되었어요! 🔐');
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <>
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
                
                {/* 비밀번호 변경 버튼 */}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                  aria-label="비밀번호 변경"
                  title="비밀번호 변경"
                >
                  <Key className="w-5 h-5" />
                </button>
                
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

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={closePasswordModal}>
        <DialogContent className="rounded-xl max-w-sm mx-4 bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">비밀번호 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">현재 비밀번호</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => {
                  setCurrentPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="현재 비밀번호 입력"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">새 비밀번호</label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="새 비밀번호 입력 (4자리 이상)"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">새 비밀번호 확인</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="새 비밀번호 다시 입력"
                className="rounded-lg"
              />
            </div>

            {passwordError && (
              <p className="text-caption text-destructive">{passwordError}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={closePasswordModal}
                className="flex-1 rounded-lg"
              >
                취소
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isChanging}
                className="flex-1 rounded-lg"
              >
                {isChanging ? '변경 중...' : '변경하기'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
