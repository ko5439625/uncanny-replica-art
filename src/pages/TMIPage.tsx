import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, ChevronDown, ChevronRight, Send, Clock } from 'lucide-react';
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * ONE_DAY_MS;

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

function isOlderThanOneDay(timestamp: string): boolean {
  return Date.now() - new Date(timestamp).getTime() > ONE_DAY_MS;
}

function isWithinThreeDays(timestamp: string): boolean {
  return Date.now() - new Date(timestamp).getTime() <= THREE_DAYS_MS;
}

export default function TMIPage() {
  const { data, addAnonymousPost, likeAnonymousPost, addUserPost, reactToUserPost } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('anonymous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
  const [anonymousInput, setAnonymousInput] = useState('');
  const [showOldMessages, setShowOldMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 익명 채팅 스크롤 하단으로
  useEffect(() => {
    if (activeTab === 'anonymous') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data.tmiPosts.anonymous.length, activeTab]);

  const handleSubmitAnonymous = () => {
    if (!anonymousInput.trim()) return;
    addAnonymousPost(anonymousInput.trim());
    setAnonymousInput('');
    toast.success('익명 메시지 전송! 🎭');
  };

  const handleSubmitNickname = () => {
    if (!newContent.trim()) {
      toast.error('내용을 입력해주세요!');
      return;
    }
    addUserPost(newContent.trim());
    toast.success('TMI가 올라갔어요! ✨');
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

  // 모든 사용자의 게시물 (관리자 제외)
  const postsByUser = data.users
    .filter(u => !u.isAdmin)
    .map(user => ({
      user,
      posts: data.tmiPosts.byUser.filter(p => p.userId === user.id),
    }))
    .sort((a, b) => {
      if (a.user.id === data.currentUser?.id) return -1;
      if (b.user.id === data.currentUser?.id) return 1;
      return b.posts.length - a.posts.length;
    });

  // 익명 게시물 분류 (3일 이내만 보관)
  const { recentPosts, oldPosts } = useMemo(() => {
    const validPosts = data.tmiPosts.anonymous.filter(p => isWithinThreeDays(p.timestamp));
    const recent = validPosts.filter(p => !isOlderThanOneDay(p.timestamp));
    const old = validPosts.filter(p => isOlderThanOneDay(p.timestamp));
    
    return {
      recentPosts: recent.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      oldPosts: old.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    };
  }, [data.tmiPosts.anonymous]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
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
              {tab === 'anonymous' ? '익명 채팅' : '닉네임'}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'anonymous' ? (
            <motion.div
              key="anonymous"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Chat Messages - iMessage Style */}
              <div className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-[400px] max-h-[60vh] custom-scrollbar">
                {/* Old Messages Toggle */}
                {oldPosts.length > 0 && (
                  <button
                    onClick={() => setShowOldMessages(!showOldMessages)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    {showOldMessages ? '지난 이야기 숨기기' : `지난 이야기 보기 (${oldPosts.length}개)`}
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showOldMessages && 'rotate-180')} />
                  </button>
                )}

                {/* Old Messages */}
                <AnimatePresence>
                  {showOldMessages && oldPosts.map(post => (
                    <MessageBubble
                      key={post.id}
                      post={post}
                      isMyPost={post.authorId === data.currentUser?.id}
                      hasLiked={data.currentUser ? post.likedBy.includes(data.currentUser.id) : false}
                      onLike={() => likeAnonymousPost(post.id)}
                      isOld
                    />
                  ))}
                </AnimatePresence>

                {/* Divider */}
                {showOldMessages && oldPosts.length > 0 && recentPosts.length > 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-small text-muted-foreground">오늘</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                )}

                {/* Recent Messages */}
                {recentPosts.length === 0 && oldPosts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">첫 번째 익명 메시지를 보내보세요!</p>
                  </div>
                ) : (
                  recentPosts.map(post => (
                    <MessageBubble
                      key={post.id}
                      post={post}
                      isMyPost={post.authorId === data.currentUser?.id}
                      hasLiked={data.currentUser ? post.likedBy.includes(data.currentUser.id) : false}
                      onLike={() => likeAnonymousPost(post.id)}
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar - iMessage Style */}
              <div className="border-t border-border pt-3 mt-auto">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={anonymousInput}
                      onChange={e => setAnonymousInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitAnonymous()}
                      placeholder="익명 메시지 입력..."
                      className="w-full px-4 py-3 bg-[hsl(var(--imessage-gray))] rounded-full text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--imessage-blue))]/30"
                    />
                  </div>
                  <button
                    onClick={handleSubmitAnonymous}
                    disabled={!anonymousInput.trim()}
                    className={cn(
                      'p-3 rounded-full transition-colors',
                      anonymousInput.trim()
                        ? 'bg-[hsl(var(--imessage-blue))] text-white'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-center text-[11px] text-muted-foreground mt-2">
                  메시지는 24시간 후 지난 이야기로, 3일 후 자동 삭제돼요
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="nickname"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Write Button */}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-lg gap-2 mb-4"
              >
                <Plus className="w-4 h-4" />
                TMI 쓰기
              </Button>

              {/* All Users List */}
              {postsByUser.map(({ user, posts }) => {
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
                              <p className="text-caption text-muted-foreground">
                                아직 TMI가 없어요
                              </p>
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
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Write Modal for Nickname Tab */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-xl max-w-md mx-4 bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">TMI 쓰기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-caption text-muted-foreground">
              {data.currentUser?.emoji} {data.currentUser?.nickname}님으로 올라가요
            </div>
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="오늘 있었던 일, 생각, 느낌... 뭐든지 좋아요!"
              className="min-h-[140px] rounded-lg resize-none text-body bg-background border-border"
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
                onClick={handleSubmitNickname}
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
      <footer className="border-t border-border py-4 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-small text-muted-foreground">💬 잠깐, 이거 맞아?</p>
        </div>
      </footer>
    </div>
  );
}

// 메시지 버블 컴포넌트
function MessageBubble({ 
  post, 
  isMyPost, 
  hasLiked, 
  onLike,
  isOld = false 
}: { 
  post: { id: number; content: string; timestamp: string; likes: number };
  isMyPost: boolean;
  hasLiked: boolean;
  onLike: () => void;
  isOld?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isOld ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex', isMyPost ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('max-w-[80%] group', isMyPost ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl',
          isMyPost 
            ? 'bg-[hsl(var(--imessage-blue))] text-white rounded-br-md' 
            : 'bg-[hsl(var(--imessage-gray))] text-foreground rounded-bl-md'
        )}>
          <p className="text-body leading-relaxed">{post.content}</p>
        </div>
        <div className={cn(
          'flex items-center gap-2 mt-1 px-1',
          isMyPost ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-[11px] text-muted-foreground">
            {formatTimeAgo(post.timestamp)}
          </span>
          <button
            onClick={onLike}
            className={cn(
              'flex items-center gap-1 text-[11px] transition-colors',
              hasLiked ? 'text-[hsl(var(--imessage-blue))]' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Heart className={cn('w-3 h-3', hasLiked && 'fill-current')} />
            {post.likes > 0 && post.likes}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
