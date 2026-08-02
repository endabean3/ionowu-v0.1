import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldWrapperProps = {
  id: string;
  label: string;
  wajib?: boolean;
  bantuan?: string;
  error?: string;
  children: ReactNode;
};

/** Bungkus label + input + teks bantu/error, konsisten untuk semua jenis field. */
export function FieldWrapper({ id, label, wajib, bantuan, error, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {wajib && <span className="text-signal"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert" id={`${id}-error`}>
          {error}
        </p>
      ) : bantuan ? (
        <p className="field-help" id={`${id}-help`}>
          {bantuan}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = {
  id: string;
  error?: string;
  bantuan?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ id, error, bantuan, className, ...rest }: InputProps) {
  return (
    <input
      id={id}
      className={cn("field-input", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : bantuan ? `${id}-help` : undefined}
      {...rest}
    />
  );
}

type TextareaProps = {
  id: string;
  error?: string;
  bantuan?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ id, error, bantuan, className, ...rest }: TextareaProps) {
  return (
    <textarea
      id={id}
      className={cn("field-input", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : bantuan ? `${id}-help` : undefined}
      {...rest}
    />
  );
}

type SelectProps = {
  id: string;
  error?: string;
  bantuan?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ id, error, bantuan, className, ...rest }: SelectProps) {
  return (
    <select
      id={id}
      className={cn("field-input", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : bantuan ? `${id}-help` : undefined}
      {...rest}
    />
  );
}
