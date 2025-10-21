import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BlockersSectionProps {
  blockers: string;
}

export function BlockersSection({ blockers }: BlockersSectionProps) {
  const hasBlockers = blockers && blockers.trim().length > 0;

  return (
    <Alert
      variant={hasBlockers ? 'destructive' : 'default'}
      className={cn(
        'mb-4 transition-all',
        hasBlockers
          ? 'bg-destructive/10 border-destructive/50 dark:bg-destructive/20'
          : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
      )}
    >
      <AlertTriangle className={cn('h-5 w-5', hasBlockers ? 'text-destructive' : 'text-green-600')} />
      <AlertDescription className="ml-2">
        <div className="font-semibold text-lg mb-1">Blockers</div>
        {hasBlockers ? (
          <div className="text-base whitespace-pre-wrap">{blockers}</div>
        ) : (
          <div className="text-base text-green-600 dark:text-green-400">No blockers ✓</div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}