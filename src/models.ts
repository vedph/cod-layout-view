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
  /**
   * The value of the dimension.
   */
  value: number;
  /**
   * Whether value is the original value or a current value considered
   * different from the original one.
   */
  isOriginal?: boolean;
  /**
   * The original value of the dimension, if different from the current
   * value.
   */
  originalValue?: number;
  /**
   * The dimension label, if any, which gets inherited by the area defined
   * by the corresponding gridline; e.g. "initials".
   */
  label?: string;
}

/**
 * A span in a codicological layout formula. This defines an area of the layout,
 * with a dimension representing width or height.
 */
export interface CodLayoutSpan extends CodLayoutValue {
  /**
   * The type of the span. In most cases this is undefined, or "text" for an
   * area designed to contain text. Its string type allows for many other
   * possibilities.
   */
  type?: string;
  /**
   * True if the span is horizontal, false if vertical.
   */
  isHorizontal?: boolean;
}

/**
 * The model of a codicological layout formula.
 */
export interface CodLayoutFormula {
  /**
   * The formula type, e.g. "BO" for Bianconi-Orsini.
   */
  readonly type?: string;
  /**
   * The unit of the formula dimensions, e.g. "mm".
   */
  unit?: CodLayoutUnit;
  /**
   * The sheet height.
   */
  height: CodLayoutValue;
  /**
   * The sheet width.
   */
  width: CodLayoutValue;
  /**
   * The spans in the formula, vertical and horizontal.
   */
  spans: CodLayoutSpan[];
}

export interface CodLayoutArea {
  y: number;
  x: number;
  colIndexes: string[];
  rowIndexes: string[];
}

/**
 * A service to parse and build codicological layout formulas.
 */
export interface CodLayoutFormulaService {
  /**
   * Parse a codicological layout formula from a text string.
   * @param text The text of the formula to parse or null or
   * undefined.
   * @returns The parsed formula or null if the input is null or
   * undefined.
   * @throws ParsingError if the formula is invalid.
   */
  parseFormula(text?: string | null): CodLayoutFormula | null;

  /**
   * Build the text of a codicological layout formula from a model.
   * @param formula The formula to build or null or undefined.
   * @returns The text of the formula or null if the input is null or
   * undefined.
   */
  buildFormula(formula?: CodLayoutFormula | null): string | null;
}

export interface CodLayoutSvgOptions {
  /**
   * Show vertical gridlines.
   */
  showVertical?: boolean;
  /**
   * Show horizontal gridlines.
   */
  showHorizontal?: boolean;
  /**
   * Show areas defined by combining vertical and horizontal gridlines.
   */
  showAreas?: boolean;
  /**
   * Use original values for dimensions when available.
   */
  useOriginal?: boolean;
  /**
   * Show the toolbar for toggling gridlines and areas.
   */
  showToolbar?: boolean;

  // grid colors
  vLineColor: string;
  hLineColor: string;
  textAreaLineColor: string;

  // line properties
  vLineWidth: number;
  hLineWidth: number;

  // spacing
  areaGap?: number;

  // labels
  labelColor: string;
  labelFontSize: number;
  labelFontFamily: string;
  labelColors?: { [key: string]: string };

  /**
   * Show value labels for gridlines.
   */
  showValueLabels?: boolean;

  /**
   * Color for value labels.
   */
  valueLabelColor: string;

  // SVG properties
  padding: number;
  scale?: number; // mm to pixels

  // area colors
  areaColors: {
    default: string;
    text: string;
    [key: string]: string; // For labeled areas
  };
  areaOpacity: number;

  // line styles
  fallbackLineStyle: string; // for when using original values but falling back to current
}
