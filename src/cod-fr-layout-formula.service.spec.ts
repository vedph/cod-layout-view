import { CodFrLayoutFormulaService } from "./cod-fr-layout-formula.service";
import { ParsingError } from "./models";

describe("CodFrLayoutFormulaService", () => {
  let service: CodFrLayoutFormulaService;

  beforeEach(() => {
    service = new CodFrLayoutFormulaService();
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

  // TODO
});
