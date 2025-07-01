import {
  CodLayoutFormula,
  CodLayoutFormulaService,
  CodLayoutFormulaRenderer,
  CodLayoutSpan,
  CodLayoutValue,
  CodLayoutSvgOptions,
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
  /**
   * The type of the layout formula (IT).
   */
  public readonly type = "IT";

  // main formula pattern: HxW=height×width (matches legacy _sectRegex)
  private static readonly SECT_REGEX = /^(\d+)[Xx×](\d+)=([^Xx×]+)[Xx×](.+)$/;

  // height pattern: mt[/he][ah][/fe]mb or mt[hw/]ah[fw/]mb (matches legacy _heightRegex)
  private static readonly HEIGHT_REGEX =
    /^(\d+)(?:\/(\d+))?\[(?:(\d+)\/)?(\d+)(?:\/(\d+))?\](?:(\d+)\/)?(\d+)/;

  // margin patterns for width (matches legacy _wmlRegex and _wmrRegex)
  private static readonly MARGIN_LEFT_REGEX = /^(\d+)\b/;
  private static readonly MARGIN_RIGHT_REGEX = /\b(\d+)$/;

  // column number extraction (matches legacy _colNRegex)
  private static readonly COL_N_REGEX = /^col-(\d+)-/;

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
    // Remove all whitespace for consistent parsing (matches legacy)
    const cleanText = text.replace(/\s+/g, "");
    const match = ITCodLayoutFormulaService.HEIGHT_REGEX.exec(cleanText);

    if (!match) {
      throw new ParsingError("Invalid height format", formula, 0, text.length);
    }

    const spans: CodLayoutSpan[] = [];
    let totalHeight = 0;

    // Parse height dimensions exactly like legacy parseHeightMatch
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
      label: "mt",
      isHorizontal: false,
    });
    totalHeight += mt;

    // head-e
    if (he !== undefined) {
      spans.push({
        value: he,
        label: "he",
        isHorizontal: false,
      });
      totalHeight += he;
    }

    // head-w
    if (hw !== undefined) {
      spans.push({
        value: hw,
        label: "hw",
        isHorizontal: false,
      });
      totalHeight += hw;
    }

    // area-height
    spans.push({
      value: ah,
      label: "ah",
      isHorizontal: false,
      type: "text",
    });
    totalHeight += ah;

    // foot-w
    if (fw !== undefined) {
      spans.push({
        value: fw,
        label: "fw",
        isHorizontal: false,
      });
      totalHeight += fw;
    }

    // foot-e
    if (fe !== undefined) {
      spans.push({
        value: fe,
        label: "fe",
        isHorizontal: false,
      });
      totalHeight += fe;
    }

    // margin-bottom
    spans.push({
      value: mb,
      label: "mb",
      isHorizontal: false,
    });
    totalHeight += mb;

    // apply correction for ambiguous [N/N] case
    const hwSpan = spans.find((s) => s.label === "hw");
    const ahSpan = spans.find((s) => s.label === "ah");

    if (hwSpan && ahSpan && ahSpan.value < hwSpan.value) {
      // hw is rather ah, ah is rather fw
      const actualAh = hwSpan.value;
      const actualFw = ahSpan.value;

      // remove hw span
      const hwIndex = spans.findIndex((s) => s.label === "hw");
      spans.splice(hwIndex, 1);

      // update ah span
      ahSpan.value = actualAh;

      // add fw span
      spans.push({
        value: actualFw,
        label: "fw",
        isHorizontal: false,
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
   */
  private parseColumn(colText: string, colIndex: number): CodLayoutSpan[] {
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
          throw new Error(
            `Too many numbers in column ${colIndex}: "${colText}"`
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
        });
        break;

      case 2:
        // with 2 N we have various combinations
        const a = nrMatches[0];
        const b = nrMatches[1];

        if (a[3] && b[3]) {
          // both have *
          throw new Error(`No width in column ${colIndex}: "${colText}"`);
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
            throw new Error(
              `Ambiguous values for column ${colIndex}: ${colText}`
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
            });
          } else {
            // a=clx, b=cw (cle if [N, else clw)
            spans.push({
              value: parseFloat(a[2]),
              label: prefix + (a[4] ? "left-e" : "left-w"),
              isHorizontal: true,
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
        throw new Error(`Empty column ${colIndex}: "${colText}"`);
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
      const colSpans = this.parseColumn(colText, colIndex);
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
      const colSpans = this.parseColumn(colText, ++colIndex);
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
  public parseFormula(text?: string | null): CodLayoutFormula | null {
    if (!text?.trim()) {
      return null;
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

    return formula;
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
    const mtSpan = vSpans.find((s) => s.label === "mt");
    const heSpan = vSpans.find((s) => s.label === "he");
    const hwSpan = vSpans.find((s) => s.label === "hw");
    const ahSpan = vSpans.find((s) => s.label === "ah");
    const fwSpan = vSpans.find((s) => s.label === "fw");
    const feSpan = vSpans.find((s) => s.label === "fe");
    const mbSpan = vSpans.find((s) => s.label === "mb");

    // build height pattern
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
    const mlSpan = hSpans.find((s) => s.label === "ml");
    const mrSpan = hSpans.find((s) => s.label === "mr");

    if (mlSpan) sb.push(`${mlSpan.value} `);

    // build columns
    sb.push("[");

    // group spans by column
    const columnSpans = hSpans.filter(
      (s) => s.label && s.label.startsWith("col") && !s.label.includes("gap")
    );
    const gapSpans = hSpans.filter((s) => s.label?.startsWith("gap"));

    // simple column building - this may need refinement based on exact IT syntax
    let colIndex = 1;
    let isFirstCol = true;

    while (true) {
      const colSpan = columnSpans.find((s) => s.label === `col${colIndex}`);
      if (!colSpan) break;

      if (!isFirstCol) {
        const gapSpan = gapSpans.find((s) => s.label === `gap${colIndex - 1}`);
        if (gapSpan) {
          sb.push(` (${gapSpan.value}) `);
        }
      }

      const leftSpan = columnSpans.find((s) => s.label === `col${colIndex}l`);
      const rightSpan = columnSpans.find((s) => s.label === `col${colIndex}r`);

      if (leftSpan && rightSpan) {
        const leftMarker = leftSpan.type ? "" : "*";
        const rightMarker = rightSpan.type ? "" : "*";
        sb.push(
          `${leftSpan.value}${leftMarker} / ${colSpan.value} / ${rightSpan.value}${rightMarker}`
        );
      } else {
        sb.push(`${colSpan.value}`);
      }

      colIndex++;
      isFirstCol = false;
    }

    sb.push("]");

    if (mrSpan) sb.push(` ${mrSpan.value}`);

    return sb.join("");
  }
  //#endregion

  //#region SVG Building
  /**
   * Build SVG code for the visualization of the layout formula.
   */
  public buildSvg(
    formula: CodLayoutFormula,
    options: Partial<CodLayoutSvgOptions> = {}
  ): string {
    const opts = { ...DEFAULT_IT_SVG_OPTIONS, ...options };

    // calculate base dimensions
    const width = formula.width.value * opts.scale! + opts.padding * 2;
    const height = formula.height.value * opts.scale! + opts.padding * 2;

    const svg: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`,
      "<style>",
      `.layout-label { font: ${opts.labelFontSize}px ${opts.labelFontFamily}; }`,
      "</style>",
      `<rect x="${opts.padding}" y="${opts.padding}" ` +
        `width="${formula.width.value * opts.scale!}" ` +
        `height="${formula.height.value * opts.scale!}" ` +
        'fill="none" stroke="#000" stroke-width="1"/>',
    ];

    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);

    // draw areas if enabled
    if (opts.showAreas) {
      const areas = this.getAreas(formula.spans);
      const colorMap = this.mapAreaColors(areas, opts.areaColors);

      // calculate positions and render areas
      let currentY = opts.padding;
      for (let v = 0; v < vSpans.length; v++) {
        let currentX = opts.padding;
        const vSpanHeight = vSpans[v].value * opts.scale!;

        for (let h = 0; h < hSpans.length; h++) {
          const hSpanWidth = hSpans[h].value * opts.scale!;
          const areaKey = `@${v + 1}_${h + 1}`;
          const color = colorMap.get(areaKey) || opts.areaColors.default;

          if (color !== "transparent") {
            svg.push(
              `<rect x="${currentX}" y="${currentY}" ` +
                `width="${hSpanWidth}" height="${vSpanHeight}" ` +
                `fill="${color}" opacity="${opts.areaOpacity}"/>`
            );
          }

          currentX += hSpanWidth;
        }
        currentY += vSpanHeight;
      }
    }

    // draw gridlines
    if (opts.showHorizontal) {
      let currentY = opts.padding;
      for (const span of vSpans) {
        currentY += span.value * opts.scale!;
        const color =
          span.type === "text" ? opts.textAreaLineColor : opts.hLineColor;
        svg.push(
          `<line x1="${opts.padding}" y1="${currentY}" ` +
            `x2="${
              opts.padding + formula.width.value * opts.scale!
            }" y2="${currentY}" ` +
            `stroke="${color}" stroke-width="${opts.hLineWidth}"/>`
        );

        if (opts.showValueLabels && span.label) {
          svg.push(
            `<text x="${opts.padding + 5}" y="${currentY - 5}" ` +
              `class="layout-label" fill="${opts.valueLabelColor}">${span.label}: ${span.value}</text>`
          );
        }
      }
    }

    if (opts.showVertical) {
      let currentX = opts.padding;
      for (const span of hSpans) {
        currentX += span.value * opts.scale!;
        const color =
          span.type === "text" ? opts.textAreaLineColor : opts.vLineColor;
        svg.push(
          `<line x1="${currentX}" y1="${opts.padding}" ` +
            `x2="${currentX}" y2="${
              opts.padding + formula.height.value * opts.scale!
            }" ` +
            `stroke="${color}" stroke-width="${opts.vLineWidth}"/>`
        );

        if (opts.showValueLabels && span.label) {
          svg.push(
            `<text x="${currentX + 5}" y="${opts.padding + 15}" ` +
              `class="layout-label" fill="${opts.valueLabelColor}">${span.label}: ${span.value}</text>`
          );
        }
      }
    }

    svg.push("</svg>");
    return svg.join("\n");
  }
  //#endregion
}
