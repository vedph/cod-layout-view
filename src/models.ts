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
   * The formula type identifier, e.g. "BO" for Bianconi-Orsini.
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

/**
 * An area in a codicological layout formula, defined by the
 * intersection of vertical and horizontal spans.
 */
export interface CodLayoutArea {
  y: number;
  x: number;
  colIndexes: string[];
  rowIndexes: string[];
}

/**
 * A renderer for codicological layout formulas, which can build an SVG
 * representation of the formula.
 */
export interface CodLayoutFormulaRenderer {
  buildSvg(
    formula: CodLayoutFormula,
    options: Partial<CodLayoutSvgOptions>
  ): string;
}

/**
 * A service to parse and build codicological layout formulas.
 */
export interface CodLayoutFormulaService {
  /**
   * The formula type identifier, e.g. "BO" for Bianconi-Orsini.
   */
  readonly type: string;

  /**
   * Filter the specified array of labels so that only those belonging to
   * the specified formula are returned. For instance, in an IT formula,
   * labels like "margin-top", "head-e", etc. will be returned, while
   * other labels not belonging to the formula will be filtered out.
   * @param formula The formula to use.
   * @param labels The labels to be filtered.
   * @returns The filtered labels.
   */
  filterFormulaLabels(
    formula: string | CodLayoutFormula,
    labels: string[]
  ): string[];

  /**
   * Get all the areas defined by intersecting horizontal and vertical
   * spans. Each area has 1-based y and x coordinates referring to the
   * cells defined by the spans, and a list of row and column indexes.
   * Column indexes are the labels and types of the horizontal spans,
   * and row indexes are the labels and types of the vertical spans.
   * For instance, if there are 3 vertical spans (along the height) for
   * top margin (mt), text, and bottom margin (bm), and 4 horizontal
   * spans (along the width) for left margin (lm), initials (i), text
   * and right margin (mr), the areas will be 12:
   *                   col 1     col 2    col 3        col 4
   *   - row 1 (mt):   mt_ml,    mt_i,    mt_$text,    mt_mr
   *   - row 2 (text): $text_ml, $text_i, $text_$text, $text_mr
   *   - row 3 (mb):   mb_ml,    mb_i,    mb_$text,    mb_mr
   * @param spans The formula spans.
   * @returns The areas.
   */
  getAreas(spans: CodLayoutSpan[]): CodLayoutArea[];

  /**
   * Filter areas by name.
   * @param name The area name. This can be @y_x when matching by y and x values,
   * or any combination of row and column indexes, separated by underscore
   * (`row_col`), or just a row (with form `row_`) or column (with form `_col`)
   * index.
   * @param areas The areas to search in.
   * @returns The areas that match the name.
   */
  filterAreas(name: string, areas: CodLayoutArea[]): CodLayoutArea[];

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

  /**
   * Validate the given formula.
   * @param formula The formula to validate.
   * @returns An object with error messages keyed by span label, or null if valid.
   * If the formula is empty, returns null.
   */
  validateFormula(formula?: string): { [key: string]: string } | null;
}

/**
 * Options for rendering a codicological layout formula as SVG.
 */
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
    [key: string]: string;
  };
  areaOpacity: number;

  // line styles
  fallbackLineStyle: string; // for when using original values but falling back to current
}
