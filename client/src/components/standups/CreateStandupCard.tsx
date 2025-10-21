import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';
import { StandupForm } from './StandupForm';

interface CreateStandupCardProps {
  onSubmit: (data: { yesterday: string; today: string; blockers: string }) => void;
}

export function CreateStandupCard({ onSubmit }: CreateStandupCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (data: { yesterday: string; today: string; blockers: string }) => {
    onSubmit(data);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Card className="border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
        <CardHeader onClick={() => setIsOpen(true)}>
          <CardTitle className="flex items-center justify-center gap-2 text-primary">
            <Plus className="h-6 w-6" />
            <span>Create Today's Stand-up</span>
            <Sparkles className="h-5 w-5" />
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Create Today's Stand-up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StandupForm
          initialData={{
            yesterday: '',
            today: '',
            blockers: '',
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
}