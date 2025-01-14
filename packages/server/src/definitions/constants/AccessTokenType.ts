export const AccessTokenTypes = {
  LONG: 'long',
  SHORT: 'short',
} as const;
export type AccessTokenType = (typeof AccessTokenTypes)[keyof typeof AccessTokenTypes];
