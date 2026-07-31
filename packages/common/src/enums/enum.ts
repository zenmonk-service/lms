export abstract class ENUM {
  static ENUM: Record<string, string>;

  static getValues(): string[] {
    return Object.values(this.ENUM);
  }

  static isValidValue(value: string): boolean {
    return this.getValues().includes(value);
  }
}