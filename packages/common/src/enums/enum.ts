export abstract class ENUM {
  static ENUM: Record<string, string | number>;

  static getValues(): (string | number)[] {
    return Object.values(this.ENUM);
  }

  static isValidValue(value: string | number): boolean {
    return this.getValues().includes(value);
  }
}