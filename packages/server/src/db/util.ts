export const isUniqueViolation = (error: unknown, constraint?: string): boolean => {
  let current: unknown = error;
  while (current && typeof current === 'object') {
    const candidate = current as { code?: string; constraint?: string; cause?: unknown };
    if (candidate.code === '23505' && (!constraint || candidate.constraint === constraint)) return true;
    current = candidate.cause;
  }
  return false;
};
