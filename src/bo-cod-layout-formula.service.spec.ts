import { BOCodLayoutFormulaService } from "./bo-cod-layout-formula.service";
import { CodLayoutFormula, ParsingError } from "./models";

describe("BOCodLayoutFormulaService", () => {
  let service: BOCodLayoutFormulaService;

  beforeEach(() => {
    service = new BOCodLayoutFormulaService();
  });

  it("should return null for undefined input", () => {
    const formula = service.parseFormula(undefined);
    expect(formula).toBeNull();
  });

  it("should return null for null input", () => {
    const formula = service.parseFormula(null);
    expect(formula).toBeNull();
  });

  it("should return null for empty input", () => {
    const formula = service.parseFormula("");
    expect(formula).toBeNull();
  });

  it("should throw error for odd number of // in formula", () => {
    const text = "20 x 10 = 5 // 10 / 15";
    try {
      service.parseFormula(text);
    } catch (error) {
      expect(error).toBeInstanceOf(ParsingError);
      const e = error as ParsingError;
      expect(e.message).toBe("Odd number of '//' in formula");
      expect(e.input).toBe(text);
      expect(e.index).toBeDefined();
      expect(e.length).toBeDefined();
    }
  });

  it("should throw ParsingError for missing equals sign", () => {
    const invalidFormula = "20 x 10 - 4 // 10 // 6 x 2 // 7 // 3";
    try {
      service.parseFormula(invalidFormula);
      fail("Expected ParsingError to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ParsingError);
      const e = error as ParsingError;
      expect(e.message).toContain("Invalid formula (expecting =)");
      expect(e.input).toBe(invalidFormula);
      expect(e.index).toBeDefined();
      expect(e.length).toBeDefined();
    }
  });

  it("should throw ParsingError for invalid size format", () => {
    const invalidFormula = "20 & 10 = 4 // 10 // 6 x 2 // 7 // 3";
    try {
      service.parseFormula(invalidFormula);
      fail("Expected ParsingError to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ParsingError);
      const e = error as ParsingError;
      expect(e.message).toContain("Invalid size format");
      expect(e.input).toBe(invalidFormula);
      expect(e.index).toBeDefined();
      expect(e.length).toBeDefined();
    }
  });

  it("should throw ParsingError for missing x separator in details", () => {
    const invalidFormula = "20 x 10 = 4 // 10 // 6 - 2 // 7 // 3";
    try {
      service.parseFormula(invalidFormula);
      fail("Expected ParsingError to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ParsingError);
      const e = error as ParsingError;
      expect(e.message).toContain("Invalid formula (expecting x or ×)");
      expect(e.input).toBe(invalidFormula);
      expect(e.index).toBeDefined();
      expect(e.length).toBeDefined();
    }
  });

  it("should throw ParsingError for invalid dimension format", () => {
    const invalidFormula = "20 x 10 = abc // 10 // 6 x 2 // 7 // 3";
    try {
      service.parseFormula(invalidFormula);
      fail("Expected ParsingError to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ParsingError);
      const e = error as ParsingError;
      expect(e.message).toContain("Invalid dimension");
      expect(e.input).toBe(invalidFormula);
      expect(e.index).toBeDefined();
      expect(e.length).toBeDefined();
    }
  });

  it("should parse formula with explicit unit", () => {
    const formula = service.parseFormula(
      "cm 20 x 10 = 4 // 10 // 6 x 2 // 7 // 3"
    );
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
    );
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
    );
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
    );
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
    );
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
    );
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
    );
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
    );
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
    const formula = service.parseFormula(text);
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

  describe("filterFormulaLabels", () => {
    it("should return empty array for empty labels input", () => {
      const formula = "cm 10 x 8 = 1:mt // 7 // 2:mb x 2:ml / 1:i // 3 // 2:mr";
      const result = service.filterFormulaLabels(formula, []);
      expect(result).toEqual([]);
    });

    it("should return empty array when formula cannot be parsed", () => {
      const invalidFormula = "invalid formula";
      const labels = ["mt", "ml", "invalid"];
      const result = service.filterFormulaLabels(invalidFormula, labels);
      expect(result).toEqual([]);
    });

    it("should return empty array for null formula", () => {
      const labels = ["mt", "ml", "invalid"];
      const result = service.filterFormulaLabels(null as any, labels);
      expect(result).toEqual([]);
    });

    it("should filter labels based on formula string with labels", () => {
      const formula = "cm 10 x 8 = 1:mt // 7 // 2:mb x 2:ml / 1:i // 3 // 2:mr";
      const labels = ["mt", "mb", "ml", "i", "mr", "invalid", "another"];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual(["mt", "mb", "ml", "i", "mr"]);
    });

    it("should filter labels based on formula string without labels", () => {
      const formula = "20 x 10 = 4 // 10 // 6 x 2 // 7 // 3";
      const labels = ["mt", "mb", "ml", "invalid"];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([]);
    });

    it("should filter labels based on formula object", () => {
      const formula: CodLayoutFormula = {
        type: "BO",
        unit: "mm",
        height: { value: 20, label: "height-label" },
        width: { value: 10, label: "width-label" },
        spans: [
          { value: 4, isHorizontal: false, label: "top-margin" },
          { value: 10, isHorizontal: false, type: "text", label: "text-area" },
          { value: 6, isHorizontal: false, label: "bottom-margin" },
          { value: 2, isHorizontal: true, label: "left-margin" },
          { value: 7, isHorizontal: true, type: "text" }, // no label
          { value: 3, isHorizontal: true, label: "right-margin" },
        ],
      };
      const labels = [
        "height-label",
        "width-label",
        "top-margin",
        "text-area",
        "bottom-margin",
        "left-margin",
        "right-margin",
        "invalid",
        "another",
      ];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([
        "height-label",
        "width-label",
        "top-margin",
        "text-area",
        "bottom-margin",
        "left-margin",
        "right-margin",
      ]);
    });

    it("should handle formula with partial labels", () => {
      const formula =
        "336 x 240 = 18 // 282 // 36 x 25 / 4:initials // 174 // 4:initials / 33";
      const labels = ["initials", "margin", "text", "invalid"];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual(["initials"]);
    });

    it("should return empty array when no labels match", () => {
      const formula = "cm 10 x 8 = 1:mt // 7 // 2:mb x 2:ml / 1:i // 3 // 2:mr";
      const labels = ["invalid", "another", "notfound"];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([]);
    });
  });
});
