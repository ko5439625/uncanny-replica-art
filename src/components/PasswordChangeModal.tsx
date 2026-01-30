import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  verifyPassword: (userId: number, password: string) => Promise<boolean>;
  changePassword: (userId: number, newPassword: string) => Promise<void>;
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
  userId,
  verifyPassword,
  changePassword,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async () => {
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
    const isValid = await verifyPassword(userId, currentPassword);
    if (!isValid) {
      setPasswordError('현재 비밀번호가 틀렸어요');
      setIsChanging(false);
      return;
    }

    // 비밀번호 변경
    await changePassword(userId, newPassword);
    
    setIsChanging(false);
    handleClose();
    toast.success('비밀번호가 변경되었어요! 🔐');
  };

  const handleClose = () => {
    onClose();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl max-w-sm mx-4 bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">비밀번호 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">현재 비밀번호</label>
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
            <label className="text-sm text-muted-foreground">새 비밀번호</label>
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
            <label className="text-sm text-muted-foreground">새 비밀번호 확인</label>
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
            <p className="text-sm text-destructive">{passwordError}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
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
  );
}
