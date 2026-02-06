import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function Calendar() {
  const { data, toggleAvailability } = useApp();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth());
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= daysInMonth; i++) result.push(i);
    return result;
  }, [year, month]);

  const getDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getAvailabilityCount = (day: number) => {
    const dateKey = getDateKey(day);
    return (data.availability[dateKey] || []).length;
  };

  const selectedAvailability = selectedDate ? data.availability[selectedDate] || [] : [];
  const isUserAvailable = data.currentUser
    ? selectedAvailability.includes(data.currentUser.id)
    : false;

  // Find the date(s) with the most attendees this month
  const maxAttendees = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let maxCount = 0;
    const maxDates = new Set<string>();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${monthStr}-${String(d).padStart(2, '0')}`;
      const count = (data.availability[dateKey] || []).length;
      if (count > maxCount && count > 0) {
        maxCount = count;
        maxDates.clear();
        maxDates.add(dateKey);
      } else if (count === maxCount && count > 0) {
        maxDates.add(dateKey);
      }
    }
    return maxDates;
  }, [data.availability, year, month]);

  // 월별 일정 요약
  const monthSummary = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const summary: { day: number; attendees: number[] }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${monthStr}-${String(d).padStart(2, '0')}`;
      const attendees = data.availability[dateKey] || [];
      if (attendees.length > 0) {
        summary.push({ day: d, attendees });
      }
    }
    return summary;
  }, [data.availability, year, month]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 좌측: 캘린더 */}
        <div className="flex-1 border border-border rounded-xl p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 rounded-lg transition-colors border hover:bg-secondary border-border"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              {year}년 {month + 1}월
            </h3>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 rounded-lg transition-colors border hover:bg-secondary border-border"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  'text-center text-small font-medium py-2',
                  idx === 0 ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateKey = getDateKey(day);
              const isSelected = selectedDate === dateKey;
              const count = getAvailabilityCount(day);
              const availableUsers = data.availability[dateKey] || [];
              const isMostPopular = maxAttendees.has(dateKey);

              return (
                <motion.button
                  key={dateKey}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 relative transition-all border',
                    isSelected
                      ? 'bg-foreground text-background border-foreground'
                      : isMostPopular
                        ? 'bg-sky-400/30 border-sky-400 text-sky-900 dark:bg-sky-500/20 dark:border-sky-500 dark:text-sky-100'
                        : count >= 5
                          ? 'bg-secondary border-border/80'
                          : count >= 3
                            ? 'bg-secondary/60 border-border/50'
                            : count >= 1
                              ? 'bg-secondary/30 border-border/30'
                              : 'border-transparent hover:border-border'
                  )}
                >
                  <span className="text-caption font-medium">{day}</span>
                  {availableUsers.length > 0 && !isSelected && (
                    <span className="text-[10px] text-muted-foreground">{availableUsers.length}</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Date Info */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-body font-medium">
                    {parseInt(selectedDate.split('-')[1])}월 {parseInt(selectedDate.split('-')[2])}일
                  </span>
                </div>

                {/* 참석 / 불참 버튼 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      if (!isUserAvailable) toggleAvailability(selectedDate);
                    }}
                    className={cn(
                      'flex-1 py-2.5 rounded-lg text-small font-medium transition-all border',
                      isUserAvailable
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    )}
                  >
                    ✋ 참석
                  </button>
                  <button
                    onClick={() => {
                      if (isUserAvailable) toggleAvailability(selectedDate);
                    }}
                    className={cn(
                      'flex-1 py-2.5 rounded-lg text-small font-medium transition-all border',
                      !isUserAvailable
                        ? 'bg-red-100/70 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                        : 'border-border text-muted-foreground hover:bg-red-50/50 hover:text-red-600 hover:border-red-200'
                    )}
                  >
                    ❌ 불참
                  </button>
                </div>

                {/* 참석자 */}
                {selectedAvailability.length > 0 && (
                  <div>
                    <p className="text-small text-muted-foreground mb-1.5">✋ 참석 ({selectedAvailability.length}명)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAvailability.map(userId => {
                        const user = data.users.find(u => u.id === userId);
                        return user ? (
                          <span key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-small">
                            {user.emoji} {user.nickname}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 우측: 월별 일정 요약 */}
        <div className="lg:w-72 border border-border rounded-xl p-5">
          <h3 className="text-body font-bold mb-4">{month + 1}월 일정</h3>

          {monthSummary.length === 0 ? (
            <p className="text-small text-muted-foreground text-center py-6">등록된 일정이 없어요</p>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
              {monthSummary.map(({ day, attendees }) => (
                <div key={day} className="px-3 py-2.5 rounded-lg bg-secondary/40">
                  <p className="text-small font-semibold mb-1.5">{day}일</p>
                  <div className="flex flex-wrap gap-1">
                    {attendees.map(userId => {
                      const user = data.users.find(u => u.id === userId);
                      return user ? (
                        <span key={userId} className="text-[11px] text-muted-foreground">
                          ✋{user.emoji}{user.nickname}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
