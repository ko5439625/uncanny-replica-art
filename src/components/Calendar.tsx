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

  const getAvailabilityLevel = (day: number) => {
    const dateKey = getDateKey(day);
    const count = data.availability[dateKey]?.length || 0;
    if (count >= 5) return 'high';
    if (count >= 3) return 'medium';
    if (count >= 1) return 'low';
    return 'none';
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
    <div className="border border-border rounded-xl p-5">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={cn(
            'p-2 rounded-lg transition-colors border',
            canGoPrev ? 'hover:bg-secondary border-border' : 'text-muted-foreground/30 border-transparent'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-foreground">
          {year}년 {month + 1}월
        </h3>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            'p-2 rounded-lg transition-colors border',
            canGoNext ? 'hover:bg-secondary border-border' : 'text-muted-foreground/30 border-transparent'
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
              idx === 0 ? 'text-destructive' : idx === 6 ? 'text-muted-foreground' : 'text-muted-foreground'
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
          const level = getAvailabilityLevel(day);
          const availableUsers = data.availability[dateKey] || [];

          return (
            <motion.button
              key={dateKey}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 relative transition-all border',
                isSelected
                  ? 'bg-foreground text-background border-foreground'
                  : level === 'high'
                    ? 'bg-foreground/10 border-foreground/20'
                    : level === 'medium'
                      ? 'bg-secondary border-border'
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
              <span className="text-caption text-muted-foreground">
                {selectedAvailability.length}명 가능
              </span>
            </div>

            {selectedAvailability.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedAvailability.map(userId => {
                  const user = data.users.find(u => u.id === userId);
                  return user ? (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-small"
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
              className="w-full rounded-lg"
            >
              {isUserAvailable ? '참여 취소' : '참여 가능'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
