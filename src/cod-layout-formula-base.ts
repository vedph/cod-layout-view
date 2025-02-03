import { CodLayoutArea, CodLayoutSpan, CodLayoutSvgOptions } from "./models";

/**
 * Base class for codicological layout formula services.
 */
export class CodLayoutFormulaBase {
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
}
