import {
  CodLayoutFormula,
  CodLayoutFormulaService,
  CodLayoutSpan,
  CodLayoutSvgOptions,
  CodLayoutUnit,
  CodLayoutValue,
  ParsingError,
} from "./models";

export const DEFAULT_BO_SVG_OPTIONS: CodLayoutSvgOptions = {
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
    default: "#eee",
    text: "#e6e9ff",
  },
  areaOpacity: 0.5,
  fallbackLineStyle: "5,5",
};

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
export class BOCodLayoutFormulaService implements CodLayoutFormulaService {
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
      throw new ParsingError("Odd number of '//' in formula", input);
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
   * @throws Error if the text is not in the expected format.
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
      throw new Error("Invalid size format: " + text);
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
      throw new Error("Invalid formula (expecting =): " + text);
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

  //#region Building SVG
  private calculateAreas(
    vSpans: CodLayoutSpan[],
    hSpans: CodLayoutSpan[],
    options: CodLayoutSvgOptions,
    useOriginal?: boolean
  ): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string;
    label?: string;
  }> {
    const areas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      type?: string;
      label?: string;
    }> = [];

    // Calculate vertical positions
    const vPositions: number[] = [options.padding];
    let currentPos = options.padding;
    for (const span of vSpans) {
      const value =
        useOriginal && span.originalValue !== undefined
          ? span.originalValue
          : span.value;
      currentPos += value * options.scale!;
      vPositions.push(currentPos);
    }

    // Calculate horizontal positions
    const hPositions: number[] = [options.padding];
    currentPos = options.padding;
    for (const span of hSpans) {
      const value =
        useOriginal && span.originalValue !== undefined
          ? span.originalValue
          : span.value;
      currentPos += value * options.scale!;
      hPositions.push(currentPos);
    }

    // Create areas from gridline intersections
    for (let i = 0; i < vPositions.length - 1; i++) {
      for (let j = 0; j < hPositions.length - 1; j++) {
        const vSpan = vSpans[i];
        const hSpan = hSpans[j];

        areas.push({
          x: hPositions[j],
          y: vPositions[i],
          width: hPositions[j + 1] - hPositions[j],
          height: vPositions[i + 1] - vPositions[i],
          type: vSpan.type || hSpan.type,
          label: vSpan.label || hSpan.label,
        });
      }
    }

    return areas;
  }
  /**
   * Build SVG code for the visualization of the layout formula.
   * @param formula The formula to visualize.
   * @param options Visualization options.
   * @returns SVG code as string.
   */
  public buildSvg(
    formula: CodLayoutFormula,
    options: Partial<CodLayoutSvgOptions> = {}
  ): string {
    const opts = { ...DEFAULT_BO_SVG_OPTIONS, ...options };

    const getSize = (
      value: CodLayoutValue
    ): { size: number; isFallback?: boolean } => {
      if (options.useOriginal && value.originalValue !== undefined) {
        return { size: value.originalValue, isFallback: false };
      }
      return { size: value.value, isFallback: options.useOriginal };
    };

    // Calculate base dimensions
    const width = getSize(formula.width).size * opts.scale! + opts.padding * 2;
    const height =
      getSize(formula.height).size * opts.scale! + opts.padding * 2;

    const svg: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`,
      "<style>",
      `.layout-label { font: ${opts.labelFontSize}px ${opts.labelFontFamily}; }`,
      "</style>",
      `<rect x="${opts.padding}" y="${opts.padding}" ` +
        `width="${getSize(formula.width).size * opts.scale!}" ` +
        `height="${getSize(formula.height).size * opts.scale!}" ` +
        'fill="none" stroke="#000" stroke-width="1"/>',
    ];

    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);

    // draw areas if enabled
    if (options.showAreas) {
      const areas = this.calculateAreas(
        vSpans,
        hSpans,
        opts,
        options.useOriginal
      );
      for (const area of areas) {
        let fillColor = opts.areaColors.default;
        if (area.type === "text") {
          fillColor = opts.areaColors.text;
        } else if (area.label && opts.areaColors[area.label]) {
          fillColor = opts.areaColors[area.label];
        }

        svg.push(
          `<rect x="${area.x}" y="${area.y}" ` +
            `width="${area.width}" height="${area.height}" ` +
            `fill="${fillColor}" opacity="${opts.areaOpacity}"/>`
        );
      }
    }

    // draw gridlines and labels
    let currentPos = opts.padding;

    // horizontal gridlines
    if (options.showHorizontal) {
      currentPos = opts.padding;
      for (const span of vSpans) {
        const { size, isFallback } = getSize(span);
        currentPos += size * opts.scale!;
        const lineColor =
          span.type === "text" ? opts.textAreaLineColor : opts.vLineColor;

        svg.push(
          `<line x1="${opts.padding}" y1="${currentPos}" ` +
            `x2="${width - opts.padding}" y2="${currentPos}" ` +
            `stroke="${lineColor}" stroke-width="${opts.vLineWidth}" ` +
            `${
              isFallback ? `stroke-dasharray="${opts.fallbackLineStyle}"` : ""
            }/>`
        );

        // area label at the left
        if (span.label) {
          const labelColor = opts.labelColors?.[span.label] || opts.labelColor;
          svg.push(
            `<text class="layout-label" x="${opts.padding + 5}" y="${
              currentPos - 2
            }" ` +
              `text-anchor="start" fill="${labelColor}">${span.label}</text>`
          );
        }

        // value label at the right
        if (opts.showValueLabels) {
          svg.push(
            `<text class="layout-label" x="${width - opts.padding - 5}" y="${
              currentPos - 2
            }" ` +
              `text-anchor="end" fill="${opts.valueLabelColor}">${size}${formula.unit}</text>`
          );
        }
      }
    }

    // vertical gridlines
    if (options.showVertical) {
      currentPos = opts.padding;
      for (const span of hSpans) {
        const { size, isFallback } = getSize(span);
        currentPos += size * opts.scale!;
        const lineColor =
          span.type === "text" ? opts.textAreaLineColor : opts.hLineColor;

        svg.push(
          `<line x1="${currentPos}" y1="${opts.padding}" ` +
            `x2="${currentPos}" y2="${height - opts.padding}" ` +
            `stroke="${lineColor}" stroke-width="${opts.hLineWidth}" ` +
            `${
              isFallback ? `stroke-dasharray="${opts.fallbackLineStyle}"` : ""
            }/>`
        );

        // area label at the top
        if (span.label) {
          const labelColor = opts.labelColors?.[span.label] || opts.labelColor;
          svg.push(
            `<text class="layout-label" x="${currentPos - 2}" y="${
              opts.padding + 5
            }" ` +
              `transform="rotate(-90 ${currentPos - 2} ${opts.padding + 5})" ` +
              `text-anchor="end" fill="${labelColor}">${span.label}</text>`
          );
        }

        // value label at the bottom
        if (opts.showValueLabels) {
          svg.push(
            `<text class="layout-label" x="${currentPos - 2}" y="${
              height - opts.padding - 5
            }" ` +
              `transform="rotate(-90 ${currentPos - 2} ${
                height - opts.padding - 5
              })" ` +
              `text-anchor="start" fill="${opts.valueLabelColor}">${size}${formula.unit}</text>`
          );
        }
      }
    }

    svg.push("</svg>");
    return svg.join("\n");
  }
  //#endregion
}
