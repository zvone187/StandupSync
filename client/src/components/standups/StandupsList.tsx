import { Standup } from '@/types/standup';
import { StandupCard } from './StandupCard';
import { format, parseISO } from 'date-fns';

interface StandupsListProps {
  standups: Standup[];
  dates: string[];
  isOwn: boolean;
  onUpdate?: (id: string, data: { yesterday: string; today: string; blockers: string }) => void;
}

export function StandupsList({ standups, dates, isOwn, onUpdate }: StandupsListProps) {
  const getStandupForDate = (date: string): Standup | null => {
    return standups.find((s) => format(parseISO(s.date), 'yyyy-MM-dd') === date) || null;
  };

  if (dates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No stand-ups to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const standup = getStandupForDate(date);
        return (
          <StandupCard
            key={date}
            standup={standup}
            date={date}
            isOwn={isOwn}
            onUpdate={
              standup && onUpdate
                ? (data) => onUpdate(standup._id, data)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}