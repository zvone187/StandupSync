import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Standup } from '@/types/standup';
import { countBlockers } from '@/utils/standupUtils';
import { formatDateForAPI } from '@/utils/dateUtils';

interface WeekNavigationProps {
  weekDays: Date[];
  selectedDate: Date | null;
  weekOffset: number;
  onDateSelect: (date: Date) => void;
  onWeekChange: (offset: number) => void;
  canGoBack: boolean;
  standups: Standup[];
}

export function WeekNavigation({
  weekDays,
  selectedDate,
  weekOffset,
  onDateSelect,
  onWeekChange,
  canGoBack,
  standups,
}: WeekNavigationProps) {
  const getBlockerCount = (date: Date): number => {
    const dateStr = formatDateForAPI(date);
    // Compare with the date portion of the ISO string (YYYY-MM-DD)
    // Backend stores dates as UTC midnight, so we extract just the date part
    const standup = standups.find((s) => s.date.split('T')[0] === dateStr);
    if (!standup || !standup.blockers) return 0;
    return countBlockers(standup.blockers);
  };

  const hasStandup = (date: Date): boolean => {
    const dateStr = formatDateForAPI(date);
    // Compare with the date portion of the ISO string (YYYY-MM-DD)
    // Backend stores dates as UTC midnight, so we extract just the date part
    return standups.some((s) => s.date.split('T')[0] === dateStr);
  };

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={!canGoBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(weekOffset + 1)}
          disabled={weekOffset >= 0}
          className="gap-2"
        >
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const blockerCount = getBlockerCount(day);
          const hasStandupForDay = hasStandup(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-accent/50',
                isSelected && 'border-primary bg-primary/10',
                !isSelected && 'border-transparent bg-card',
                isToday && 'ring-2 ring-primary/30'
              )}
            >
              <span className="text-xs font-medium text-muted-foreground mb-1">
                {format(day, 'EEE')}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold',
                  isSelected && 'text-primary',
                  isToday && !isSelected && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </span>
              
              {hasStandupForDay && (
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {blockerCount > 0 && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded">
                      {blockerCount}
                    </span>
                  )}
                </div>
              )}
              
              {!hasStandupForDay && (
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}