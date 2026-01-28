import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Tab = 'anonymous' | 'nickname';

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (hours > 24) {
    return `${Math.floor(hours / 24)}일 전`;
  }
  if (hours > 0) {
    return `${hours}시간 전`;
  }
  if (minutes > 0) {
    return `${minutes}분 전`;
  }
  return '방금 전';
}

export default function TMIPage() {
  const { data, addAnonymousPost, likeAnonymousPost, addUserPost, reactToUserPost } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('anonymous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    
    if (activeTab === 'anonymous') {
      addAnonymousPost(newContent.trim());
    } else {
      addUserPost(newContent.trim());
    }
    
    setNewContent('');
    setIsModalOpen(false);
  };

  const toggleUser = (userId: number) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Group posts by user
  const postsByUser = data.users.map(user => ({
    user,
    posts: data.tmiPosts.byUser.filter(p => p.userId === user.id),
  })).filter(item => item.posts.length > 0 || item.user.id === data.currentUser?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Page Title & Write Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-h2 text-foreground">TMI 게시판 💬</h2>
            <p className="text-caption text-muted-foreground">일상을 공유해보세요</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            TMI 쓰기
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['anonymous', 'nickname'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-full text-body font-medium transition-all',
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab === 'anonymous' ? '👤 익명' : '😊 닉네임'}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'anonymous' ? (
            <motion.div
              key="anonymous"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {data.tmiPosts.anonymous.length === 0 ? (
                <div className="md:col-span-2 text-center py-16 bg-card rounded-2xl shadow-soft">
                  <p className="text-4xl mb-4">😢</p>
                  <p className="text-muted-foreground">아직 TMI가 없어요</p>
                  <p className="text-caption text-muted-foreground">첫 번째 TMI를 올려보세요!</p>
                </div>
              ) : (
                data.tmiPosts.anonymous.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl">
                        👤
                      </span>
                      <span className="text-body font-medium text-muted-foreground">익명</span>
                    </div>
                    <p className="text-body text-foreground mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-small text-muted-foreground">
                        {formatTimeAgo(post.timestamp)}
                      </span>
                      <button
                        onClick={() => likeAnonymousPost(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
                          data.currentUser && post.likedBy.includes(data.currentUser.id)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground hover:text-primary'
                        )}
                      >
                        <Heart className={cn(
                          'w-4 h-4',
                          data.currentUser && post.likedBy.includes(data.currentUser.id) && 'fill-current'
                        )} />
                        <span className="text-caption font-medium">{post.likes}</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="nickname"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {postsByUser.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
                  <p className="text-4xl mb-4">😢</p>
                  <p className="text-muted-foreground">아직 TMI가 없어요</p>
                </div>
              ) : (
                postsByUser.map(({ user, posts }) => {
                  const isExpanded = expandedUsers.includes(user.id);
                  const isCurrentUser = data.currentUser?.id === user.id;

                  return (
                    <div key={user.id} className="bg-card rounded-2xl shadow-soft overflow-hidden">
                      <button
                        onClick={() => toggleUser(user.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-2xl">{user.emoji}</span>
                          <span className="text-body font-medium">{user.nickname}님</span>
                          <span className="px-2 py-0.5 bg-muted rounded-full text-small text-muted-foreground">
                            {posts.length}개
                          </span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border"
                          >
                            {posts.length === 0 ? (
                              <p className="p-4 text-center text-caption text-muted-foreground">
                                아직 TMI가 없어요
                              </p>
                            ) : (
                              <div className="divide-y divide-border">
                                {posts.map(post => (
                                  <div key={post.id} className="p-4">
                                    <p className="text-small text-muted-foreground mb-2">
                                      📅 {post.date}
                                    </p>
                                    <p className="text-body text-foreground mb-3 leading-relaxed">
                                      {post.content}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      {(['👍', '🔥', '😂', '❤️'] as const).map(emoji => {
                                        const count = post.reactions[emoji].length;
                                        const hasReacted = data.currentUser
                                          ? post.reactions[emoji].includes(data.currentUser.id)
                                          : false;

                                        return (
                                          <button
                                            key={emoji}
                                            onClick={() => reactToUserPost(post.id, emoji)}
                                            className={cn(
                                              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption transition-colors',
                                              hasReacted
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground hover:bg-primary/5'
                                            )}
                                          >
                                            <span>{emoji}</span>
                                            {count > 0 && <span className="font-medium">{count}</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isCurrentUser && (
                              <div className="p-4 border-t border-border bg-muted/30">
                                <Button
                                  onClick={() => setIsModalOpen(true)}
                                  variant="outline"
                                  className="w-full rounded-xl border-dashed"
                                >
                                  + 나의 TMI 추가하기
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Write Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-h3">
              <span>오늘의 TMI</span>
              <span>💭</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="오늘 있었던 일, 생각, 느낌... 뭐든지 좋아요!"
              className="min-h-[140px] rounded-xl resize-none text-body"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newContent.trim()}
                className="flex-1 rounded-xl"
              >
                {activeTab === 'anonymous' ? '익명으로 올리기' : 'TMI 올리기'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-small text-muted-foreground">
            🗨️ 스몰토크 • 우리 모임 전용 웹사이트
          </p>
        </div>
      </footer>
    </div>
  );
}
