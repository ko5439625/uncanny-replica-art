import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const WELCOME_MESSAGES = [
  "오늘도 왔구나, {nickname}! 🎉",
  "{nickname}, 반가워! 오늘 하루도 파이팅 💪",
  "어서와 {nickname}! 오늘은 무슨 TMI가 있어? 👀",
  "{nickname} 등장! 모두 주목~ 🌟",
  "{nickname}~ 오늘도 힘내자! ✨",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { data, login, loading, verifyPassword } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bounce">💬</div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const handleLogin = async () => {
    if (!selectedUserId) {
      setError('닉네임을 선택해주세요');
      return;
    }

    const user = data.users.find(u => u.id === Number(selectedUserId));
    if (!user) {
      setError('사용자를 찾을 수 없어요');
      return;
    }

    setIsLoggingIn(true);
    
    // DB에서 비밀번호 검증
    const isValid = await verifyPassword(user.id, password);
    
    if (!isValid) {
      setError('비밀번호가 틀렸어요 😢');
      setIsLoggingIn(false);
      return;
    }

    login(user.id);
    const message = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
      .replace('{nickname}', user.nickname);
    toast.success(message);
    navigate('/main');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">잠깐, 이거 맞아?</h1>
          <p className="text-caption text-muted-foreground mt-2">우리 모임 전용 공간</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-2">
            <label className="text-caption text-muted-foreground">닉네임</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-background border-border text-body">
                <SelectValue placeholder="닉네임 선택" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {data.users.map(user => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.emoji} {user.nickname}
                    {user.isAdmin && <span className="ml-2 text-muted-foreground">(관리자)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-caption text-muted-foreground">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={e => e.key === 'Enter' && !isLoggingIn && handleLogin()}
              className="h-12 rounded-xl bg-background border-border text-body"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-caption text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 rounded-xl text-body font-semibold btn-press bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoggingIn ? '로그인 중...' : '로그인'}
          </Button>
        </motion.div>

        {/* Hint */}
        <motion.p
          className="text-center text-small text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          10명의 소규모 모임을 위한 공간
        </motion.p>
      </motion.div>
    </div>
  );
}
