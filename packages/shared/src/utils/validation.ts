export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && isFinite(amount);
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function isValidUnifiedCode(code: string): boolean {
  return /^[0-9A-Z]{18}$/.test(code);
}
