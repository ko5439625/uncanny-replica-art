import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MIN_MONTH = new Date(2025, 1); // Feb 2025
const MAX_MONTH = new Date(2025, 5); // Jun 2025

export default function Calendar() {
  const { data, toggleAvailability } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1)); // Feb 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const canGoPrev = currentDate > MIN_MONTH;
  const canGoNext = currentDate < MAX_MONTH;

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= daysInMonth; i++) result.push(i);
    
    return result;
  }, [year, month]);

  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAvailabilityColor = (day: number) => {
    const dateKey = getDateKey(day);
    const count = data.availability[dateKey]?.length || 0;
    if (count >= 5) return 'bg-success';
    if (count >= 3) return 'bg-warning';
    return 'bg-muted';
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentDate(new Date(year, month - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentDate(new Date(year, month + 1));
    }
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(getDateKey(day));
  };

  const handleToggle = () => {
    if (selectedDate) {
      toggleAvailability(selectedDate);
    }
  };

  const selectedAvailability = selectedDate
    ? data.availability[selectedDate] || []
    : [];

  const isUserAvailable = data.currentUser
    ? selectedAvailability.includes(data.currentUser.id)
    : false;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={cn(
            'p-2 rounded-full transition-colors',
            canGoPrev ? 'hover:bg-muted text-foreground' : 'text-muted-foreground/30'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-h3 text-foreground">
          {year}년 {month + 1}월
        </h3>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            'p-2 rounded-full transition-colors',
            canGoNext ? 'hover:bg-muted text-foreground' : 'text-muted-foreground/30'
          )}
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
              idx === 0 ? 'text-destructive' : idx === 6 ? 'text-secondary' : 'text-muted-foreground'
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
          const availableUsers = data.availability[dateKey] || [];

          return (
            <motion.button
              key={dateKey}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 relative transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : 'hover:bg-muted'
              )}
            >
              <span className="text-caption font-medium">{day}</span>
              {availableUsers.length > 0 && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isSelected ? 'bg-primary-foreground' : getAvailabilityColor(day)
                  )}
                />
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
                선택한 날짜: {parseInt(selectedDate.split('-')[1])}월 {parseInt(selectedDate.split('-')[2])}일
              </span>
              <span className="text-caption text-muted-foreground">
                {selectedAvailability.length}명 참여 가능
              </span>
            </div>

            {selectedAvailability.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedAvailability.map(userId => {
                  const user = data.users.find(u => u.id === userId);
                  return user ? (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-small"
                    >
                      {user.emoji} {user.nickname}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <Button
              onClick={handleToggle}
              variant={isUserAvailable ? 'outline' : 'default'}
              className={cn(
                'w-full rounded-xl',
                isUserAvailable
                  ? 'border-primary text-primary hover:bg-primary/10'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              {isUserAvailable ? '참여 취소하기 😢' : '나도 참여 가능! 🙋'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
