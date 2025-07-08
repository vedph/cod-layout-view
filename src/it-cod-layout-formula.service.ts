import {
  CodLayoutFormula,
  CodLayoutFormulaService,
  CodLayoutFormulaRenderer,
  CodLayoutSpan,
  CodLayoutValue,
  CodLayoutSvgOptions,
  ErrorWrapper,
  ParsingError,
} from "./models";
import { CodLayoutFormulaBase } from "./cod-layout-formula-base";

export const DEFAULT_IT_SVG_OPTIONS: CodLayoutSvgOptions = {
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

/**
 * Service to parse and build layout formulas in the IT (Itinera) format.
 * This format uses a syntax similar to the original Angular service but
 * adapted to the generic CodLayoutFormula model.
 *
 * The formula syntax is: HxW=height_details×width_details
 *
 * Height details: mt[/he][ah][/fe]mb or mt[hw/]ah[fw/]mb
 * Width details: ml[columns]mr where columns can have gaps (N)
 *
 * Examples:
 * - 250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15
 * - 200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15
 */
export class ITCodLayoutFormulaService
  extends CodLayoutFormulaBase
  implements CodLayoutFormulaService, CodLayoutFormulaRenderer
{
  // main formula pattern: HxW=height×width
  private static readonly SECT_REGEX = /^(\d+)[Xx×](\d+)=([^Xx×]+)[Xx×](.+)$/;

  // height pattern: mt[/he][ah][/fe]mb or mt[hw/]ah[fw/]mb (matches legacy _heightRegex)
  private static readonly HEIGHT_REGEX =
    /^(\d+)(?:\/(\d+))?\[(?:(\d+)\/)?(\d+)(?:\/(\d+))?\](?:(\d+)\/)?(\d+)/;

  // margin patterns for width (matches legacy _wmlRegex and _wmrRegex)
  private static readonly MARGIN_LEFT_REGEX = /^(\d+)\b/;
  private static readonly MARGIN_RIGHT_REGEX = /\b(\d+)$/;

  /**
   * The type of the layout formula (IT).
   */
  public readonly type = "IT";

  /**
   * Filter labels to only include those valid for IT formulas.
   * Valid labels are: margin-top, head-e, head-w, area-height,
   * foot-w, foot-e, margin-bottom, margin-left, col-N-gap,
   * col-N-left-e, col-N-left-w, col-N-width, col-N-right-e,
   * col-N-right-w, margin-right where N is any positive integer
   * (column number).
   * @param formula The formula to use for filtering. This is not
   * effectively used in this implementation because the IT formula
   * has a static set of labels, except for the fact that column
   * numbers may vary.
   * @param labels The labels to be filtered.
   * @return The filtered formula labels.
   */
  public filterFormulaLabels(
    formula: string | CodLayoutFormula,
    labels: string[]
  ): string[] {
    // Handle null/undefined formula
    if (!formula) {
      return [];
    }

    const validStaticLabels = new Set([
      "margin-top",
      "head-e",
      "head-w",
      "area-height",
      "foot-w",
      "foot-e",
      "margin-bottom",
      "margin-left",
      "margin-right",
    ]);

    // regex patterns for column-based labels (positive integers only)
    const colGapPattern = /^col-[1-9]\d*-gap$/;
    const colLeftEPattern = /^col-[1-9]\d*-left-e$/;
    const colLeftWPattern = /^col-[1-9]\d*-left-w$/;
    const colWidthPattern = /^col-[1-9]\d*-width$/;
    const colRightEPattern = /^col-[1-9]\d*-right-e$/;
    const colRightWPattern = /^col-[1-9]\d*-right-w$/;

    return labels.filter((label) => {
      // check static labels
      if (validStaticLabels.has(label)) {
        return true;
      }

      // check column-based labels
      return (
        colGapPattern.test(label) ||
        colLeftEPattern.test(label) ||
        colLeftWPattern.test(label) ||
        colWidthPattern.test(label) ||
        colRightEPattern.test(label) ||
        colRightWPattern.test(label)
      );
    });
  }

  //#region Parsing
  /**
   * Parse the height portion of the formula using the exact legacy logic.
   */
  private parseHeight(
    text: string,
    formula: string
  ): {
    height: CodLayoutValue;
    spans: CodLayoutSpan[];
  } {
    // remove all whitespace for consistent parsing
    const cleanText = text.replace(/\s+/g, "");
    const match = ITCodLayoutFormulaService.HEIGHT_REGEX.exec(cleanText);

    if (!match) {
      throw new ParsingError("Invalid height format", formula, 0, text.length);
    }

    const spans: CodLayoutSpan[] = [];
    let totalHeight = 0;

    // parse height dimensions
    const mt = parseFloat(match[1]);
    const he = match[2] ? parseFloat(match[2]) : undefined;
    const hw = match[3] ? parseFloat(match[3]) : undefined;
    const ah = parseFloat(match[4]);
    const fw = match[5] ? parseFloat(match[5]) : undefined;
    const fe = match[6] ? parseFloat(match[6]) : undefined;
    const mb = parseFloat(match[7]);

    // margin-top
    spans.push({
      value: mt,
      label: "margin-top",
      isHorizontal: false,
    });
    totalHeight += mt;

    // head-e
    if (he !== undefined) {
      spans.push({
        value: he,
        label: "head-e",
        isHorizontal: false,
      });
      totalHeight += he;
    }

    // head-w
    if (hw !== undefined) {
      spans.push({
        value: hw,
        label: "head-w",
        isHorizontal: false,
        type: "text",
      });
      totalHeight += hw;
    }

    // area-height
    spans.push({
      value: ah,
      label: "area-height",
      isHorizontal: false,
      type: "text",
    });
    totalHeight += ah;

    // foot-w
    if (fw !== undefined) {
      spans.push({
        value: fw,
        label: "foot-w",
        isHorizontal: false,
        type: "text",
      });
      totalHeight += fw;
    }

    // foot-e
    if (fe !== undefined) {
      spans.push({
        value: fe,
        label: "foot-e",
        isHorizontal: false,
      });
      totalHeight += fe;
    }

    // margin-bottom
    spans.push({
      value: mb,
      label: "margin-bottom",
      isHorizontal: false,
    });
    totalHeight += mb;

    // apply correction for ambiguous [N/N] case
    const hwSpan = spans.find((s) => s.label === "head-w");
    const ahSpan = spans.find((s) => s.label === "area-height");

    if (hwSpan && ahSpan && ahSpan.value < hwSpan.value) {
      // hw is rather ah, ah is rather fw
      const actualAh = hwSpan.value;
      const actualFw = ahSpan.value;

      // remove hw span
      const hwIndex = spans.findIndex((s) => s.label === "head-w");
      spans.splice(hwIndex, 1);

      // update ah span
      ahSpan.value = actualAh;

      // insert fw span in the correct position (after area-height, before foot-e or margin-bottom)
      const ahIndex = spans.findIndex((s) => s.label === "area-height");
      const insertIndex = ahIndex + 1;
      spans.splice(insertIndex, 0, {
        value: actualFw,
        label: "foot-w",
        isHorizontal: false,
        type: "text",
      });

      // recalculate total
      totalHeight =
        totalHeight - hwSpan.value + actualAh + actualFw - ahSpan.value;
    }

    return {
      height: { value: totalHeight },
      spans,
    };
  }

  /**
   * Parse a column definition using the exact legacy logic.
   * @param colText The column text to parse.
   * @param colIndex The column index.
   * @param formula The original formula text.
   * @param index The index of the column text in the formula.
   * @returns The parsed spans for the column.
   * @throws ParsingError if the column text is invalid.
   */
  private parseColumn(
    colText: string,
    colIndex: number,
    formula: string,
    index: number
  ): CodLayoutSpan[] {
    const spans: CodLayoutSpan[] = [];
    const prefix = `col-${colIndex}-`;

    // [1]=]
    // [2]=N
    // [3]=*
    // [4]=[
    const nrRegex = /(?:(\]?)(\d+)(\*)?(\[)?)/g;
    let match: RegExpExecArray | null;
    const nrMatches: RegExpExecArray[] = [];

    while ((match = nrRegex.exec(colText))) {
      if (match[2]) {
        // only if we have a number
        nrMatches.push(match);
        if (nrMatches.length > 3) {
          throw new ParsingError(
            `Too many numbers in column ${colIndex}: "${colText}"`,
            formula,
            index,
            colText.length
          );
        }
      }
    }

    switch (nrMatches.length) {
      case 3:
        // cl, cw, cr - with 3 N, we have clx, cw, crx
        const ml = nrMatches[0];
        const cle = ml[3] || ml[4]; // has * or [
        spans.push({
          value: parseFloat(ml[2]),
          label: prefix + (cle ? "left-e" : "left-w"),
          isHorizontal: true,
          type: cle ? undefined : "text",
        });

        spans.push({
          value: parseFloat(nrMatches[1][2]),
          label: prefix + "width",
          isHorizontal: true,
          type: "text",
        });

        const mr = nrMatches[2];
        const cre = mr[3] || mr[1]; // has * or ]
        spans.push({
          value: parseFloat(mr[2]),
          label: prefix + (cre ? "right-e" : "right-w"),
          isHorizontal: true,
          type: cre ? undefined : "text",
        });
        break;

      case 2:
        // with 2 N we have various combinations
        const a = nrMatches[0];
        const b = nrMatches[1];

        if (a[3] && b[3]) {
          // both have *
          throw new ParsingError(
            `No width in column ${colIndex}: "${colText}"`,
            formula,
            index,
            colText.length
          );
        }

        if (a[3]) {
          // a has *, so a=cle, b=cw
          spans.push({
            value: parseFloat(a[2]),
            label: prefix + "left-e",
            isHorizontal: true,
          });
          spans.push({
            value: parseFloat(b[2]),
            label: prefix + "width",
            isHorizontal: true,
            type: "text",
          });
        } else if (b[3]) {
          // b has *, so a=cw, b=cre
          spans.push({
            value: parseFloat(a[2]),
            label: prefix + "width",
            isHorizontal: true,
            type: "text",
          });
          spans.push({
            value: parseFloat(b[2]),
            label: prefix + "right-e",
            isHorizontal: true,
          });
        } else {
          // neither has *, determine by size
          if (parseFloat(a[2]) === parseFloat(b[2])) {
            throw new ParsingError(
              `Ambiguous values for column ${colIndex}: ${colText}`,
              formula,
              index,
              colText.length
            );
          }
          if (parseFloat(a[2]) > parseFloat(b[2])) {
            // a=cw, b=crx (cre of ]N, else crw)
            spans.push({
              value: parseFloat(a[2]),
              label: prefix + "width",
              isHorizontal: true,
              type: "text",
            });
            spans.push({
              value: parseFloat(b[2]),
              label: prefix + (b[1] ? "right-e" : "right-w"),
              isHorizontal: true,
              type: b[1] ? undefined : "text",
            });
          } else {
            // a=clx, b=cw (cle if [N, else clw)
            spans.push({
              value: parseFloat(a[2]),
              label: prefix + (a[4] ? "left-e" : "left-w"),
              isHorizontal: true,
              type: a[4] ? undefined : "text",
            });
            spans.push({
              value: parseFloat(b[2]),
              label: prefix + "width",
              isHorizontal: true,
              type: "text",
            });
          }
        }
        break;

      case 1:
        // just column width
        spans.push({
          value: parseFloat(nrMatches[0][2]),
          label: prefix + "width",
          isHorizontal: true,
          type: "text",
        });
        break;

      case 0:
        throw new ParsingError(
          `Empty column ${colIndex}: "${colText}"`,
          formula,
          index,
          colText.length
        );
    }

    return spans;
  }

  /**
   * Parse the width portion of the formula using exact legacy logic.
   */
  private parseWidth(
    text: string,
    formula: string
  ): {
    width: CodLayoutValue;
    spans: CodLayoutSpan[];
  } {
    const spans: CodLayoutSpan[] = [];
    let totalWidth = 0;

    // remove all spaces for consistent parsing (matches legacy)
    const cleanText = text.replace(/\s+/g, "");

    // extract margins using legacy regex
    const mlMatch = ITCodLayoutFormulaService.MARGIN_LEFT_REGEX.exec(cleanText);
    const mrMatch =
      ITCodLayoutFormulaService.MARGIN_RIGHT_REGEX.exec(cleanText);

    if (!mlMatch || !mrMatch) {
      throw new ParsingError(
        "Missing margins in width details",
        formula,
        0,
        text.length
      );
    }

    const ml = parseFloat(mlMatch[1]);
    const mr = parseFloat(mrMatch[1]);

    spans.push({
      value: ml,
      label: "margin-left",
      isHorizontal: true,
    });
    totalWidth += ml;

    // strip margins to get columns only (matches legacy logic)
    const cols = cleanText.substring(
      mlMatch[0].length,
      mlMatch[0].length + (mrMatch.index! - mlMatch[0].length)
    );

    // process gaps and columns exactly like legacy
    const gapRegex = /\((\d+)\)/g;
    let gapMatch: RegExpExecArray | null;
    let start = 0;
    let colIndex = 0;

    while ((gapMatch = gapRegex.exec(cols))) {
      colIndex++;

      // parse column before this gap
      const colText = cols.substring(start, gapMatch.index!);
      const colSpans = this.parseColumn(
        colText,
        colIndex,
        formula,
        text.indexOf(cols) + start
      );
      spans.push(...colSpans);
      colSpans.forEach((span) => (totalWidth += span.value));

      // add gap span
      spans.push({
        value: parseFloat(gapMatch[1]),
        label: `col-${colIndex}-gap`,
        isHorizontal: true,
      });
      totalWidth += parseFloat(gapMatch[1]);

      start = gapMatch.index! + gapMatch[0].length;
    }

    // process the last column if pending
    if (start < cols.length) {
      const colText = cols.substring(start);
      const colSpans = this.parseColumn(
        colText,
        ++colIndex,
        formula,
        text.indexOf(cols) + start
      );
      spans.push(...colSpans);
      colSpans.forEach((span) => (totalWidth += span.value));
    }

    spans.push({
      value: mr,
      label: "margin-right",
      isHorizontal: true,
    });
    totalWidth += mr;

    return {
      width: { value: totalWidth },
      spans,
    };
  }

  /**
   * Parse a codicological layout formula from a text string using exact legacy logic.
   */
  public parseFormula(text?: string | null): ErrorWrapper<CodLayoutFormula | null, ParsingError> {
    try {
      if (!text?.trim()) {
        return { result: null };
      }

      // remove whitespaces exactly like legacy
      const input = text.replace(/\s+/g, "");

      // match main sections using legacy regex
      const match = ITCodLayoutFormulaService.SECT_REGEX.exec(input);
      if (!match) {
        throw new ParsingError(
          "Invalid formula (expected H x W = height x width)",
          input,
          0,
          input.length
        );
      }

      const formula: CodLayoutFormula = {
        type: "IT",
        unit: "mm",
        width: { value: 0 },
        height: { value: 0 },
        spans: [],
      };

      // parse declared dimensions
      const declaredHeight = parseFloat(match[1]);
      const declaredWidth = parseFloat(match[2]);

      // parse height details
      const heightResult = this.parseHeight(match[3], input);
      formula.height = { value: declaredHeight };
      formula.spans.push(...heightResult.spans);

      // parse width details
      const widthResult = this.parseWidth(match[4], input);
      formula.width = { value: declaredWidth };
      formula.spans.push(...widthResult.spans);

      return { result: formula };
    } catch (error) {
      if (error instanceof ParsingError) {
        return { error };
      }
      // Handle any other unexpected errors
      return { error: new ParsingError("Unexpected error during parsing", text || "", 0, 0) };
    }
  }
  //#endregion

  //#region Building
  /**
   * Build the text of a codicological layout formula from a model.
   */
  public buildFormula(formula?: CodLayoutFormula | null): string | null {
    if (!formula) {
      return null;
    }

    const sb: string[] = [];

    // height × width
    sb.push(`${formula.height.value} × ${formula.width.value} = `);

    // height details: build from spans
    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);

    // find specific height spans by label
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    const heSpan = vSpans.find((s) => s.label === "head-e");
    const hwSpan = vSpans.find((s) => s.label === "head-w");
    const ahSpan = vSpans.find((s) => s.label === "area-height");
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");

    // height details: build from vertical spans
    if (mtSpan) sb.push(`${mtSpan.value}`);
    if (heSpan) sb.push(` / ${heSpan.value}`);

    sb.push(" [");
    if (hwSpan) sb.push(`${hwSpan.value} / `);
    if (ahSpan) sb.push(`${ahSpan.value}`);
    if (fwSpan) sb.push(` / ${fwSpan.value}`);
    sb.push("]");

    if (feSpan) sb.push(` ${feSpan.value} /`);
    if (mbSpan) sb.push(` ${mbSpan.value}`);

    sb.push(" × ");

    // width details: build from horizontal spans
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    const mrSpan = hSpans.find((s) => s.label === "margin-right");

    if (mlSpan) sb.push(`${mlSpan.value} `);

    // build columns
    sb.push("[");

    // group spans by column
    const columnSpans = hSpans.filter(
      (s) => s.label && s.label.startsWith("col-") && !s.label.includes("gap")
    );
    const gapSpans = hSpans.filter((s) => s.label?.includes("-gap"));

    // build columns based on actual span labels
    let colNr = 1;

    while (true) {
      // there must be a column span (cw)
      const colW = columnSpans.find((s) => s.label === `col-${colNr}-width`);
      if (!colW) break;

      // find column left and right spans
      const clwSpan = columnSpans.find(
        (s) => s.label === `col-${colNr}-left-w`
      );
      const cleSpan = columnSpans.find(
        (s) => s.label === `col-${colNr}-left-e`
      );
      const crwSpan = columnSpans.find(
        (s) => s.label === `col-${colNr}-right-w`
      );
      const creSpan = columnSpans.find(
        (s) => s.label === `col-${colNr}-right-e`
      );

      const leftSpan = clwSpan || cleSpan;
      const rightSpan = crwSpan || creSpan;

      // if there are both left and right spans, use them with * if empty
      // (we are inside [], which imply text)
      if (leftSpan && rightSpan) {
        const leftMarker = leftSpan.type === "text" ? "" : "*";
        const rightMarker = rightSpan.type === "text" ? "" : "*";
        sb.push(
          `${leftSpan.value}${leftMarker} / ${colW.value} / ${rightSpan.value}${rightMarker}`
        );
      } else if (leftSpan) {
        // if only left span, use it with * if empty
        const leftMarker = leftSpan.type === "text" ? "" : "*";
        sb.push(`${leftSpan.value}${leftMarker} / ${colW.value}`);
      } else if (rightSpan) {
        // if only right span, use it with * if empty
        const rightMarker = rightSpan.type === "text" ? "" : "*";
        sb.push(`${colW.value} / ${rightSpan.value}${rightMarker}`);
      } else {
        // if no left or right span, just use the width
        sb.push(`${colW.value}`);
      }

      // gap
      const gapSpan = gapSpans.find((s) => s.label === `col-${colNr}-gap`);
      if (gapSpan) {
        sb.push(` (${gapSpan.value}) `);
      }

      colNr++;
    }
    // close columns
    sb.push("]");
    // add margin-right if exists
    if (mrSpan) sb.push(` ${mrSpan.value}`);

    // post-processing to move final empty spans outside brackets
    let result = sb.join("");
    
    // match "/ value*]" and replace with "] value /"
    result = result.replace(/\s*\/\s*(\d+)\*\s*\]/g, '] $1 /');

    return result;
  }
  //#endregion
}
