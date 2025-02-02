import { CodBOLayoutFormulaService } from "./cod-bo-layout-formula.service";
import { ParsingError } from "./models";

describe("CodBOLayoutFormulaService", () => {
  let service: CodBOLayoutFormulaService;

  beforeEach(() => {
    service = new CodBOLayoutFormulaService();
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
      expect(e.index).toBeUndefined();
      expect(e.length).toBeUndefined();
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
    const vspans = formula!.spans.filter(s => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(4);
    expect(vspans[0].isOriginal).toBe(true);
    expect(vspans[0].originalValue).toBeUndefined();

    expect(vspans[1].value).toBe(10);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe('text');

    expect(vspans[2].value).toBe(6);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=2, body=7, margin=3 (all originals)
    const hspans = formula!.spans.filter(s => s.isHorizontal);
    expect(hspans.length).toBe(3);

    expect(hspans[0].value).toBe(2);
    expect(hspans[0].isOriginal).toBe(true);
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(7);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].type).toBe('text');

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
    const vspans = formula!.spans.filter(s => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(4);
    expect(vspans[0].isOriginal).toBeFalsy();
    expect(vspans[0].originalValue).toBe(6);

    expect(vspans[1].value).toBe(10);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe('text');

    expect(vspans[2].value).toBe(6);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=2 (non original), body=7, margin=3
    const hspans = formula!.spans.filter(s => s.isHorizontal);
    expect(hspans.length).toBe(3);

    expect(hspans[0].value).toBe(2);
    expect(hspans[0].isOriginal).toBeFalsy();
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(7);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].type).toBe('text');

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
    const vspans = formula!.spans.filter(s => !s.isHorizontal);
    expect(vspans.length).toBe(3);

    expect(vspans[0].value).toBe(18);
    expect(vspans[0].isOriginal).toBe(true);
    expect(vspans[0].originalValue).toBeUndefined();

    expect(vspans[1].value).toBe(282);
    expect(vspans[1].isOriginal).toBe(true);
    expect(vspans[1].originalValue).toBeUndefined();
    expect(vspans[1].type).toBe('text');

    expect(vspans[2].value).toBe(36);
    expect(vspans[2].isOriginal).toBe(true);
    expect(vspans[2].originalValue).toBeUndefined();

    // horizontal: margin=25, initials=4, body=174, initials=4, margin=33 (all original)
    const hspans = formula!.spans.filter(s => s.isHorizontal);
    expect(hspans.length).toBe(5);

    expect(hspans[0].value).toBe(25);
    expect(hspans[0].isOriginal).toBe(true);
    expect(hspans[0].originalValue).toBeUndefined();

    expect(hspans[1].value).toBe(4);
    expect(hspans[1].isOriginal).toBe(true);
    expect(hspans[1].originalValue).toBeUndefined();
    expect(hspans[1].label).toBe('initials');

    expect(hspans[2].value).toBe(174);
    expect(hspans[2].isOriginal).toBe(true);
    expect(hspans[2].originalValue).toBeUndefined();
    expect(hspans[2].type).toBe('text');

    expect(hspans[3].value).toBe(4);
    expect(hspans[3].isOriginal).toBe(true);
    expect(hspans[3].originalValue).toBeUndefined();
    expect(hspans[3].label).toBe('initials');

    expect(hspans[4].value).toBe(33);
    expect(hspans[4].isOriginal).toBe(true);
    expect(hspans[4].originalValue).toBeUndefined();
  });
    // TODO
});
