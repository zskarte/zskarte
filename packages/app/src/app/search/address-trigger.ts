export const ADDRESS_TRIGGER_CHAR = '@';

export function isAddressTriggerAt(text: string, cursorPosition: number, allowStart = false): boolean {
  if (cursorPosition <= 0) return false;
  if (text.charAt(cursorPosition - 1) !== ADDRESS_TRIGGER_CHAR) return false;
  if (cursorPosition === 1) return allowStart;
  return /\s/.test(text.charAt(cursorPosition - 2));
}
