import { CodLayoutArea, CodLayoutSpan } from "./models";

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
}
