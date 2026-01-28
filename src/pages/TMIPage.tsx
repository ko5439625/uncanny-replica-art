import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
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
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-background border-b border-border">
        <div className="max-w-lg mx-auto flex">
          {(['anonymous', 'nickname'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 text-body font-medium relative transition-colors',
                activeTab === tab ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {tab === 'anonymous' ? '익명' : '닉네임'}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'anonymous' ? (
            <motion.div
              key="anonymous"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {data.tmiPosts.anonymous.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  아직 TMI가 없어요 😢<br />첫 번째 TMI를 올려보세요!
                </p>
              ) : (
                data.tmiPosts.anonymous.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-4 shadow-soft"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-lg">
                        👤
                      </span>
                      <span className="text-caption text-muted-foreground">익명</span>
                    </div>
                    <p className="text-body text-foreground mb-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-small text-muted-foreground">
                        {formatTimeAgo(post.timestamp)}
                      </span>
                      <button
                        onClick={() => likeAnonymousPost(post.id)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1 rounded-full transition-colors',
                          data.currentUser && post.likedBy.includes(data.currentUser.id)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground hover:text-primary'
                        )}
                      >
                        <Heart className={cn(
                          'w-4 h-4',
                          data.currentUser && post.likedBy.includes(data.currentUser.id) && 'fill-current'
                        )} />
                        <span className="text-small">{post.likes}</span>
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
              className="space-y-2"
            >
              {postsByUser.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  아직 TMI가 없어요 😢
                </p>
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
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xl">{user.emoji}</span>
                          <span className="text-body font-medium">{user.nickname}님</span>
                          <span className="text-caption text-muted-foreground">({posts.length})</span>
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
                                    <p className="text-small text-muted-foreground mb-1">
                                      {post.date}
                                    </p>
                                    <p className="text-body text-foreground mb-2">
                                      {post.content}
                                    </p>
                                    <div className="flex gap-2">
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
                                              'flex items-center gap-1 px-2 py-1 rounded-full text-small transition-colors',
                                              hasReacted
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground hover:bg-primary/5'
                                            )}
                                          >
                                            <span>{emoji}</span>
                                            {count > 0 && <span>{count}</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isCurrentUser && (
                              <div className="p-4 border-t border-border">
                                <Button
                                  onClick={() => setIsModalOpen(true)}
                                  variant="outline"
                                  className="w-full rounded-xl border-dashed"
                                >
                                  + TMI 추가
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

      {/* Floating Action Button */}
      {activeTab === 'anonymous' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-float flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Write Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>오늘의 TMI</span>
              <span>💭</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="여기에 TMI를 적어주세요..."
              className="min-h-[120px] rounded-xl resize-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newContent.trim()}
              className="w-full rounded-xl"
            >
              {activeTab === 'anonymous' ? '익명으로 올리기' : 'TMI 올리기'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
