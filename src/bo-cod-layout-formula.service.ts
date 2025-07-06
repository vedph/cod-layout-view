import { CodLayoutFormulaBase } from "./cod-layout-formula-base";
import {
  CodLayoutFormula,
  CodLayoutFormulaRenderer,
  CodLayoutFormulaService,
  CodLayoutSpan,
  CodLayoutSvgOptions,
  CodLayoutUnit,
  CodLayoutValue,
  ParsingError,
} from "./models";

export const DEFAULT_BO_SVG_OPTIONS: CodLayoutSvgOptions = {
  showToolbar: true,
  showVertical: true,
  showHorizontal: true,
  showAreas: true,
  vLineColor: "#666",
  hLineColor: "#666",
  textAreaLineColor: "#00f",
  vLineWidth: 1,
  hLineWidth: 1,
  labelColor: "#333",
  labelFontSize: 10,
  labelFontFamily: "Arial",
  showValueLabels: true,
  valueLabelColor: "#333",
  padding: 20,
  scale: 2,
  areaColors: {
    default: "transparent",
    $text_$text: "#adadad",
  },
  areaOpacity: 0.5,
  fallbackLineStyle: "5,5",
};

interface AreaToRender {
  x: number;
  y: number;
  col: number;
  row: number;
  width: number;
  height: number;
  type?: string;
  label?: string;
}

/**
 * Service to parse and build layout formulas in the format defined for
 * codicological fragments. See D. Bianconi, I Codices Graeci Antiquiores tra
 * scavo e biblioteca, in Greek Manuscript Cataloguing: Past, Present, and Future,
 * edited by P. Degni, P. Eleuteri, M. Maniaci, Turnhout, Brepols, 2018
 * (Bibliologia, 48), 99-135, especially 110-111.
 * The following adjustments are made to the formula proposed there:
 * - use dashes instead of EM dashes;
 * - add an optional :label after each dimension to provide labels for additional
 *   areas like columns for initials etc. This must be a short string without spaces.
 */
