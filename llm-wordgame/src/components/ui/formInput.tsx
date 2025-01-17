import React from 'react';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';

const variants = {
  "default": "bg-base-100",
};

const orientations = {
  "horizontal": "relative flex flex-row place-items-center space-x-2",
  "vertical": "relative grid grid-cols-1",
};

interface FormInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  type?: string;
  label?: React.ReactNode;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "default";
  orientation?: "horizontal" | "vertical";
  errors?: FieldError;
  children?: React.ReactNode;
}

function FormInput<T extends FieldValues>({
  form,
  name,
  type = "text",
  label,
  description,
  placeholder,
  disabled = false,
  required,
  variant = "default",
  orientation = "vertical",
  errors,
  children,
}: FormInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className={orientations[orientation]}>
              <Input
                className={variants[variant]}
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                {...field}
              />
              {children}
            </div>
          </FormControl>
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

export default FormInput;