import { mini } from "@strudel/mini";

// Pattern type from @strudel/core (not explicitly exported as a type)
export type StrudelPattern = ReturnType<typeof mini>;

/**
 * PatternEngine wraps @strudel/mini to evaluate mini-notation strings
 * into queryable Pattern objects.
 */
export class PatternEngine {
  private _currentPattern: StrudelPattern | null = null;
  private _currentCode: string = "";
  private _error: string | null = null;

  get currentPattern(): StrudelPattern | null {
    return this._currentPattern;
  }

  get currentCode(): string {
    return this._currentCode;
  }

  get error(): string | null {
    return this._error;
  }

  /**
   * Evaluate a mini-notation string into a Pattern.
   * Returns the pattern on success, throws on failure.
   */
  evaluate(code: string): StrudelPattern {
    this._error = null;
    try {
      const pattern = mini(code);
      // Validate by querying one cycle
      pattern.queryArc(0, 1);
      // Atomic assignment — only update state after successful eval
      this._currentPattern = pattern;
      this._currentCode = code;
      return pattern;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._error = msg;
      throw new Error(`Pattern evaluation failed: ${msg}`);
    }
  }

  clear() {
    this._currentPattern = null;
    this._currentCode = "";
    this._error = null;
  }
}
