import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { StandupForm } from './StandupForm';
import { getTomorrowNotes } from '@/api/standups';
import { useToast } from '@/hooks/useToast';

interface CreateStandupCardProps {
  onSubmit: (data: { yesterday: string; today: string; blockers: string }) => void;
}

export function CreateStandupCard({ onSubmit }: CreateStandupCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prePopulatedNotes, setPrePopulatedNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await getTomorrowNotes() as { notes?: string };
        if (response.notes) {
          setPrePopulatedNotes(response.notes);
        }
      } catch (error: unknown) {
        console.error('Error fetching tomorrow notes:', error);
      }
    };

    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

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
            yesterday: prePopulatedNotes,
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