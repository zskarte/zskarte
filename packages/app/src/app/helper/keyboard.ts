export class KeyboardHelper {
  private static _shiftPressed = false;

  static {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') this._shiftPressed = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') this._shiftPressed = false;
    });
  }

  public static isShiftPressed(): boolean {
    return this._shiftPressed;
  }
}
