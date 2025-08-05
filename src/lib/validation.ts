import { z } from 'zod';
import DOMPurify from 'dompurify';

export function sanitizeString(input: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  
  return input.replace(/[<>]/g, '');
}

export const createFactionSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter de 3 a 20 caracteres.')
    .max(20, 'O nome não pode ter mais de 20 caracteres.')
    .transform(sanitizeString),
  tag: z.string()
    .min(2, 'A tag deve ter de 2 a 4 caracteres.')
    .max(4, 'A tag não pode ter mais de 4 caracteres.')
    .regex(/^[a-zA-Z0-9]+$/, 'A tag só pode conter letras e números.')
    .transform(sanitizeString),
  description: z.string()
    .max(150, 'A descrição não pode ter mais de 150 caracteres.')
    .optional()
    .transform(val => val ? sanitizeString(val) : ''),
});

export const userUpdateSchema = z.object({
  displayName: z.string()
    .min(1, 'Nome é obrigatório.')
    .max(50, 'Nome muito longo.')
    .transform(sanitizeString)
    .optional(),
  photoURL: z.string()
    .url('URL inválida.')
    .optional(),
  location: z.string()
    .max(100, 'Localização muito longa.')
    .transform(sanitizeString)
    .optional(),
});

export const announcementSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório.')
    .max(100, 'Título muito longo.')
    .transform(sanitizeString),
  message: z.string()
    .min(1, 'Mensagem é obrigatória.')
    .max(1000, 'Mensagem muito longa.')
    .transform(sanitizeString),
  target: z.enum(['global', 'faction', 'user']),
});

export const factionApplicationSchema = z.object({
  uid: z.string().min(1, 'UID é obrigatório.'),
  displayName: z.string()
    .min(1, 'Nome é obrigatório.')
    .max(50, 'Nome muito longo.')
    .transform(sanitizeString),
  photoURL: z.string().url('URL inválida.').optional(),
});

export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Dados inválidos.' };
  }
}

export function isValidDocumentId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,1500}$/.test(id);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 