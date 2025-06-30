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

  // Main formula pattern: HxW=height×width (based on Angular service)
  private static readonly SECT_REGEX =
    /^(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*=\s*([^×x]+)[×x](.+)$/i;

  // Height pattern: mt[/he][ah][/fe]mb or mt[hw/]ah[fw/]mb (based on Angular service)
  // Pattern: mt / he [ ah / fw ] fe / mb or mt [ hw / ah ] mb etc.
  private static readonly HEIGHT_REGEX =
    /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\s*\[\s*(?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\s*\]\s*(?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)$/;

  // Margin patterns for width
  private static readonly MARGIN_LEFT_REGEX = /^(\d+(?:\.\d+)?)/;
  private static readonly MARGIN_RIGHT_REGEX = /(\d+(?:\.\d+)?)$/;

  // Column number extraction
  private static readonly COL_N_REGEX = /^col-(\d+)-/;

  //#region Parsing
  /**
   * Parse a dimension value that represents a single number.
   */
  private parseSimpleValue(text: string, label?: string): CodLayoutValue {
    const value = parseFloat(text.trim());
    if (isNaN(value)) {
      throw new Error(`Invalid numeric value: ${text}`);
    }
    const result: CodLayoutValue = { value };
    if (label) {
      result.label = label;
    }
    return result;
  }

  /**
   * Parse the height portion of the formula.
   * Pattern matches Angular service: mt[/he][ah][/fe]mb or mt[hw/]ah[fw/]mb
   */
  private parseHeight(
    text: string,
    formula: string
  ): {
    height: CodLayoutValue;
    spans: CodLayoutSpan[];
  } {
    const heightRegex =
      /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\[(?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\](?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)$/;
    const match = heightRegex.exec(text.replace(/\s+/g, "")); // remove all spaces for parsing

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
      ...this.parseSimpleValue(match[1], "mt"),
      isHorizontal: false,
    });
    totalHeight += mt;

    // head-e
    if (he !== undefined) {
      spans.push({
        ...this.parseSimpleValue(match[2]!, "he"),
        isHorizontal: false,
      });
      totalHeight += he;
    }

    // head-w
    if (hw !== undefined) {
      spans.push({
        ...this.parseSimpleValue(match[3]!, "hw"),
        isHorizontal: false,
        type: "text",
      });
      totalHeight += hw;
    }

    // correction for ambiguous [N/N] case
    let actualAh = ah;
    let actualFw = fw;
    if (hw !== undefined && ah < hw) {
      // hw is rather ah, ah is rather fw
      actualAh = hw;
      actualFw = ah;
      // remove hw span and add it as ah
      spans.pop(); // remove hw span
      spans.push({
        value: actualAh,
        label: "ah",
        isHorizontal: false,
        type: "text",
      });
      totalHeight = totalHeight - hw + actualAh;
    } else {
      // area-height
      spans.push({
        ...this.parseSimpleValue(match[4], "ah"),
        isHorizontal: false,
        type: "text",
      });
      totalHeight += ah;
    }

    // foot-w
    if (actualFw !== undefined) {
      spans.push({
        value: actualFw,
        label: "fw",
        isHorizontal: false,
        type: "text",
      });
      totalHeight += actualFw;
    } else if (fw !== undefined) {
      spans.push({
        ...this.parseSimpleValue(match[5]!, "fw"),
        isHorizontal: false,
        type: "text",
      });
      totalHeight += fw;
    }

    // foot-e
    if (fe !== undefined) {
      spans.push({
        ...this.parseSimpleValue(match[6]!, "fe"),
        isHorizontal: false,
      });
      totalHeight += fe;
    }

    // margin-bottom
    spans.push({
      ...this.parseSimpleValue(match[7], "mb"),
      isHorizontal: false,
    });
    totalHeight += mb;

    return {
      height: { value: totalHeight },
      spans,
    };
  }

  /**
   * Parse a column definition following the Angular service logic.
   */
  private parseColumn(colText: string, colIndex: number): CodLayoutSpan[] {
    const spans: CodLayoutSpan[] = [];
    const colLabel = `col${colIndex}`;

    // column has 1-3 N variously separated by / and [],
    // and eventually postfixed with * for empty shapes.
    const nrRegex = /(?:(\]?)(\d+(?:\.\d+)?)(\*)?(\[)?)/g;
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
        // cl, cw, cr
        const ml = nrMatches[0];
        const cle = ml[3] || ml[4]; // has * or [
        spans.push({
          value: parseFloat(ml[2]),
          label: `${colLabel}l`,
          isHorizontal: true,
          type: cle ? undefined : "text",
        });

        spans.push({
          value: parseFloat(nrMatches[1][2]),
          label: colLabel,
          isHorizontal: true,
          type: "text",
        });

        const mr = nrMatches[2];
        const cre = mr[3] || mr[1]; // has * or ]
        spans.push({
          value: parseFloat(mr[2]),
          label: `${colLabel}r`,
          isHorizontal: true,
          type: cre ? undefined : "text",
        });
        break;

      case 2:
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
            label: `${colLabel}l`,
            isHorizontal: true,
            type: undefined,
          });
          spans.push({
            value: parseFloat(b[2]),
            label: colLabel,
            isHorizontal: true,
            type: "text",
          });
        } else if (b[3]) {
          // b has *, so a=cw, b=cre
          spans.push({
            value: parseFloat(a[2]),
            label: colLabel,
            isHorizontal: true,
            type: "text",
          });
          spans.push({
            value: parseFloat(b[2]),
            label: `${colLabel}r`,
            isHorizontal: true,
            type: undefined,
          });
        } else {
          // neither has *, determine by size
          if (parseFloat(a[2]) === parseFloat(b[2])) {
            throw new Error(
              `Ambiguous values for column ${colIndex}: ${colText}`
            );
          }
          if (parseFloat(a[2]) > parseFloat(b[2])) {
            // a=cw, b=cr
            spans.push({
              value: parseFloat(a[2]),
              label: colLabel,
              isHorizontal: true,
              type: "text",
            });
            spans.push({
              value: parseFloat(b[2]),
              label: `${colLabel}r`,
              isHorizontal: true,
              type: b[1] ? undefined : "text", // ]N means empty
            });
          } else {
            // a=cl, b=cw
            spans.push({
              value: parseFloat(a[2]),
              label: `${colLabel}l`,
              isHorizontal: true,
              type: a[4] ? undefined : "text", // [N means empty
            });
            spans.push({
              value: parseFloat(b[2]),
              label: colLabel,
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
          label: colLabel,
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
   * Parse the width portion of the formula.
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

    // remove all spaces for consistent parsing
    const cleanText = text.replace(/\s+/g, "");

    // extract margins
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
      ...this.parseSimpleValue(mlMatch[1], "ml"),
      isHorizontal: true,
    });
    totalWidth += ml;

    // extract content between margins
    const mlLength = mlMatch[0].length;
    const mrStart = mrMatch.index!;
    let content = cleanText.substring(mlLength, mrStart);

    // remove outer brackets if present
    if (content.startsWith("[") && content.endsWith("]")) {
      content = content.substring(1, content.length - 1);
    }

    // parse columns and gaps using the Angular service approach
    const gapRegex = /\((\d+(?:\.\d+)?)\)/g;
    let gapMatch: RegExpExecArray | null;
    let start = 0;
    let colIndex = 1;

    while ((gapMatch = gapRegex.exec(content))) {
      // parse column before this gap
      const colText = content.substring(start, gapMatch.index);
      if (colText) {
        const colSpans = this.parseColumn(colText, colIndex);
        spans.push(...colSpans);
        colSpans.forEach((span) => (totalWidth += span.value));
        colIndex++;
      }

      // add gap
      const gapValue = parseFloat(gapMatch[1]);
      spans.push({
        value: gapValue,
        label: `gap${colIndex - 1}`,
        isHorizontal: true,
      });
      totalWidth += gapValue;

      start = gapMatch.index + gapMatch[0].length;
    }

    // parse last column if any
    if (start < content.length) {
      const colText = content.substring(start);
      if (colText) {
        const colSpans = this.parseColumn(colText, colIndex);
        spans.push(...colSpans);
        colSpans.forEach((span) => (totalWidth += span.value));
      }
    }

    spans.push({
      ...this.parseSimpleValue(mrMatch[1], "mr"),
      isHorizontal: true,
    });
    totalWidth += mr;

    return {
      width: { value: totalWidth },
      spans,
    };
  }

  /**
   * Parse a codicological layout formula from a text string.
   */
  public parseFormula(text?: string | null): CodLayoutFormula | null {
    if (!text?.trim()) {
      return null;
    }

    const input = text.trim();

    // match main sections
    const match = ITCodLayoutFormulaService.SECT_REGEX.exec(input);
    if (!match) {
      throw new ParsingError(
        "Invalid formula format (expected H × W = height × width)",
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
