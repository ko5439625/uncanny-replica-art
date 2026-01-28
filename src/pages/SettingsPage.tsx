import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    data,
    updateUser,
    addUser,
    deleteUser,
    addRule,
    updateRule,
    deleteRule,
    createBalanceGame,
    endBalanceGame,
    updateAnnouncement,
  } = useApp();

  // User management
  const [editingUser, setEditingUser] = useState<{ id: number; name: string; nickname: string; emoji: string } | null>(null);
  const [newUser, setNewUser] = useState({ name: '', nickname: '', emoji: '🙂' });
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Rule management
  const [editingRule, setEditingRule] = useState<{ id: number; text: string } | null>(null);
  const [newRuleText, setNewRuleText] = useState('');

  // Balance game
  const [newGame, setNewGame] = useState({ optionA: '', optionB: '' });

  // Announcement
  const [announcement, setAnnouncement] = useState({
    text: data.announcement.text,
    visible: data.announcement.visible,
  });

  // 관리자가 아니면 접근 불가
  if (!data.currentUser?.isAdmin) {
    navigate('/main');
    return null;
  }

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, {
        name: editingUser.name,
        nickname: editingUser.nickname,
        emoji: editingUser.emoji,
      });
      setEditingUser(null);
      toast.success('사용자 정보가 수정되었어요!');
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.nickname) {
      addUser(newUser.name, newUser.nickname, newUser.emoji);
      setNewUser({ name: '', nickname: '', emoji: '🙂' });
      setIsAddUserOpen(false);
      toast.success('새 사용자가 추가되었어요!');
    }
  };

  const handleDeleteUser = (id: number) => {
    if (id === 0) {
      toast.error('관리자 계정은 삭제할 수 없어요!');
      return;
    }
    if (confirm('정말 삭제할까요?')) {
      deleteUser(id);
      toast.success('사용자가 삭제되었어요');
    }
  };

  const handleAddRule = () => {
    if (newRuleText.trim()) {
      addRule(newRuleText.trim());
      setNewRuleText('');
      toast.success('새 룰이 추가되었어요!');
    }
  };

  const handleSaveRule = () => {
    if (editingRule) {
      updateRule(editingRule.id, editingRule.text);
      setEditingRule(null);
      toast.success('룰이 수정되었어요!');
    }
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('정말 삭제할까요?')) {
      deleteRule(id);
      toast.success('룰이 삭제되었어요');
    }
  };

  const handleCreateGame = () => {
    if (newGame.optionA.trim() && newGame.optionB.trim()) {
      createBalanceGame(newGame.optionA.trim(), newGame.optionB.trim());
      setNewGame({ optionA: '', optionB: '' });
      toast.success('새 밸런스 게임이 시작되었어요! ⚔️');
    }
  };

  const handleEndGame = () => {
    if (confirm('현재 게임을 종료할까요?')) {
      endBalanceGame();
      toast.success('게임이 종료되었어요');
    }
  };

  const handleSaveAnnouncement = () => {
    updateAnnouncement(announcement.text, announcement.visible);
    toast.success('공지사항이 저장되었어요!');
  };

  // 관리자 제외한 사용자 목록
  const memberUsers = data.users.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/main')}
            className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-xl font-bold text-foreground">설정</h1>
          </div>
          <span className="ml-auto px-2 py-1 bg-secondary rounded text-small text-muted-foreground">
            👑 관리자
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Users Section */}
        <section className="border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👥</span>
            <h2 className="text-lg font-bold text-foreground">멤버 관리</h2>
            <span className="text-caption text-muted-foreground ml-auto">{memberUsers.length}명</span>
          </div>

          <div className="space-y-2">
            {memberUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{user.emoji}</span>
                  <div>
                    <p className="text-body font-medium">{user.nickname}</p>
                    <p className="text-small text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser({
                    id: user.id,
                    name: user.name,
                    nickname: user.nickname,
                    emoji: user.emoji,
                  })}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAddUserOpen(true)}
            className="w-full mt-3 rounded-lg border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            멤버 추가
          </Button>
        </section>

        {/* Rules Section */}
        <section className="border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-bold text-foreground">룰 관리</h2>
          </div>

          <div className="space-y-2">
            {data.rules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-body flex-1">{rule.text}</p>
                <button
                  onClick={() => setEditingRule({ id: rule.id, text: rule.text })}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <Input
              value={newRuleText}
              onChange={e => setNewRuleText(e.target.value)}
              placeholder="새 룰 입력"
              className="rounded-lg"
            />
            <Button onClick={handleAddRule} className="rounded-lg shrink-0">
              추가
            </Button>
          </div>
        </section>

        {/* Balance Game Section */}
        <section className="border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚔️</span>
            <h2 className="text-lg font-bold text-foreground">밸런스 게임</h2>
          </div>

          {data.balanceGame.active && (
            <div className="p-4 bg-secondary/50 rounded-lg mb-4">
              <p className="text-caption text-muted-foreground mb-1">현재 진행 중</p>
              <p className="text-body font-medium mb-2">
                {data.balanceGame.active.optionA} vs {data.balanceGame.active.optionB}
              </p>
              <p className="text-small text-muted-foreground mb-3">
                투표: {data.balanceGame.active.votesA.length + data.balanceGame.active.votesB.length}명
              </p>
              <Button
                variant="outline"
                onClick={handleEndGame}
                className="w-full rounded-lg text-destructive border-destructive hover:bg-destructive/10"
              >
                게임 종료
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">새 게임 만들기</p>
            <Input
              value={newGame.optionA}
              onChange={e => setNewGame(prev => ({ ...prev, optionA: e.target.value }))}
              placeholder="A 옵션"
              className="rounded-lg"
            />
            <Input
              value={newGame.optionB}
              onChange={e => setNewGame(prev => ({ ...prev, optionB: e.target.value }))}
              placeholder="B 옵션"
              className="rounded-lg"
            />
            <Button
              onClick={handleCreateGame}
              disabled={!newGame.optionA.trim() || !newGame.optionB.trim()}
              className="w-full rounded-lg"
            >
              시작하기
            </Button>
          </div>
        </section>

        {/* Announcement Section */}
        <section className="border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📢</span>
            <h2 className="text-lg font-bold text-foreground">공지사항</h2>
          </div>

          <div className="space-y-3">
            <Textarea
              value={announcement.text}
              onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
              placeholder="공지 내용 입력"
              className="rounded-lg resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className="text-body">메인에 표시</span>
              <Switch
                checked={announcement.visible}
                onCheckedChange={checked => setAnnouncement(prev => ({ ...prev, visible: checked }))}
              />
            </div>
            <Button onClick={handleSaveAnnouncement} className="w-full rounded-lg">
              저장
            </Button>
          </div>
        </section>

        {/* Data Reset */}
        <section className="border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🗑️</span>
            <h2 className="text-lg font-bold text-foreground">데이터 관리</h2>
          </div>
          <p className="text-caption text-muted-foreground mb-3">
            ⚠️ 주의: 모든 데이터가 초기화됩니다
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('정말 모든 데이터를 초기화할까요? 이 작업은 되돌릴 수 없어요!')) {
                localStorage.removeItem('smalltalk-data');
                window.location.reload();
              }
            }}
            className="w-full rounded-lg text-destructive border-destructive hover:bg-destructive/10"
          >
            데이터 초기화
          </Button>
        </section>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="rounded-xl max-w-sm mx-4 bg-background border-border">
          <DialogHeader>
            <DialogTitle>멤버 수정</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">이모지</label>
                <Input
                  value={editingUser.emoji}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, emoji: e.target.value } : null)}
                  className="rounded-lg text-center text-2xl"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">실명</label>
                <Input
                  value={editingUser.name}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">닉네임</label>
                <Input
                  value={editingUser.nickname}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, nickname: e.target.value } : null)}
                  className="rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="flex-1 rounded-lg text-destructive border-destructive hover:bg-destructive/10"
                >
                  삭제
                </Button>
                <Button onClick={handleSaveUser} className="flex-1 rounded-lg">
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="rounded-xl max-w-sm mx-4 bg-background border-border">
          <DialogHeader>
            <DialogTitle>새 멤버 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">이모지</label>
              <Input
                value={newUser.emoji}
                onChange={e => setNewUser(prev => ({ ...prev, emoji: e.target.value }))}
                className="rounded-lg text-center text-2xl"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">실명</label>
              <Input
                value={newUser.name}
                onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-lg"
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">닉네임</label>
              <Input
                value={newUser.nickname}
                onChange={e => setNewUser(prev => ({ ...prev, nickname: e.target.value }))}
                className="rounded-lg"
                placeholder="길동이"
              />
            </div>
            <Button
              onClick={handleAddUser}
              disabled={!newUser.name || !newUser.nickname}
              className="w-full rounded-lg"
            >
              추가하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="rounded-xl max-w-sm mx-4 bg-background border-border">
          <DialogHeader>
            <DialogTitle>룰 수정</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <Input
                value={editingRule.text}
                onChange={e => setEditingRule(prev => prev ? { ...prev, text: e.target.value } : null)}
                className="rounded-lg"
              />
              <Button onClick={handleSaveRule} className="w-full rounded-lg">
                저장
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
