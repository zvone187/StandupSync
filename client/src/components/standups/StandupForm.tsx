import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DynamicItemInput } from './DynamicItemInput';
import { formatTextToItems, formatItemsToText } from '@/utils/standupUtils';

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
  const [yesterdayItems, setYesterdayItems] = useState<string[]>(
    formatTextToItems(initialData?.yesterday || '')
  );
  const [todayItems, setTodayItems] = useState<string[]>(
    formatTextToItems(initialData?.today || '')
  );
  const [blockerItems, setBlockerItems] = useState<string[]>(
    formatTextToItems(initialData?.blockers || '')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      yesterday: formatItemsToText(yesterdayItems),
      today: formatItemsToText(todayItems),
      blockers: formatItemsToText(blockerItems),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DynamicItemInput
        items={yesterdayItems}
        onChange={setYesterdayItems}
        label="What did you work on yesterday?"
        placeholder="Enter what you worked on..."
      />

      <DynamicItemInput
        items={todayItems}
        onChange={setTodayItems}
        label="What are you working on today?"
        placeholder="Enter what you're working on..."
      />

      <DynamicItemInput
        items={blockerItems}
        onChange={setBlockerItems}
        label="Blockers"
        placeholder="Any blockers? (Leave empty if none)"
      />

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}