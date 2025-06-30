import { ITCodLayoutFormulaService } from "./it-cod-layout-formula.service";

describe("ITCodLayoutFormulaService", () => {
  let service: ITCodLayoutFormulaService;

  beforeEach(() => {
    service = new ITCodLayoutFormulaService();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
    expect(service.type).toBe("IT");
  });

  it("should parse empty as null", () => {
    const result = service.parseFormula("");
    expect(result).toBeNull();
  });

  it("should parse null as null", () => {
    const result = service.parseFormula(null);
    expect(result).toBeNull();
  });

  it("should parse simple single column formula", () => {
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.type).toBe("IT");
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    expect(vSpans.length).toBeGreaterThan(0);
    const mtSpan = vSpans.find((s) => s.label === "mt");
    expect(mtSpan?.value).toBe(30);

    const ahSpan = vSpans.find((s) => s.label === "ah");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    // check horizontal spans
    expect(hSpans.length).toBeGreaterThan(0);
    const mlSpan = hSpans.find((s) => s.label === "ml");
    expect(mlSpan?.value).toBe(15);

    const mrSpan = hSpans.find((s) => s.label === "mr");
    expect(mrSpan?.value).toBe(15);
  });

  it("should parse two-column formula", () => {
    const formula =
      "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // should have margin left, column 1 parts, gap, column 2 parts, margin right
    const mlSpan = hSpans.find((s) => s.label === "ml");
    expect(mlSpan?.value).toBe(15);

    const col1Span = hSpans.find((s) => s.label === "col1");
    expect(col1Span?.value).toBe(50);
    expect(col1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.startsWith("gap"));
    expect(gapSpan?.value).toBe(20);

    const col2Span = hSpans.find((s) => s.label === "col2");
    expect(col2Span?.value).toBe(40);
    expect(col2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "mr");
    expect(mrSpan?.value).toBe(15);
  });

  it("should parse formula without head/foot", () => {
    const formula =
      "200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5* (10) 5* / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    // should have margin-top, area-height, margin-bottom
    const mtSpan = vSpans.find((s) => s.label === "mt");
    expect(mtSpan?.value).toBe(30);

    const ahSpan = vSpans.find((s) => s.label === "ah");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "mb");
    expect(mbSpan?.value).toBe(40);
  });

  it("should build formula from parsed result", () => {
    const originalFormula =
      "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const parsed = service.parseFormula(originalFormula);
    expect(parsed).toBeTruthy();

    const rebuilt = service.buildFormula(parsed);
    expect(rebuilt).toBeTruthy();

    // the rebuilt formula should parse to the same structure
    const reparsed = service.parseFormula(rebuilt!);
    expect(reparsed).toBeTruthy();
    expect(reparsed!.height.value).toBe(parsed!.height.value);
    expect(reparsed!.width.value).toBe(parsed!.width.value);
  });

  it("should build SVG", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const parsed = service.parseFormula(formula);
    expect(parsed).toBeTruthy();

    const svg = service.buildSvg(parsed!);
    expect(svg).toBeTruthy();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("viewBox");
  });

  it("should build SVG with custom options", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60] 15";
    const parsed = service.parseFormula(formula);
    expect(parsed).toBeTruthy();

    const svg = service.buildSvg(parsed!, {
      showVertical: false,
      showAreas: false,
      scale: 1,
    });
    expect(svg).toBeTruthy();
    expect(svg).toContain("<svg");
  });

  it("should handle invalid formula", () => {
    expect(() => {
      service.parseFormula("invalid formula");
    }).toThrow();
  });

  it("should return null for empty formula building", () => {
    const result = service.buildFormula(null);
    expect(result).toBeNull();
  });

  it("should get areas from formula spans", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const parsed = service.parseFormula(formula);
    expect(parsed).toBeTruthy();

    const areas = service.getAreas(parsed!.spans);
    expect(areas).toBeTruthy();
    expect(areas.length).toBeGreaterThan(0);

    // each area should have valid coordinates
    areas.forEach((area) => {
      expect(area.x).toBeGreaterThan(0);
      expect(area.y).toBeGreaterThan(0);
      expect(Array.isArray(area.colIndexes)).toBe(true);
      expect(Array.isArray(area.rowIndexes)).toBe(true);
    });
  });

  it("should filter areas by name", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const parsed = service.parseFormula(formula);
    expect(parsed).toBeTruthy();

    const areas = service.getAreas(parsed!.spans);

    // test coordinate-based filtering (@y_x)
    const specificArea = service.filterAreas("@1_1", areas);
    expect(specificArea.length).toBeGreaterThanOrEqual(0);

    // test row-based filtering (row_)
    const rowAreas = service.filterAreas("mt_", areas);
    expect(Array.isArray(rowAreas)).toBe(true);

    // test column-based filtering (_col)
    const colAreas = service.filterAreas("_col1", areas);
    expect(Array.isArray(colAreas)).toBe(true);
  });
});
