import { BOCodLayoutFormulaService } from "./bo-cod-layout-formula.service";
import { CodLayoutFormula, ParsingError } from "./models";

describe("BOCodLayoutFormulaService", () => {
  let service: BOCodLayoutFormulaService;

  beforeEach(() => {
    service = new BOCodLayoutFormulaService();
  });

  it("should return null for undefined input", () => {
    const result = service.parseFormula(undefined);
    expect(result.result).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("should return null for null input", () => {
    const result = service.parseFormula(null);
    expect(result.result).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("should return null for empty input", () => {
    const result = service.parseFormula("");
    expect(result.result).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("should return error for odd number of // in formula", () => {
    const text = "20 x 10 = 5 // 10 / 15";
    const result = service.parseFormula(text);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toBe("Odd number of '//' in formula");
    expect(e.input).toBe(text);
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for missing equals sign", () => {
    const invalidFormula = "20 x 10 - 4 // 10 // 6 x 2 // 7 // 3";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Invalid formula (expecting =)");
    expect(e.input).toBe(invalidFormula);
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for invalid size format", () => {
    const invalidFormula = "20 & 10 = 4 // 10 // 6 x 2 // 7 // 3";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Invalid size format");
    expect(e.input).toBe(invalidFormula);
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for missing x separator in details", () => {
    const invalidFormula = "20 x 10 = 4 // 10 // 6 - 2 // 7 // 3";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Invalid formula (expecting x or ×)");
    expect(e.input).toBe(invalidFormula);
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for invalid dimension format", () => {
    const invalidFormula = "20 x 10 = abc // 10 // 6 x 2 // 7 // 3";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Invalid dimension");
    expect(e.input).toBe(invalidFormula);
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should parse formula with explicit unit", () => {
    const formula = service.parseFormula(
      "cm 20 x 10 = 4 // 10 // 6 x 2 // 7 // 3"
    ).result;
    expect(formula?.unit).toBe("cm");

    expect(formula?.height.value).toBe(20);
    expect(formula?.height.isOriginal).toBe(true);
    expect(formula?.height.originalValue).toBeUndefined();

    expect(formula?.width.value).toBe(10);
    expect(formula?.width.isOriginal).toBe(true);
    expect(formula?.width.originalValue).toBeUndefined();
  });

  it("should parse formula without explicit unit", () => {
    const formula = service.parseFormula(
      "20 x 10 = 4 // 10 // 6 x 2 // 7 // 3"
    ).result;
    expect(formula?.unit).toBe("mm");

    expect(formula?.height.value).toBe(20);
    expect(formula?.height.isOriginal).toBe(true);
    expect(formula?.height.originalValue).toBeUndefined();

    expect(formula?.width.value).toBe(10);
    expect(formula?.width.isOriginal).toBe(true);
    expect(formula?.width.originalValue).toBeUndefined();
  });

  it("should parse formula with original height", () => {
    const formula = service.parseFormula(
      "(20) [22] x 10 = 4 [6] // 10 // 6 x 2 // 7 // 3"
    ).result;
    expect(formula?.unit).toBe("mm");

    expect(formula?.height.value).toBe(20);
    expect(formula?.height.isOriginal).toBeFalsy();
    expect(formula?.height.originalValue).toBe(22);

    expect(formula?.width.value).toBe(10);
    expect(formula?.width.isOriginal).toBe(true);
    expect(formula?.width.originalValue).toBeUndefined();
  });

  it("should parse formula with original width", () => {
    const formula = service.parseFormula(
      "20 x (10) [12] = 4 // 10 // 6 x 2 [4] // 7 // 3"
    ).result;
    expect(formula?.unit).toBe("mm");

    expect(formula?.height.value).toBe(20);
    expect(formula?.height.isOriginal).toBe(true);
    expect(formula?.height.originalValue).toBeUndefined();

    expect(formula?.width.value).toBe(10);
    expect(formula?.width.isOriginal).toBeFalsy();
    expect(formula?.width.originalValue).toBe(12);
  });

  it("should parse formula with original height and width", () => {
    const formula = service.parseFormula(
      "(20) [22] x (10) [12] = 4 [6] // 10 // 6 x 2 [4] // 7 // 3"
    ).result;
    expect(formula?.unit).toBe("mm");

    expect(formula?.height.value).toBe(20);
    expect(formula?.height.isOriginal).toBeFalsy();
    expect(formula?.height.originalValue).toBe(22);

    expect(formula?.width.value).toBe(10);
    expect(formula?.width.isOriginal).toBeFalsy();
    expect(formula?.width.originalValue).toBe(12);
  });

  it("should parse formula with original margin-body-margin in both directions", () => {
    const formula = service.parseFormula(
      "20 x 10 = 4 // 10 // 6 x 2 // 7 // 3"
    ).result;
    expect(formula).not.toBeNull();
    expect(formula!.unit).toBe("mm");
    expect(formula!.height.value).toBe(20);
    expect(formula!.height.isOriginal).toBe(true);
    expect(formula!.width.value).toBe(10);
    expect(formula!.width.isOriginal).toBe(true);

    expect(formula!.spans.length).toBe(6);

    // vertical: margin=4, body=10, margin=6 (all originals)
    const vspans = formula!.spans.filter((s) => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(4);
    expect(vspans[0].isOriginal).toBe(true);
    expect(vspans[0].originalValue).toBeUndefined();

    expect(vspans[1].value).toBe(10);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe("text");

    expect(vspans[2].value).toBe(6);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=2, body=7, margin=3 (all originals)
    const hspans = formula!.spans.filter((s) => s.isHorizontal);
    expect(hspans.length).toBe(3);

    expect(hspans[0].value).toBe(2);
    expect(hspans[0].isOriginal).toBe(true);
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(7);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].type).toBe("text");

    expect(hspans[2].value).toBe(3);
    expect(hspans[2].isOriginal).toBe(true);
    expect(hspans[2].originalValue).toBeUndefined();
  });

  it("should parse formula with original and non-original margin-body-margin in both directions", () => {
    const formula = service.parseFormula(
      "(20) [22] x 10 = (4) [6] // 10 // 6 x (2) // 7 // 3"
    ).result;
    expect(formula).not.toBeNull();
    expect(formula!.unit).toBe("mm");
    expect(formula!.height.value).toBe(20);
    expect(formula!.height.isOriginal).toBeFalsy();
    expect(formula!.height.originalValue).toBe(22);
    expect(formula!.width.value).toBe(10);
    expect(formula!.width.isOriginal).toBe(true);

    expect(formula!.spans.length).toBe(6);

    // vertical: margin=4 (original=6), body=10, margin=6
    const vspans = formula!.spans.filter((s) => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(4);
    expect(vspans[0].isOriginal).toBeFalsy();
    expect(vspans[0].originalValue).toBe(6);

    expect(vspans[1].value).toBe(10);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe("text");

    expect(vspans[2].value).toBe(6);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=2 (non original), body=7, margin=3
    const hspans = formula!.spans.filter((s) => s.isHorizontal);
    expect(hspans.length).toBe(3);

    expect(hspans[0].value).toBe(2);
    expect(hspans[0].isOriginal).toBeFalsy();
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(7);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].type).toBe("text");

    expect(hspans[2].value).toBe(3);
    expect(hspans[2].isOriginal).toBe(true);
    expect(hspans[2].originalValue).toBeUndefined();
  });

  it("should parse formula with labelled areas", () => {
    const formula = service.parseFormula(
      "336 x 240 = 18 // 282 // 36 x 25 / 4:initials // 174 // 4:initials / 33"
    ).result;
    expect(formula).not.toBeNull();
    expect(formula!.unit).toBe("mm");
    expect(formula!.height.value).toBe(336);
    expect(formula!.height.isOriginal).toBe(true);
    expect(formula!.width.value).toBe(240);
    expect(formula!.width.isOriginal).toBe(true);

    expect(formula!.spans.length).toBe(8);

    // vertical: margin=18, body=282, margin=36 (all original)
    const vspans = formula!.spans.filter((s) => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(18);
    expect(vspans[0].isOriginal).toBe(true);
    expect(vspans[0].originalValue).toBeUndefined();

    expect(vspans[1].value).toBe(282);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe("text");

    expect(vspans[2].value).toBe(36);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=25, initials=4, body=174, initials=4, margin=33 (all original)
    const hspans = formula!.spans.filter((s) => s.isHorizontal);
    expect(hspans.length).toBe(5);

    expect(hspans[0].value).toBe(25);
    expect(hspans[0].isOriginal).toBe(true);
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(4);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].label).toBe("initials");

    expect(hspans[2].value).toBe(174);
    expect(hspans[2].isOriginal).toBe(true);
    expect(hspans[2].originalValue).toBeUndefined();
    expect(hspans[2].type).toBe("text");

    expect(hspans[3].value).toBe(4);
    expect(hspans[3].isOriginal).toBe(true);
    expect(hspans[3].originalValue).toBeUndefined();
    expect(hspans[3].label).toBe("initials");

    expect(hspans[4].value).toBe(33);
    expect(hspans[4].isOriginal).toBe(true);
    expect(hspans[4].originalValue).toBeUndefined();
  });

  it("should build formula from size with original height and width", () => {
    const formula: CodLayoutFormula = {
      type: "BO",
      unit: "mm",
      height: { value: 20, isOriginal: true },
      width: { value: 10, isOriginal: true },
      spans: [
        { value: 4, isHorizontal: false, isOriginal: true },
        { value: 10, isHorizontal: false, isOriginal: true, type: "text" },
        { value: 6, isHorizontal: false, isOriginal: true },
        { value: 2, isHorizontal: true, isOriginal: true },
        { value: 7, isHorizontal: true, isOriginal: true, type: "text" },
        { value: 3, isHorizontal: true, isOriginal: true },
      ],
    };
    const text = service.buildFormula(formula);
    expect(text).toBe("mm 20 x 10 = 4 // 10 // 6 x 2 // 7 // 3");
  });

  it("should build formula from size with original height and non-original width", () => {
    const formula: CodLayoutFormula = {
      type: "BO",
      unit: "mm",
      height: { value: 20, isOriginal: true },
      width: { value: 10, originalValue: 12 },
      spans: [
        { value: 4, isHorizontal: false, isOriginal: true },
        { value: 10, isHorizontal: false, isOriginal: true, type: "text" },
        { value: 6, isHorizontal: false, isOriginal: true },
        { value: 2, isHorizontal: true, isOriginal: true },
        { value: 7, isHorizontal: true, isOriginal: true, type: "text" },
        { value: 3, isHorizontal: true, isOriginal: true },
      ],
    };
    const text = service.buildFormula(formula);
    expect(text).toBe("mm 20 x (10) [12] = 4 // 10 // 6 x 2 // 7 // 3");
  });

  it("should build formula from size with non-original height and width", () => {
    const formula: CodLayoutFormula = {
      type: "BO",
      unit: "mm",
      height: { value: 20, originalValue: 22 },
      width: { value: 10, isOriginal: true },
      spans: [
        { value: 4, isHorizontal: false, isOriginal: false, originalValue: 6 },
        { value: 10, isHorizontal: false, isOriginal: true, type: "text" },
        { value: 6, isHorizontal: false, isOriginal: true },
        { value: 2, isHorizontal: true, isOriginal: false },
        { value: 7, isHorizontal: true, isOriginal: true, type: "text" },
        { value: 3, isHorizontal: true, isOriginal: true },
      ],
    };
    const text = service.buildFormula(formula);
    expect(text).toBe("mm (20) [22] x 10 = (4) [6] // 10 // 6 x (2) // 7 // 3");
  });

  it("should get 12 areas from 3 vspans by 4 hspans", () => {
    const text = "cm 10 x 8 = 1:mt // 7 // 2:mb x 2:ml / 1:i // 3 // 2:mr";
    const formula = service.parseFormula(text).result;
    const areas = service.getAreas(formula!.spans);
    // areas
    expect(areas.length).toBe(12);
    // y=1,x=1
    let a = areas[0];
    expect(a.y).toBe(1);
    expect(a.x).toBe(1);
    expect(a.rowIndexes).toEqual(["mt"]);
    expect(a.colIndexes).toEqual(["ml"]);
    // y=1,x=2
    a = areas[1];
    expect(a.y).toBe(1);
    expect(a.x).toBe(2);
    expect(a.rowIndexes).toEqual(["mt"]);
    expect(a.colIndexes).toEqual(["i"]);
    // y=1,x=3
    a = areas[2];
    expect(a.y).toBe(1);
    expect(a.x).toBe(3);
    expect(a.rowIndexes).toEqual(["mt"]);
    expect(a.colIndexes).toEqual(["$text"]);
    // y=1,x=4
    a = areas[3];
    expect(a.y).toBe(1);
    expect(a.x).toBe(4);
    expect(a.rowIndexes).toEqual(["mt"]);
    expect(a.colIndexes).toEqual(["mr"]);
    // y=2,x=1
    a = areas[4];
    expect(a.y).toBe(2);
    expect(a.x).toBe(1);
    expect(a.rowIndexes).toEqual(["$text"]);
    expect(a.colIndexes).toEqual(["ml"]);
    // y=2,x=2
    a = areas[5];
    expect(a.y).toBe(2);
    expect(a.x).toBe(2);
    expect(a.rowIndexes).toEqual(["$text"]);
    expect(a.colIndexes).toEqual(["i"]);
    // y=2,x=3
    a = areas[6];
    expect(a.y).toBe(2);
    expect(a.x).toBe(3);
    expect(a.rowIndexes).toEqual(["$text"]);
    expect(a.colIndexes).toEqual(["$text"]);
    // y=2,x=4
    a = areas[7];
    expect(a.y).toBe(2);
    expect(a.x).toBe(4);
    expect(a.rowIndexes).toEqual(["$text"]);
    expect(a.colIndexes).toEqual(["mr"]);
    // y=3,x=1
    a = areas[8];
    expect(a.y).toBe(3);
    expect(a.x).toBe(1);
    expect(a.rowIndexes).toEqual(["mb"]);
    expect(a.colIndexes).toEqual(["ml"]);
    // y=3,x=2
    a = areas[9];
    expect(a.y).toBe(3);
    expect(a.x).toBe(2);
    expect(a.rowIndexes).toEqual(["mb"]);
    expect(a.colIndexes).toEqual(["i"]);
    // y=3,x=3
    a = areas[10];
    expect(a.y).toBe(3);
    expect(a.x).toBe(3);
    expect(a.rowIndexes).toEqual(["mb"]);
    expect(a.colIndexes).toEqual(["$text"]);
    // y=3,x=4
    a = areas[11];
    expect(a.y).toBe(3);
    expect(a.x).toBe(4);
    expect(a.rowIndexes).toEqual(["mb"]);
    expect(a.colIndexes).toEqual(["mr"]);
  });

  it("should return null for null formula", () => {
    const result = service.validateFormula(null as any);
    expect(result).toBeNull();
  });

  it("should return null for undefined formula", () => {
    const result = service.validateFormula(undefined as any);
    expect(result).toBeNull();
  });

  it("should return null for empty formula", () => {
    const result = service.validateFormula("");
    expect(result).toBeNull();
  });

  it("should return null for whitespace-only formula", () => {
    const result = service.validateFormula("   ");
    expect(result).toBeNull();
  });

  it("should return parsing error for invalid formula syntax", () => {
    const invalidFormula = "invalid formula syntax";
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.formula).toBeDefined();
    expect(result!.formula).toContain("Invalid formula");
  });

  it("should return parsing error for formula with odd number of //", () => {
    const invalidFormula = "20 x 10 = 5 // 10 / 15";
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.formula).toBeDefined();
    expect(result!.formula).toContain("Odd number of '//' in formula");
  });

  it("should return null for valid formula with matching dimensions", () => {
    const validFormula = "20 x 10 = 5 // 15 x 4 // 6";
    const result = service.validateFormula(validFormula);

    expect(result).toBeNull();
  });

  it("should return size errors for formula with mismatched height", () => {
    const invalidFormula = "30 x 10 = 5 // 15 x 4 // 6"; // height is 30 but spans sum to 20
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.height).toBeDefined();
    expect(result!.height).toContain("Height 30 does not match v-spans sum 20");
  });

  it("should return size errors for formula with mismatched width", () => {
    const invalidFormula = "20 x 15 = 5 // 15 x 4 // 6"; // width is 15 but spans sum to 10
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.width).toBeDefined();
    expect(result!.width).toContain("Width 15 does not match h-spans sum 10");
  });

  it("should return both height and width errors when both are mismatched", () => {
    const invalidFormula = "30 x 15 = 5 // 15 x 4 // 6"; // both dimensions wrong
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.height).toBeDefined();
    expect(result!.width).toBeDefined();
    expect(result!.height).toContain("Height 30 does not match v-spans sum 20");
    expect(result!.width).toContain("Width 15 does not match h-spans sum 10");
  });

  it("should handle complex formula with labels and types correctly", () => {
    const validFormula =
      "336 x 240 = 18:mt // 282:$text // 36:mb x 25:ml / 4:initials // 174:$text // 4:initials / 33:mr";
    const result = service.validateFormula(validFormula);

    expect(result).toBeNull();
  });

  it("should return size error for complex formula with wrong dimensions", () => {
    const invalidFormula =
      "300 x 240 = 18:mt // 282:$text // 36:mb x 25:ml / 4:initials // 174:$text // 4:initials / 33:mr";
    const result = service.validateFormula(invalidFormula);

    expect(result).not.toBeNull();
    expect(result!.height).toBeDefined();
    expect(result!.height).toContain(
      "Height 300 does not match v-spans sum 336"
    );
  });
});
