/**
 * The unit of a codicological layout formula dimension value.
 */
export type CodLayoutUnit = "mm" | "cm" | "in";

/**
 * An error thrown when parsing a codicological layout formula.
 */
export class ParsingError extends Error {
  public input: string;
  public index?: number;
  public length?: number;

  constructor(message: string, input: string, index?: number, length?: number) {
    super(message);
    this.name = "ParsingError";
    this.input = input;
    this.index = index;
    this.length = length;

    // set the prototype explicitly to maintain instanceof behavior
    Object.setPrototypeOf(this, ParsingError.prototype);
  }
}

/**
 * A numeric value (or values pair) in a codicological layout formula.
 */
export interface CodLayoutValue {
  value: number;
  isOriginal?: boolean;
  originalValue?: number;
  label?: string;
}

/**
 * A span in a codicological layout formula. This defines an area of the layout,
 * with a dimension representing width or height.
 */
export interface CodLayoutSpan extends CodLayoutValue {
  type?: string;
  isHorizontal?: boolean;
}

/**
 * The model of a codicological layout formula.
 */
export interface CodLayoutFormula {
  type?: string;
  unit?: CodLayoutUnit;
  width: CodLayoutValue;
  height: CodLayoutValue;
  spans: CodLayoutSpan[];
}

/**
 * A service to parse and build codicological layout formulas.
 */
export interface CodLayoutFormulaService {
  parseFormula(text?: string | null): CodLayoutFormula | null;
  buildFormula(formula: CodLayoutFormula): string | null;
}
