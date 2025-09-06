// src/components/forms/FormField.tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  value: any;
  onChange: (value: any) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  min?: number;
  max?: number;
  rows?: number;
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
  description,
  min,
  max,
  rows = 3
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={id} className="text-sm font-normal">
              {label}
            </Label>
          </div>
        );

      default:
        return (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(
              type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
            )}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderInput()}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
