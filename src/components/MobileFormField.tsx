
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFormFieldProps {
  label: string;
  type?: 'input' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  className?: string;
  rows?: number;
}

export function MobileFormField({
  label,
  type = 'input',
  placeholder,
  value,
  onChange,
  options,
  required = false,
  className,
  rows = 3
}: MobileFormFieldProps) {
  const isMobile = useIsMobile();

  const inputClassName = cn(
    'transition-colors',
    isMobile ? 'text-base min-h-[44px]' : 'text-sm',
    className
  );

  return (
    <div className="space-y-2">
      <Label className={cn(
        'font-medium',
        isMobile ? 'text-sm' : 'text-sm'
      )}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {type === 'input' && (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
        />
      )}

      {type === 'textarea' && (
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={isMobile ? Math.max(2, rows - 1) : rows}
          className={inputClassName}
        />
      )}

      {type === 'select' && options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={inputClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
