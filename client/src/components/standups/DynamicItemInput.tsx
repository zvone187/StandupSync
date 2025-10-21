import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicItemInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label: string;
}

export function DynamicItemInput({ items, onChange, placeholder, label }: DynamicItemInputProps) {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleAddItem = () => {
    onChange([...items, '']);
    // Focus on the new textarea after it's rendered
    setTimeout(() => {
      const lastIndex = items.length;
      textareaRefs.current[lastIndex]?.focus();
    }, 0);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      onChange(['']);
    } else {
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Remove indentation
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          handleItemChange(index, newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      } else {
        // Add indentation
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        handleItemChange(index, newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    textareaRefs.current.forEach((textarea) => {
      if (textarea) {
        autoResize(textarea);
      }
    });
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-semibold">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Textarea
              ref={(el) => (textareaRefs.current[index] = el)}
              value={item}
              onChange={(e) => {
                handleItemChange(index, e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={placeholder || `Item ${index + 1}...`}
              className={cn(
                "min-h-[60px] resize-none overflow-hidden font-mono",
                "focus:ring-2 focus:ring-primary"
              )}
              rows={1}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(index)}
              className="mt-1 flex-shrink-0"
              disabled={items.length === 1 && item === ''}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tip: Use Tab to indent, Shift+Tab to unindent
      </p>
    </div>
  );
}