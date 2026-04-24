'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: (inputProps: {
    id: string
    'aria-required'?: boolean
    'aria-invalid'?: boolean
    'aria-describedby'?: string
    'aria-errormessage'?: string
  }) => ReactNode
}

/**
 * Accessible form field wrapper.
 * Handles label association, required marking, error/hint linking.
 * RGAA 11.1, 11.2, 11.10, 11.11 / WCAG 1.3.1, 3.3.1, 3.3.2
 */
export function FormField({ id, label, required, error, hint, children }: FormFieldProps) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean).join(' ') || undefined

  const inputProps = {
    id,
    ...(required && { 'aria-required': true as const }),
    ...(error && { 'aria-invalid': true as const }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    ...(error && { 'aria-errormessage': `${id}-error` }),
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
      </label>
      {children(inputProps)}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
