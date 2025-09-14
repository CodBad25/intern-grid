import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '@/components/VoiceInput';
import { cn } from '@/lib/utils';

interface TextAreaWithVoiceProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const TextAreaWithVoice: React.FC<TextAreaWithVoiceProps> = ({
  value: controlledValue,
  onValueChange,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (controlledValue !== undefined && onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    const newValue = value + (value ? ' ' : '') + transcript;
    
    if (controlledValue !== undefined && onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className="relative">
      <Textarea
        {...props}
        value={value}
        onChange={handleChange}
        className={cn('pr-12', className)}
      />
      <div className="absolute top-2 right-2">
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          size="sm"
          variant="ghost"
        />
      </div>
    </div>
  );
};