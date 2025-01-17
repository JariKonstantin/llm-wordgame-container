import React from 'react';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './select';


const variants = {
  "default": "bg-base-100",
};

const orientations = {
  "horizontal": "relative flex flex-row place-items-center space-x-2",
  "vertical": "relative grid grid-cols-1",
};

interface FormSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: React.ReactNode;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "default";
  orientation?: "horizontal" | "vertical";
  errors?: FieldError;
  children?: React.ReactNode;
  options?: { value: string; label: string }[];
}

function FormSelect<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required,
  variant = "default",
  orientation = "vertical",
  errors,
  children,
  options = [],
}: FormSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <div className={orientations[orientation]}>
            <Select
              disabled={disabled}
              required={required}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className={variants[variant]}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {children}
          </div>
          <FormDescription>
            {description}
          </FormDescription>
          <FormMessage>
            {errors?.message}
          </FormMessage>
        </FormItem>
      )}
    />
  );
}

export default FormSelect;