export class BOCodLayoutFormulaService
  extends CodLayoutFormulaBase
  implements CodLayoutFormulaService, CodLayoutFormulaRenderer
{
  /**
   * The type of the layout formula (BO).
   */
  public readonly type = "BO";

  /**
   * Filter labels to only include those that are actually present in the
   * BO formula. This hasn't a static set of labels - all labels are explicitly
   * defined in the formula following the BO syntax. This method extracts all
   * labels from the formula and returns only those that match the input array.
   * @param formula The formula to use.
   * @param labels The labels to be filtered.
   * @return The filtered labels.
   */
  public filterFormulaLabels(
    formula: string | CodLayoutFormula,
    labels: string[]
  ): string[] {
    let parsedFormula: CodLayoutFormula | null;

    // parse the formula if it's a string
    if (typeof formula === "string") {
      try {
        parsedFormula = this.parseFormula(formula);
      } catch (error) {
        // if parsing fails, return empty array since we can't extract labels
        return [];
      }
    } else {
      parsedFormula = formula;
    }

    if (!parsedFormula) {
      return [];
    }

    // collect all labels from the formula spans
    const formulaLabels = new Set<string>();

    // add labels from width and height values
    if (parsedFormula.width?.label) {
      formulaLabels.add(parsedFormula.width.label);
    }
    if (parsedFormula.height?.label) {
      formulaLabels.add(parsedFormula.height.label);
    }

    // add labels from all spans
    for (const span of parsedFormula.spans) {
      if (span.label) {
        formulaLabels.add(span.label);
      }
    }

    // filter the input labels to only include those present in the formula
    return labels.filter((label) => formulaLabels.has(label));
  }

  //#region Parsing formula
  /**
   * Preprocess a formula text before parsing. This replaces - with 0 and pairs of
   * `//` with `| ` and `/ `. The count of characters remains the same.
   * @param text The text to preprocess.
   * @returns Preprocessed text.
   * @throws ParsingError if the number of `//` is odd.
   */
  private preprocessFormula(text: string): string {
    const input = text;

    // replace - (as single token) with 0
    text = text.replace(/(^-|\s-\s|-\s|-\s|\/-|-\/)/g, (match) => {
      if (match === "-") {
        return "0";
      } else if (match === " - ") {
        return " 0 ";
      } else if (match === "/-") {
        return "/0";
      } else if (match === "-/") {
        return "0/";
      } else if (match === "- ") {
        return "0 ";
      } else if (match === " -") {
        return " 0";
      }
      return match;
    });

    // in pairs of `//` replace the first `//` with `| ` and the second one with `/ `
    let count = (text.match(/\/\//g) || []).length;
    if (count % 2 !== 0) {
      throw new ParsingError(
        "Odd number of '//' in formula",
        input,
        0,
        input.length
      );
    }

    let result = "";
    let isFirst = true;
    while (text.includes("//")) {
      if (isFirst) {
        result += text.substring(0, text.indexOf("//")) + "| ";
        isFirst = false;
      } else {
        result += text.substring(0, text.indexOf("//")) + "/ ";
        isFirst = true;
      }
      text = text.substring(text.indexOf("//") + 2);
    }
    result += text;

    return result;
  }

  /**
   * Parse a dimension value from a text.
   * @param text The text to parse with form "N" or "(N)" or "(N) [N]",
   * optionally followed by a ":label".
   * @param formula The original formula text.
   * @param index The index of the text in the formula.
   * @param noLabel True if the label should not be used.
   * @returns The parsed value.
   * @throws ParsingError if the text is not in the expected format.
   */
  private parseValue(
    text: string,
    formula: string,
    index: number,
    noLabel = false
  ): CodLayoutValue {
    // [1] = (, [2] = value, [3] = original value, [4] = label
    let match = text.match(
      /^\s*(\()?([0-9]+(?:\.[0-9]+)?)\)?\s*(?:\[([0-9]+(?:\.[0-9]+)?)\])?(?::([^\s]+))?/
    );
    if (!match) {
      throw new ParsingError(
        "Invalid dimension: " + text,
        formula,
        index,
        text.length
      );
    }
    const d: CodLayoutValue = {
      value: parseFloat(match[2]),
      isOriginal: match[1] !== "(",
    };
    if (match[3]) {
      d.originalValue = parseFloat(match[3]);
      d.isOriginal = undefined;
    }
    if (match[4] && !noLabel) {
      d.label = match[4];
    }

    return d;
  }

  private findXIndex(text: string): number {
    let i = text.indexOf(" x ");
    if (i === -1) {
      i = text.indexOf(" × ");
    }
    return i;
  }

  /**
   * Parse the size from a text.
   * @param text The text to parse with form "HxW" or "H×W".
   * @param formula The original formula text.
   * @param index The index of the text in the formula.
   * @returns The parsed size.
   * @throws ParsingError if the text is not in the expected format.
   */
  private parseSize(
    text: string,
    formula: string,
    index: number
  ): {
    width: CodLayoutValue;
    height: CodLayoutValue;
  } {
    // parse size in text where:
    // - height precedes width;
    // - height is separated by width by "x" or "×";
    // - height and width have the form "N" or "(N)" or "(N) [N]", where N is the value,
    //   wrapped in () for a non-original value and optionally followed by [N] for the
    //   original value.
    let xi = this.findXIndex(text);
    if (xi === -1) {
      throw new ParsingError(
        "Invalid size format: " + text,
        formula,
        index,
        text.length
      );
    }

    const hw = [text.substring(0, xi).trim(), text.substring(xi + 3).trim()];

    // dimension: N or (N) or (N) [N]
    let width: CodLayoutValue = { value: 0 },
      height: CodLayoutValue = { value: 0 };

    for (let i = 0; i < 2; i++) {
      const d = this.parseValue(
        hw[i],
        formula,
        index + i === 0 ? 0 : xi + 1,
        true
      );
      if (i === 0) {
        height = d;
      } else {
        width = d;
      }
    }

    return { width, height };
  }

  /**
   * Parse the spans from a text.
   * @param text The text to parse with form "N" or "(N)" or "(N) [N]" for each span,
   * divided by "/" or "|".
   * @param horizontal True if the spans are horizontal, false if vertical.
   * @param formula The original formula text.
   * @param index The index of the text in the formula.
   * @returns Spans parsed from the text.
   * @throws Error if the text is not in the expected format.
   */
  private parseSpans(
    text: string,
    horizontal: boolean,
    formula: string,
    index: number
  ): CodLayoutSpan[] {
    // - each span is separated with "/" or "|"; the spans preceded by "|"
    //   have type="text";
    // - each span has the form "N" or "(N)" or "(N) [N]", where N is the value,
    //   wrapped in () for a non-original value and optionally followed by [N] for the
    //   original value, and by a ":label" for a label.
    const spans: CodLayoutSpan[] = [];
    let isText = false;

    // prepend divider / if text does not start with | or /
    text = text.trim();
    if (!text) {
      return [];
    }
    if (!text.startsWith("|") && !text.startsWith("/")) {
      text = "/" + text;
      index++;
    }

    // parse the spans, each with divider + value
    const regex = /([\/|])?\s*([^\/|]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const divider = match[1].trim();
      const valueText = match[2].trim();
      isText = divider === "|";

      const span: CodLayoutSpan = {
        ...this.parseValue(valueText, formula, index + match.index),
        isHorizontal: horizontal,
        type: isText ? "text" : undefined,
      };
      spans.push(span);
    }

    return spans;
  }

  /**
   * Parse a codicological layout formula from a text string.
   * @param text The text of the formula to parse or null or
   * undefined.
   * @returns The parsed formula or null if the input is null or
   * undefined.
   * @throws ParsingError if the formula is invalid.
   */
  public parseFormula(text?: string | null): CodLayoutFormula | null {
    if (!text) {
      return null;
    }
    const input = text;
    let offset = 0;

    // preprocess the formula
    text = this.preprocessFormula(text);
    const formula: CodLayoutFormula = {
      type: "BO",
      unit: "mm",
      width: { value: 0 },
      height: { value: 0 },
      spans: [],
    };

    // split formula into substrings:
    // 1. unit: an optional initial "mm" or "cm" or "in" followed by space(s).
    const unitMatch = text.match(/^(mm|cm|in)\s+/);
    if (unitMatch) {
      // set the unit
      formula.unit = unitMatch[1] as CodLayoutUnit;
      // remove the unit from the text
      text = text.substring(unitMatch[0].length);
      offset += unitMatch[0].length;
    }

    // 2. size: all what follows (1) until the first "=".
    const i = text.indexOf("=");
    if (i === -1) {
      throw new ParsingError(
        "Invalid formula (expecting =): " + text,
        input,
        offset,
        text.length
      );
    }
    // remove the trailing '='
    const size = text.substring(0, i).trim();
    // parse the size
    const { width, height } = this.parseSize(size, input, offset);
    formula.width = width;
    formula.height = height;
    // remove the size from the text
    text = text.substring(i + 1).trim();
    offset += i + 1;

    // 3. vspans: all what follows (2) until the first "x" or "×"
    let xi = this.findXIndex(text);
    if (xi === -1) {
      throw new ParsingError(
        "Invalid formula (expecting x or ×): " + text,
        input,
        offset,
        input.length - offset
      );
    }
    // parse the vertical spans
    const vsText = text.substring(0, xi);
    formula.spans = this.parseSpans(vsText, false, input, offset);
    // remove the vertical spans from the text
    text = text.substring(xi + 3);
    offset += xi + 3;

    // 4. hspans: all what follows (3) until the end
    const hspans = this.parseSpans(text, true, input, offset);
    if (!hspans.length) {
      throw new ParsingError(
        "Invalid formula (expecting horizontal spans): ",
        input,
        offset,
        input.length - offset
      );
    }
    formula.spans.push(...hspans);

    return formula;
  }
  //#endregion

  //#region Building formula
  private appendValue(value: CodLayoutValue, sb: string[]): void {
    // N or (N) or (N) [N], optionally followed by :label
    sb.push(value.isOriginal ? "" : "(");
    sb.push(value.value ? value.value.toString() : "-");
    sb.push(value.isOriginal ? "" : ")");
    if (value.originalValue) {
      sb.push(" [");
      sb.push(value.originalValue.toString());
      sb.push("]");
    }
    if (value.label) {
      sb.push(":");
      sb.push(value.label);
    }
  }

  private appendSpans(spans: CodLayoutSpan[], sb: string[]): void {
    let leftText = false;

    for (let i = 0; i < spans.length; i++) {
      if (i > 0) {
        if (leftText || spans[i].type === "text") {
          sb.push(" // ");
          leftText = true;
        } else {
          sb.push(" / ");
          leftText = false;
        }
      }
      this.appendValue(spans[i], sb);
    }
  }

  /**
   * Build the text of a codicological layout formula from a model.
   * @param formula The formula to build or null or undefined.
   * @returns The text of the formula or null if the input is null or
   * undefined.
   */
  public buildFormula(formula?: CodLayoutFormula | null): string | null {
    if (!formula) {
      return null;
    }
    const sb: string[] = [];

    // unit
    if (formula.unit) {
      sb.push(formula.unit + " ");
    }

    // height x width
    this.appendValue(formula.height, sb);
    sb.push(" x ");
    this.appendValue(formula.width, sb);

    // = vertical spans x horizontal spans
    sb.push(" = ");
    this.appendSpans(
      formula.spans.filter((s) => !s.isHorizontal),
      sb
    );
    sb.push(" x ");
    this.appendSpans(
      formula.spans.filter((s) => s.isHorizontal),
      sb
    );

    return sb.join("");
  }
  // #endregion
}
