import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Trash2, Users, Calendar, MessageSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const MEETING_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MeetingsPage() {
  const { data, loading, addMeetingRecord, deleteMeetingRecord } = useApp();
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetingRecords = data.meetingRecords || [];

  const recordsByMeeting = useMemo(() => {
    const grouped: Record<number, typeof meetingRecords> = {};
    MEETING_NUMBERS.forEach(num => {
      grouped[num] = meetingRecords
        .filter(r => r.meetingNumber === num)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    return grouped;
  }, [meetingRecords]);

  const handleSubmit = async () => {
    if (!newContent.trim() || isSubmitting) return;
    if (!selectedMeeting) return;

    setIsSubmitting(true);
    await addMeetingRecord(selectedMeeting, newContent.trim());
    setNewContent('');
    setIsSubmitting(false);
    toast.success('기록이 추가되었어요!');
  };

  const handleDelete = async (recordId: number) => {
    if (window.confirm('이 기록을 삭제할까요?')) {
      await deleteMeetingRecord(recordId);
      toast.success('삭제되었어요');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📝</div>
          <p className="text-muted-foreground">기록장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Meeting detail view
  if (selectedMeeting !== null) {
    const records = recordsByMeeting[selectedMeeting] || [];

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedMeeting(null)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{selectedMeeting}회차 모임 기록</h1>
          </div>

          {/* Records */}
          <div className="space-y-4 mb-24">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">아직 기록이 없어요</p>
                <p className="text-sm text-muted-foreground/70">첫 번째 기록을 남겨보세요!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {records.map(record => {
                  const user = data.users.find(u => u.id === record.userId);
                  const isOwner = data.currentUser?.id === record.userId;
                  const date = new Date(record.createdAt);
                  const formattedDate = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                          {user?.emoji || '😊'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {user?.nickname || '알 수 없음'}
                            </span>
                            <span className="text-xs text-muted-foreground">{formattedDate}</span>
                            {isOwner && (
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="ml-auto p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                            {record.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Input */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="기록을 남겨보세요..."
                  className="flex-1 resize-none min-h-[44px] max-h-32"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!newContent.trim() || isSubmitting}
                  size="icon"
                  className="h-11 w-11"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Meeting list view
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">📝 모임 기록장</h1>

        <div className="grid gap-3">
          {MEETING_NUMBERS.map(num => {
            const records = recordsByMeeting[num] || [];
            const recordCount = records.length;
            const lastRecord = records[records.length - 1];
            const participantIds = [...new Set(records.map(r => r.userId))];
            const participants = participantIds.map(id => data.users.find(u => u.id === id)).filter(Boolean);

            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedMeeting(num)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">{num}회차 모임</h2>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{recordCount}</span>
                  </div>
                </div>

                {recordCount > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex -space-x-1">
                        {participants.slice(0, 5).map(user => (
                          <span
                            key={user!.id}
                            className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs border-2 border-card"
                            title={user!.nickname}
                          >
                            {user!.emoji}
                          </span>
                        ))}
                        {participants.length > 5 && (
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">
                            +{participants.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    {lastRecord && (
                      <p className="text-sm text-muted-foreground truncate">
                        최근: {lastRecord.content.slice(0, 50)}
                        {lastRecord.content.length > 50 && '...'}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">아직 기록이 없어요</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
