import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StandupFormProps {
  initialData?: {
    yesterday: string;
    today: string;
    blockers: string;
  };
  onSave: (data: { yesterday: string; today: string; blockers: string }) => void;
  onCancel: () => void;
}

export function StandupForm({ initialData, onSave, onCancel }: StandupFormProps) {
  const [yesterday, setYesterday] = useState(initialData?.yesterday || '');
  const [today, setToday] = useState(initialData?.today || '');
  const [blockers, setBlockers] = useState(initialData?.blockers || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ yesterday, today, blockers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="yesterday" className="text-base font-semibold">
          What did you work on yesterday?
        </Label>
        <Textarea
          id="yesterday"
          value={yesterday}
          onChange={(e) => setYesterday(e.target.value)}
          placeholder="Enter your updates from yesterday..."
          className="min-h-[100px] resize-y"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="today" className="text-base font-semibold">
          What are you working on today?
        </Label>
        <Textarea
          id="today"
          value={today}
          onChange={(e) => setToday(e.target.value)}
          placeholder="Enter what you're working on today..."
          className="min-h-[100px] resize-y"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="blockers" className="text-base font-semibold">
          Blockers
        </Label>
        <Textarea
          id="blockers"
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder="Any blockers? (Leave empty if none)"
          className="min-h-[80px] resize-y"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}