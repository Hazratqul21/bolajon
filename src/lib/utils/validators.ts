/**
 * Validation utilities
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAge(age: number): boolean {
  return age >= 4 && age <= 7;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

