import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Standup } from '@/types/standup';
import { formatDate, canEditStandup } from '@/utils/dateUtils';
import { BlockersSection } from './BlockersSection';
import { StandupForm } from './StandupForm';
import { cn } from '@/lib/utils';

interface StandupCardProps {
  standup: Standup | null;
  date: string;
  isOwn: boolean;
  onUpdate?: (data: { yesterday: string; today: string; blockers: string }) => void;
}

export function StandupCard({ standup, date, isOwn, onUpdate }: StandupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isSubmitted = standup?.isSubmitted || false;
  const canEdit = isOwn && canEditStandup(date);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (data: { yesterday: string; today: string; blockers: string }) => {
    if (onUpdate) {
      onUpdate(data);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-lg',
        isSubmitted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
      )}
    >
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
              {!isSubmitted && <p className="text-sm text-muted-foreground">Not submitted</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
          {isEditing && standup ? (
            <StandupForm
              initialData={{
                yesterday: standup.yesterday,
                today: standup.today,
                blockers: standup.blockers,
              }}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <>
              {standup && <BlockersSection blockers={standup.blockers} />}

              <div className="space-y-4">
                <div className="bg-card/50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    What did you work on yesterday?
                  </h4>
                  <p className="text-base whitespace-pre-wrap">
                    {standup?.yesterday || <span className="text-muted-foreground italic">No updates</span>}
                  </p>
                </div>

                <div className="bg-card/50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    What are you working on today?
                  </h4>
                  <p className="text-base whitespace-pre-wrap">
                    {standup?.today || <span className="text-muted-foreground italic">No updates</span>}
                  </p>
                </div>
              </div>

              {canEdit && standup && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleEdit} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}