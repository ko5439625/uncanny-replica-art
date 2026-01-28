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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/main')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-h3 text-foreground">설정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Users Section */}
        <section className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👥</span>
            <h2 className="text-h3 text-foreground">사용자 관리</h2>
          </div>

          <div className="space-y-2">
            {data.users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
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
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAddUserOpen(true)}
            className="w-full mt-3 rounded-xl border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            사용자 추가
          </Button>
        </section>

        {/* Rules Section */}
        <section className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📜</span>
            <h2 className="text-h3 text-foreground">룰 관리</h2>
          </div>

          <div className="space-y-2">
            {data.rules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-body flex-1">{rule.text}</p>
                <button
                  onClick={() => setEditingRule({ id: rule.id, text: rule.text })}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
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
              className="rounded-xl"
            />
            <Button onClick={handleAddRule} className="rounded-xl shrink-0">
              추가
            </Button>
          </div>
        </section>

        {/* Balance Game Section */}
        <section className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚔️</span>
            <h2 className="text-h3 text-foreground">밸런스 게임</h2>
          </div>

          {data.balanceGame.active && (
            <div className="p-3 bg-muted/50 rounded-xl mb-4">
              <p className="text-caption text-muted-foreground mb-1">현재 진행 중</p>
              <p className="text-body font-medium">
                {data.balanceGame.active.optionA} vs {data.balanceGame.active.optionB}
              </p>
              <Button
                variant="outline"
                onClick={handleEndGame}
                className="w-full mt-2 rounded-xl text-destructive border-destructive hover:bg-destructive/10"
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
              className="rounded-xl"
            />
            <Input
              value={newGame.optionB}
              onChange={e => setNewGame(prev => ({ ...prev, optionB: e.target.value }))}
              placeholder="B 옵션"
              className="rounded-xl"
            />
            <Button
              onClick={handleCreateGame}
              disabled={!newGame.optionA.trim() || !newGame.optionB.trim()}
              className="w-full rounded-xl"
            >
              시작하기
            </Button>
          </div>
        </section>

        {/* Announcement Section */}
        <section className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📢</span>
            <h2 className="text-h3 text-foreground">공지사항</h2>
          </div>

          <div className="space-y-3">
            <Textarea
              value={announcement.text}
              onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
              placeholder="공지 내용 입력"
              className="rounded-xl resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className="text-body">메인에 표시</span>
              <Switch
                checked={announcement.visible}
                onCheckedChange={checked => setAnnouncement(prev => ({ ...prev, visible: checked }))}
              />
            </div>
            <Button onClick={handleSaveAnnouncement} className="w-full rounded-xl">
              저장
            </Button>
          </div>
        </section>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>사용자 수정</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">이모지</label>
                <Input
                  value={editingUser.emoji}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, emoji: e.target.value } : null)}
                  className="rounded-xl text-center text-2xl"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">실명</label>
                <Input
                  value={editingUser.name}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-muted-foreground">닉네임</label>
                <Input
                  value={editingUser.nickname}
                  onChange={e => setEditingUser(prev => prev ? { ...prev, nickname: e.target.value } : null)}
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="flex-1 rounded-xl text-destructive border-destructive hover:bg-destructive/10"
                >
                  삭제
                </Button>
                <Button onClick={handleSaveUser} className="flex-1 rounded-xl">
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">이모지</label>
              <Input
                value={newUser.emoji}
                onChange={e => setNewUser(prev => ({ ...prev, emoji: e.target.value }))}
                className="rounded-xl text-center text-2xl"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">실명</label>
              <Input
                value={newUser.name}
                onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <label className="text-caption text-muted-foreground">닉네임</label>
              <Input
                value={newUser.nickname}
                onChange={e => setNewUser(prev => ({ ...prev, nickname: e.target.value }))}
                className="rounded-xl"
                placeholder="길동이"
              />
            </div>
            <Button
              onClick={handleAddUser}
              disabled={!newUser.name || !newUser.nickname}
              className="w-full rounded-xl"
            >
              추가하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>룰 수정</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <Input
                value={editingRule.text}
                onChange={e => setEditingRule(prev => prev ? { ...prev, text: e.target.value } : null)}
                className="rounded-xl"
              />
              <Button onClick={handleSaveRule} className="w-full rounded-xl">
                저장
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
