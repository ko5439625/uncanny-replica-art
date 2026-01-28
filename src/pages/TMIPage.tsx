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
import { toast } from 'sonner';

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
    if (!newContent.trim()) {
      toast.error('내용을 입력해주세요!');
      return;
    }
    
    if (activeTab === 'anonymous') {
      addAnonymousPost(newContent.trim());
      toast.success('익명 TMI가 올라갔어요! 🎭');
    } else {
      addUserPost(newContent.trim());
      toast.success('TMI가 올라갔어요! ✨');
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

  // Group posts by user - include all users with posts, plus current user
  const postsByUser = data.users
    .map(user => ({
      user,
      posts: data.tmiPosts.byUser.filter(p => p.userId === user.id),
    }))
    .filter(item => item.posts.length > 0 || item.user.id === data.currentUser?.id)
    .sort((a, b) => {
      // Current user first
      if (a.user.id === data.currentUser?.id) return -1;
      if (b.user.id === data.currentUser?.id) return 1;
      // Then by post count
      return b.posts.length - a.posts.length;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Page Title & Write Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">TMI</h2>
            <p className="text-caption text-muted-foreground">일상을 공유해보세요</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg gap-2"
          >
            <Plus className="w-4 h-4" />
            글쓰기
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['anonymous', 'nickname'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-body font-medium transition-all border',
                activeTab === tab
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground'
              )}
            >
              {tab === 'anonymous' ? '익명' : '닉네임'}
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
                <div className="md:col-span-2 text-center py-16 border border-dashed border-border rounded-2xl">
                  <p className="text-4xl mb-4">📝</p>
                  <p className="text-muted-foreground">아직 TMI가 없어요</p>
                  <p className="text-caption text-muted-foreground mb-4">첫 번째 TMI를 올려보세요!</p>
                  <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-lg">
                    TMI 쓰기
                  </Button>
                </div>
              ) : (
                data.tmiPosts.anonymous.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl">
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
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border',
                          data.currentUser && post.likedBy.includes(data.currentUser.id)
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-background text-muted-foreground border-border hover:border-foreground'
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
                <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                  <p className="text-4xl mb-4">📝</p>
                  <p className="text-muted-foreground">아직 TMI가 없어요</p>
                  <p className="text-caption text-muted-foreground mb-4">첫 번째 TMI를 올려보세요!</p>
                  <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-lg">
                    TMI 쓰기
                  </Button>
                </div>
              ) : (
                postsByUser.map(({ user, posts }) => {
                  const isExpanded = expandedUsers.includes(user.id);
                  const isCurrentUser = data.currentUser?.id === user.id;

                  return (
                    <div key={user.id} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleUser(user.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-2xl">{user.emoji}</span>
                          <span className="text-body font-medium">
                            {user.nickname}
                            {isCurrentUser && <span className="text-muted-foreground ml-1">(나)</span>}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary rounded text-small text-muted-foreground">
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
                              <div className="p-6 text-center">
                                <p className="text-caption text-muted-foreground mb-3">
                                  아직 TMI가 없어요
                                </p>
                                {isCurrentUser && (
                                  <Button
                                    onClick={() => setIsModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg"
                                  >
                                    첫 TMI 쓰기
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="divide-y divide-border">
                                {posts.map(post => (
                                  <div key={post.id} className="p-4">
                                    <p className="text-small text-muted-foreground mb-2">
                                      {post.date}
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
                                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption transition-colors border',
                                              hasReacted
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'bg-background text-muted-foreground border-border hover:border-foreground'
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

                                {isCurrentUser && (
                                  <div className="p-4 bg-secondary/50">
                                    <Button
                                      onClick={() => setIsModalOpen(true)}
                                      variant="outline"
                                      className="w-full rounded-lg border-dashed"
                                    >
                                      + TMI 추가하기
                                    </Button>
                                  </div>
                                )}
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
        <DialogContent className="rounded-xl max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {activeTab === 'anonymous' ? '익명 TMI 쓰기' : 'TMI 쓰기'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-caption text-muted-foreground">
              {activeTab === 'anonymous' 
                ? '익명으로 올라가요. 누군지 아무도 몰라요! 🎭'
                : `${data.currentUser?.emoji} ${data.currentUser?.nickname}님으로 올라가요`
              }
            </div>
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="오늘 있었던 일, 생각, 느낌... 뭐든지 좋아요!"
              className="min-h-[140px] rounded-lg resize-none text-body"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewContent('');
                  setIsModalOpen(false);
                }}
                className="flex-1 rounded-lg"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newContent.trim()}
                className="flex-1 rounded-lg"
              >
                올리기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-small text-muted-foreground">
            💬 Small Talk
          </p>
        </div>
      </footer>
    </div>
  );
}
