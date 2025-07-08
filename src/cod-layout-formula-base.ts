import {
  CodLayoutArea,
  CodLayoutFormula,
  CodLayoutFormulaRenderer,
  CodLayoutFormulaService,
  CodLayoutSpan,
  CodLayoutSvgOptions,
  CodLayoutValue,
  ErrorWrapper,
  ParsingError,
} from "./models";

/**
 * Base class for codicological layout formula services.
 */
export abstract class CodLayoutFormulaBase
  implements CodLayoutFormulaService, CodLayoutFormulaRenderer
{
  public abstract type: string;

  public abstract filterFormulaLabels(
    formula: string | CodLayoutFormula,
    labels: string[]
  ): string[];

  public abstract parseFormula(
    text?: string | null
  ): ErrorWrapper<CodLayoutFormula | null, ParsingError>;

  public abstract buildFormula(
    formula?: CodLayoutFormula | null
  ): string | null;

  private getColumnAreas(spans: CodLayoutSpan[]): CodLayoutArea[] {
    const areas: CodLayoutArea[] = [];
    if (spans.length === 0) {
      return areas;
    }

    for (let i = 0; i < spans.length; i++) {
      const area: CodLayoutArea = {
        y: 0,
        x: i + 1,
        colIndexes: [],
        rowIndexes: [],
      };
      if (spans[i].label) {
        area.colIndexes.push(spans[i].label!);
      }
      if (spans[i].type) {
        area.colIndexes.push(`$${spans[i].type}`);
      }
      areas.push(area);
    }

    return areas;
  }

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
  public getAreas(spans: CodLayoutSpan[]): CodLayoutArea[] {
    if (!spans?.length) {
      return [];
    }

    // calculate columns
    const cols = this.getColumnAreas(spans.filter((s) => s.isHorizontal));

    // for each row, intersect with columns to generate areas
    const vspans = spans.filter((s) => !s.isHorizontal);
    const areas: CodLayoutArea[] = [];

    for (let v = 0; v < vspans.length; v++) {
      for (let c = 0; c < cols.length; c++) {
        const area: CodLayoutArea = {
          y: v + 1,
          x: c + 1,
          colIndexes: cols[c].colIndexes,
          rowIndexes: [],
        };
        if (vspans[v].label) {
          area.rowIndexes.push(vspans[v].label!);
        }
        if (vspans[v].type) {
          area.rowIndexes.push(`$${vspans[v].type}`);
        }
        areas.push(area);
      }
    }
    return areas;
  }

  /**
   * Filter areas by name.
   * @param name The area name. This can be @y_x when matching by y and x values,
   * or any combination of row and column indexes, separated by underscore
   * (`row_col`), or just a row (with form `row_`) or column (with form `_col`)
   * index.
   * @param areas The areas to search in.
   * @returns The areas that match the name.
   */
  public filterAreas(name: string, areas: CodLayoutArea[]): CodLayoutArea[] {
    if (!name) {
      return [...areas];
    }

    // if name starts with @, it's @y_x
    if (name.startsWith("@")) {
      const i = name.indexOf("_");
      const y = parseInt(name.substring(1, i), 10);
      const x = parseInt(name.substring(i + 1), 10);
      return areas.filter((a) => a.y === y && a.x === x);
    }

    // if name starts with _, it's _col
    if (name.startsWith("_")) {
      return areas.filter((a) =>
        a.colIndexes.some((c) => c === name.substring(1))
      );
    }

    // if name ends with _, it's row_
    if (name.endsWith("_")) {
      return areas.filter((a) =>
        a.rowIndexes.some((r) => r === name.substring(0, name.length - 1))
      );
    }

    // assuming that name is row_col, find the first area having any
    // of its rowIndexes equal to row, and any of its colIndexes equal to col
    const i = name.indexOf("_");
    const row = name.substring(0, i);
    const col = name.substring(i + 1);
    return areas.filter(
      (a) =>
        a.rowIndexes.some((r) => r === row) &&
        a.colIndexes.some((c) => c === col)
    );
  }

  /**
   * Map area colors from options. For each area name in options.areaColors,
   * it finds all the matching areas in the list of areas and returns a map
   * where keys are area names in form `@y_x` and values are colors.
   * This is used when rendering areas in the SVG, as options provide colors
   * keyed with any form (`@y_x`, `row_col`, `row_`, `_col`), while rendered
   * areas are only identified by row (y) and column (x) ordinals. So, the
   * map is used to match the colors with the areas.
   * @param colors The colors options (name=color).
   * @returns Map where keys are area names in form `@y_x` and values are colors.
   */
  protected mapAreaColors(
    areas: CodLayoutArea[],
    colors?: { [key: string]: string }
  ): Map<string, string> {
    const map = new Map<string, string>();
    if (colors) {
      for (const [name, color] of Object.entries(colors)) {
        const matching = this.filterAreas(name, areas);
        for (const area of matching) {
          map.set(`@${area.y}_${area.x}`, color);
        }
      }
    }
    return map;
  }

  /**
   * Validate the size of the given formula. A size is valid when its height
   * is equal to the sum of the values of all vertical spans, and its width
   * is equal to the sum of the values of all horizontal spans.
   * @param formula The formula to validate.
   * @returns An object with error messages keyed by span label, or null if valid.
   */
  public validateFormulaSize(
    formula: CodLayoutFormula
  ): { [key: string]: string } | null {
    if (!formula || !formula.spans || formula.spans.length === 0) {
      return null; // no spans to validate
    }
    const errors: { [key: string]: string } = {};

    const h: number = formula.height.value || 0;
    const w: number = formula.width.value || 0;

    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);

    const vspanSum: number = vSpans.reduce((sum, s) => sum + s.value || 0, 0);
    const hspanSum: number = hSpans.reduce((sum, s) => sum + s.value || 0, 0);

    if (h !== vspanSum) {
      errors.height = `Height ${h} does not match v-spans sum ${vspanSum}`;
    }
    if (w !== hspanSum) {
      errors.width = `Width ${w} does not match h-spans sum ${hspanSum}`;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validate the given formula.
   * @param formula The formula to validate.
   * @returns An object with error messages keyed by span label, or null if valid.
   * If the formula is empty, returns null.
   */
  public validateFormula(formula?: string): { [key: string]: string } | null {
    if (!formula?.trim()) {
      return null;
    }
    const errors: { [key: string]: string } = {};

    // parse formula checking for errors
    let parsedFormula: CodLayoutFormula | null = null;
    const parseResult = this.parseFormula(formula);
    if (parseResult.error) {
      errors.formula = parseResult.error.message || "Invalid formula string";
      return errors;
    }
    parsedFormula = parseResult.result!;

    // validate size
    const sizeErrors = this.validateFormulaSize(parsedFormula!);
    if (sizeErrors) {
      Object.assign(errors, sizeErrors);
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Build the SVG for the given formula.
   * @param formula The formula to build the SVG for.
   * @param options The layout options.
   * @returns The SVG string.
   */
  public buildSvg(
    formula: CodLayoutFormula,
    options: Partial<CodLayoutSvgOptions>
  ): string {
    if (!formula) {
      return "";
    }

    // set up default options
    const opts: CodLayoutSvgOptions = {
      showVertical: true,
      showHorizontal: true,
      showAreas: true,
      useOriginal: false,
      showToolbar: false,
      vLineColor: "#666",
      hLineColor: "#666",
      textAreaLineColor: "#00f",
      vLineWidth: 1,
      hLineWidth: 1,
      areaGap: 0,
      labelColor: "#333",
      labelFontSize: 10,
      labelFontFamily: "Arial",
      labelColors: {},
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
      ...options,
    };

    const getSize = (
      value: CodLayoutValue
    ): { size: number; isFallback?: boolean } => {
      if (opts.useOriginal && value.originalValue !== undefined) {
        return { size: value.originalValue, isFallback: false };
      }
      return { size: value.value, isFallback: opts.useOriginal };
    };

    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);

    // calculate label space requirements
    const maxLabelWidth = this.calculateMaxLabelWidth(vSpans, opts);
    const maxLabelHeight = this.calculateMaxLabelHeight(hSpans, opts);

    // calculate total SVG dimensions including space for labels
    const sheetWidth = getSize(formula.width).size * opts.scale!;
    const sheetHeight = getSize(formula.height).size * opts.scale!;
    const totalWidth = sheetWidth + opts.padding * 2 + maxLabelWidth;
    const totalHeight = sheetHeight + opts.padding * 2 + maxLabelHeight;

    // offset for the sheet rectangle to leave space for labels
    const sheetOffsetX = opts.padding + maxLabelWidth;
    const sheetOffsetY = opts.padding + maxLabelHeight;

    const svg: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" style="user-select: none;">`,
      "<defs>",
      `<style type="text/css">`,
      `.layout-label { font: ${opts.labelFontSize}px ${opts.labelFontFamily}; dominant-baseline: middle; }`,
      `.value-label { font: ${opts.labelFontSize}px ${opts.labelFontFamily}; }`,
      "</style>",
      "</defs>",
    ];

    // add pan and zoom functionality
    svg.push('<g id="viewport">', '<g id="content">');

    // draw the main sheet rectangle
    svg.push(
      `<rect x="${sheetOffsetX}" y="${sheetOffsetY}" ` +
        `width="${sheetWidth}" height="${sheetHeight}" ` +
        'fill="none" stroke="#000" stroke-width="1"/>'
    );

    // draw areas if enabled
    if (opts.showAreas) {
      this.renderAreas(formula, opts, svg, sheetOffsetX, sheetOffsetY, getSize);
    }

    // draw vertical spans (horizontal gridlines)
    if (opts.showHorizontal) {
      this.renderHorizontalGridlines(
        vSpans,
        opts,
        svg,
        sheetOffsetX,
        sheetOffsetY,
        sheetWidth,
        totalWidth,
        maxLabelWidth,
        getSize,
        formula.unit
      );
    }

    // draw horizontal spans (vertical gridlines)
    if (opts.showVertical) {
      this.renderVerticalGridlines(
        hSpans,
        opts,
        svg,
        sheetOffsetX,
        sheetOffsetY,
        sheetHeight,
        totalHeight,
        maxLabelHeight,
        getSize,
        formula.unit
      );
    }

    svg.push("</g>", "</g>", "</svg>");
    return svg.join("\n");
  }

  private calculateMaxLabelWidth(
    spans: CodLayoutSpan[],
    opts: CodLayoutSvgOptions
  ): number {
    if (!spans.length) return 0;
    const maxLabelLength = Math.max(
      ...spans.map((s) => (s.label || "").length),
      0
    );
    // Rough estimation: 0.6 * fontSize * characters + some padding
    return maxLabelLength > 0
      ? maxLabelLength * opts.labelFontSize * 0.6 + 10
      : 0;
  }

  private calculateMaxLabelHeight(
    spans: CodLayoutSpan[],
    opts: CodLayoutSvgOptions
  ): number {
    if (!spans.length) return 0;
    const maxLabelLength = Math.max(
      ...spans.map((s) => (s.label || "").length),
      0
    );
    // For vertical text, height is based on label length
    return maxLabelLength > 0
      ? maxLabelLength * opts.labelFontSize * 0.6 + 10
      : 0;
  }

  private renderAreas(
    formula: CodLayoutFormula,
    opts: CodLayoutSvgOptions,
    svg: string[],
    sheetOffsetX: number,
    sheetOffsetY: number,
    getSize: (value: CodLayoutValue) => { size: number; isFallback?: boolean }
  ): void {
    const vSpans = formula.spans.filter((s) => !s.isHorizontal);
    const hSpans = formula.spans.filter((s) => s.isHorizontal);
    const areas = this.getAreas(formula.spans);
    const colorMap = this.mapAreaColors(areas, opts.areaColors);

    // When both gridlines are hidden, don't render any areas
    if (!opts.showHorizontal && !opts.showVertical) {
      return;
    }

    // When only vertical gridlines are shown, render full-width rectangles for vertical text spans
    if (opts.showVertical && !opts.showHorizontal) {
      let currentY = sheetOffsetY;
      const sheetWidth = getSize(formula.width).size * opts.scale!;

      for (let v = 0; v < vSpans.length; v++) {
        const vSpanHeight = getSize(vSpans[v]).size * opts.scale!;
        let fillColor = opts.areaColors.default;

        // color spans with type="text"
        if (vSpans[v].type === "text") {
          fillColor = opts.areaColors.$text_$text || "#adadad";
        }

        // check for specific area colors for this vertical span
        const vSpanKey = vSpans[v].label
          ? vSpans[v].label
          : `$${vSpans[v].type || "default"}`;
        if (opts.areaColors[`${vSpanKey}_`]) {
          fillColor = opts.areaColors[`${vSpanKey}_`];
        }

        if (fillColor !== "transparent") {
          svg.push(
            `<rect x="${sheetOffsetX + (opts.areaGap || 0)}" y="${
              currentY + (opts.areaGap || 0)
            }" ` +
              `width="${sheetWidth - 2 * (opts.areaGap || 0)}" height="${
                vSpanHeight - 2 * (opts.areaGap || 0)
              }" ` +
              `fill="${fillColor}" opacity="${opts.areaOpacity}"/>`
          );
        }

        currentY += vSpanHeight;
      }
      return;
    }

    // When only horizontal gridlines are shown, render full-height rectangles for horizontal text spans
    if (opts.showHorizontal && !opts.showVertical) {
      let currentX = sheetOffsetX;
      const sheetHeight = getSize(formula.height).size * opts.scale!;

      for (let h = 0; h < hSpans.length; h++) {
        const hSpanWidth = getSize(hSpans[h]).size * opts.scale!;
        let fillColor = opts.areaColors.default;

        // Color spans with type="text"
        if (hSpans[h].type === "text") {
          fillColor = opts.areaColors.$text_$text || "#adadad";
        }

        // check for specific area colors for this horizontal span
        const hSpanKey = hSpans[h].label
          ? hSpans[h].label
          : `$${hSpans[h].type || "default"}`;
        if (opts.areaColors[`_${hSpanKey}`]) {
          fillColor = opts.areaColors[`_${hSpanKey}`];
        }

        if (fillColor !== "transparent") {
          svg.push(
            `<rect x="${currentX + (opts.areaGap || 0)}" y="${
              sheetOffsetY + (opts.areaGap || 0)
            }" ` +
              `width="${hSpanWidth - 2 * (opts.areaGap || 0)}" height="${
                sheetHeight - 2 * (opts.areaGap || 0)
              }" ` +
              `fill="${fillColor}" opacity="${opts.areaOpacity}"/>`
          );
        }

        currentX += hSpanWidth;
      }
      return;
    }

    // When both gridlines are shown, render intersections as usual
    let currentY = sheetOffsetY;
    for (let v = 0; v < vSpans.length; v++) {
      let currentX = sheetOffsetX;
      const vSpanHeight = getSize(vSpans[v]).size * opts.scale!;

      for (let h = 0; h < hSpans.length; h++) {
        const hSpanWidth = getSize(hSpans[h]).size * opts.scale!;
        const areaKey = `@${v + 1}_${h + 1}`;

        // Determine fill color
        let fillColor = opts.areaColors.default;

        // Check if both spans have type="text" for gray background
        if (vSpans[v].type === "text" && hSpans[h].type === "text") {
          fillColor = opts.areaColors.$text_$text || "#adadad";
        }

        // Override with specific area color if defined
        if (colorMap.has(areaKey)) {
          fillColor = colorMap.get(areaKey)!;
        }

        if (fillColor !== "transparent") {
          svg.push(
            `<rect x="${currentX + (opts.areaGap || 0)}" y="${
              currentY + (opts.areaGap || 0)
            }" ` +
              `width="${hSpanWidth - 2 * (opts.areaGap || 0)}" height="${
                vSpanHeight - 2 * (opts.areaGap || 0)
              }" ` +
              `fill="${fillColor}" opacity="${opts.areaOpacity}"/>`
          );
        }

        currentX += hSpanWidth;
      }
      currentY += vSpanHeight;
    }
  }

  private renderHorizontalGridlines(
    vSpans: CodLayoutSpan[],
    opts: CodLayoutSvgOptions,
    svg: string[],
    sheetOffsetX: number,
    sheetOffsetY: number,
    sheetWidth: number,
    totalWidth: number,
    maxLabelWidth: number,
    getSize: (value: CodLayoutValue) => { size: number; isFallback?: boolean },
    unit?: string
  ): void {
    let currentY = sheetOffsetY;

    for (const span of vSpans) {
      const { size, isFallback } = getSize(span);
      currentY += size * opts.scale!;
      const lineColor =
        span.type === "text" ? opts.textAreaLineColor : opts.hLineColor;

      // draw gridline
      svg.push(
        `<line x1="${sheetOffsetX}" y1="${currentY}" ` +
          `x2="${sheetOffsetX + sheetWidth}" y2="${currentY}" ` +
          `stroke="${lineColor}" stroke-width="${opts.hLineWidth}" ` +
          `${
            isFallback ? `stroke-dasharray="${opts.fallbackLineStyle}"` : ""
          }/>`
      );

      // draw label outside the sheet, to the left of the gridline
      if (span.label) {
        const labelColor = opts.labelColors?.[span.label] || opts.labelColor;
        svg.push(
          `<text class="layout-label" x="${
            sheetOffsetX - 5
          }" y="${currentY}" ` +
            `text-anchor="end" fill="${labelColor}">${span.label}</text>`
        );
      }

      // draw value label outside the sheet, to the right
      if (opts.showValueLabels) {
        svg.push(
          `<text class="value-label" x="${
            sheetOffsetX + sheetWidth + 5
          }" y="${currentY}" ` +
            `text-anchor="start" fill="${opts.valueLabelColor}">${size}${
              unit || ""
            }</text>`
        );
      }
    }
  }

  private renderVerticalGridlines(
    hSpans: CodLayoutSpan[],
    opts: CodLayoutSvgOptions,
    svg: string[],
    sheetOffsetX: number,
    sheetOffsetY: number,
    sheetHeight: number,
    totalHeight: number,
    maxLabelHeight: number,
    getSize: (value: CodLayoutValue) => { size: number; isFallback?: boolean },
    unit?: string
  ): void {
    let currentX = sheetOffsetX;

    for (const span of hSpans) {
      const { size, isFallback } = getSize(span);
      currentX += size * opts.scale!;
      const lineColor =
        span.type === "text" ? opts.textAreaLineColor : opts.vLineColor;

      // draw gridline
      svg.push(
        `<line x1="${currentX}" y1="${sheetOffsetY}" ` +
          `x2="${currentX}" y2="${sheetOffsetY + sheetHeight}" ` +
          `stroke="${lineColor}" stroke-width="${opts.vLineWidth}" ` +
          `${
            isFallback ? `stroke-dasharray="${opts.fallbackLineStyle}"` : ""
          }/>`
      );

      // draw label outside the sheet, above the gridline (rotated)
      if (span.label) {
        const labelColor = opts.labelColors?.[span.label] || opts.labelColor;
        svg.push(
          `<text class="layout-label" x="${currentX}" y="${
            sheetOffsetY - 5
          }" ` +
            `text-anchor="end" transform="rotate(-90, ${currentX}, ${
              sheetOffsetY - 5
            })" ` +
            `fill="${labelColor}">${span.label}</text>`
        );
      }

      // draw value label outside the sheet, below (rotated)
      if (opts.showValueLabels) {
        svg.push(
          `<text class="value-label" x="${currentX}" y="${
            sheetOffsetY + sheetHeight + 15
          }" ` +
            `text-anchor="start" transform="rotate(-90, ${currentX}, ${
              sheetOffsetY + sheetHeight + 15
            })" ` +
            `fill="${opts.valueLabelColor}">${size}${unit || ""}</text>`
        );
      }
    }
  }

  /**
   * Download the SVG representation of a formula as an SVG file.
   * @param formula The formula to download as SVG.
   * @param options The layout options for the SVG.
   * @param filename The filename for the downloaded file (without extension).
   */
  public downloadSvg(
    formula: CodLayoutFormula,
    options: Partial<CodLayoutSvgOptions>,
    filename: string = "layout-formula"
  ): void {
    if (!formula) {
      return;
    }

    // generate the SVG content
    const svgContent = this.buildSvg(formula, options);

    // create a blob with the SVG content
    const blob = new Blob([svgContent], { type: "image/svg+xml" });

    // create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;

    // trigger the download
    document.body.appendChild(link);
    link.click();

    // clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
