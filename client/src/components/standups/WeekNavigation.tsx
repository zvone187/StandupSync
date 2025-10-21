import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeekNavigationProps {
  weekDays: Date[];
  selectedDate: Date | null;
  weekOffset: number;
  onDateSelect: (date: Date) => void;
  onWeekChange: (offset: number) => void;
  canGoBack: boolean;
}

export function WeekNavigation({
  weekDays,
  selectedDate,
  weekOffset,
  onDateSelect,
  onWeekChange,
  canGoBack,
}: WeekNavigationProps) {
  return (
    <div className="w-full bg-card/50 backdrop-blur-sm rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={!canGoBack}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {weekOffset === 0 ? 'Current Week' : 'Previous Week'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onWeekChange(weekOffset + 1)}
          disabled={weekOffset === 0}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onDateSelect(day)}
              className={cn(
                'flex flex-col items-center justify-center h-16 transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <span className="text-xs font-medium">{format(day, 'EEE')}</span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}