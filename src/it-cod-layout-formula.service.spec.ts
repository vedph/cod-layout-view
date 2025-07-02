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

  it("should parse single column clw-cw-crw", () => {
    //                           mt   he ah    fw mb   ml clw  cw  crw mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.type).toBe("IT");
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    expect(vSpans.length).toBe(5);
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans
    expect(hSpans.length).toBe(5);
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(3);
    expect(col1lwSpan?.type).toBe("text");

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const col1rwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(col1rwSpan?.value).toBe(5);
    expect(col1rwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse single column cle-cw-crw", () => {
    //                           mt   he ah    fw mb   ml  cle cw  crw mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1leSpan = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(col1leSpan?.value).toBe(3);
    expect(col1leSpan?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const col1rwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(col1rwSpan?.value).toBe(5);
    expect(col1rwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse single column clw-cw-cre", () => {
    //                           mt   he ah    fw mb   ml clw  cw  cre mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(3);
    expect(col1lwSpan?.type).toBe("text");

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse single column cle-cw-cre", () => {
    //                           mt   he ah    fw mb   ml   cle  cw cre  mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1leSpan = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(col1leSpan?.value).toBe(3);
    expect(col1leSpan?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse two-column formula", () => {
    const formula =
      //             mt   he ah    fw mb   ml  11111111111 gap  222222222   mr
      //                                       clw cw  crw      clw cw  cre
      "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // check vertical spans
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(5);
    expect(col1lwSpan?.type).toBe("text");

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBeUndefined();

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(20);
    expect(gapSpan?.type).toBeUndefined();

    const col2lwSpan = hSpans.find((s) => s.label?.includes("col-2-left-w"));
    expect(col2lwSpan?.value).toBe(5);
    expect(col2lwSpan?.type).toBe("text");

    const col2wSpan = hSpans.find((s) => s.label?.includes("col-2-width"));
    expect(col2wSpan?.value).toBe(40);
    expect(col2wSpan?.type).toBe("text");

    const col2reSpan = hSpans.find((s) => s.label?.includes("col-2-right-e"));
    expect(col2reSpan?.value).toBe(5);
    expect(col2reSpan?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse two-column formula with x separator", () => {
    const formula =
      //             mt  ah   mb   ml  1111111111 gap  2222222222  mr
      //                               clw cw  crw     clw cw  crw
      "200 x 160 = 30 [130] 40 x 15 [5 / 50 / 5 (10) 5 / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // verify it handles x separator correctly for both height and width
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // check horizontal spans for two columns
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(5);
    expect(col1lwSpan?.type).toBe("text");

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const col2wSpan = hSpans.find((s) => s.label?.includes("col-2-width"));
    expect(col2wSpan?.value).toBe(50);
    expect(col2wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse formula without head/foot", () => {
    const formula =
      //           mt ah    mb   ml  11111111111 gap  22222222222  mr
      //                             clw cw  crw     clw   cw  crw
      "200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5* (10) 5* / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // should have margin-top, area-height, margin-bottom (no head/foot)
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // should NOT have head/foot spans
    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan).toBeUndefined();

    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan).toBeUndefined();
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan).toBeUndefined();
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan).toBeUndefined();

    // check horizontal spans - two columns with gaps
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(5);
    expect(col1lwSpan?.type).toBe("text");

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text");

    // first column right should be empty (marked with *)
    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBeUndefined();

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    // second column left should be empty (marked with *)
    const col2leSpan = hSpans.find((s) => s.label?.includes("col-2-left-e"));
    expect(col2leSpan?.value).toBe(5);
    expect(col2leSpan?.type).toBeUndefined();

    const col2wSpan = hSpans.find((s) => s.label?.includes("col-2-width"));
    expect(col2wSpan?.value).toBe(50);
    expect(col2wSpan?.type).toBe("text");

    const col2rwSpan = hSpans.find((s) => s.label?.includes("col-2-right-w"));
    expect(col2rwSpan?.value).toBe(5);
    expect(col2rwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt ah mb", () => {
    //                           mt  ah   mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [130] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // should NOT have head/foot spans
    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan).toBeUndefined();
    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan).toBeUndefined();
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan).toBeUndefined();
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan).toBeUndefined();
  });

  it("should parse mt he ah mb", () => {
    //                           mt   he ah    mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 / 10 [120] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(10);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // should NOT have hw, fe, fw spans
    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan).toBeUndefined();
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan).toBeUndefined();
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan).toBeUndefined();
  });

  it("should parse mt hw ah mb", () => {
    //                           mt  hw   ah   mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [10 / 120] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan?.value).toBe(10);
    expect(hwSpan?.type).toBe("text");

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // should NOT have he, fe, fw spans
    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan).toBeUndefined();
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan).toBeUndefined();
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan).toBeUndefined();
  });

  it("should parse mt ah fe mb", () => {
    //                           mt  ah   fe   mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [120] 10 / 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();
    
    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");
    
    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan?.value).toBe(10);
    expect(feSpan?.type).toBeUndefined();
    
    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt ah fw mb", () => {
    //                           mt  ah    fw  mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [120 / 10] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(10);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt he ah fe mb", () => {
    //                           mt   he ah   fe  mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 / 5 [120] 5 / 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan?.value).toBe(5);
    expect(feSpan?.type).toBeUndefined();

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt he ah fw mb", () => {
    //                           mt   he ah   fw  mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 / 5 [120 / 5] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt hw ah fe mb", () => {
    //                           mt  hw   ah  fe  mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [5 / 120] 5 / 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan?.value).toBe(5);
    expect(hwSpan?.type).toBe("text");

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const feSpan = vSpans.find((s) => s.label === "foot-e");
    expect(feSpan?.value).toBe(5);
    expect(feSpan?.type).toBeUndefined();

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse mt hw ah fw mb", () => {
    //                           mt  hw  ah   fw  mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 [5 / 120 / 5] 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.height.value).toBe(200);
    expect(result!.width.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const hwSpan = vSpans.find((s) => s.label === "head-w");
    expect(hwSpan?.value).toBe(5);
    expect(hwSpan?.type).toBe("text");

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(120);
    expect(ahSpan?.type).toBe("text");

    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(130);
    expect(col1wSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml cw mr", () => {
    //                           mt  ah   mb   ml  cw   mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [130] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(130);
    expect(cwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml cle cw mr", () => {
    //                           mt  ah   mb   ml  cle cw    mr
    const formula = "200 × 200 = 30 [130] 40 × 30 / 10 [120] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cleSpan = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cleSpan?.value).toBe(10);
    expect(cleSpan?.type).toBeUndefined();

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml clw cw mr", () => {
    //                           mt  ah   mb   ml  clw  cw   mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [10 / 120] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const clwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clwSpan?.value).toBe(10);
    expect(clwSpan?.type).toBe("text");

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml cw cre mr", () => {
    //                           mt  ah   mb   ml  cw   cre  mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [120] 10 / 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const creSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(creSpan?.value).toBe(10);
    expect(creSpan?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml cw crw mr", () => {
    //                           mt  ah   mb   ml  cw   crw  mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [120 / 10] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const crwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crwSpan?.value).toBe(10);
    expect(crwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml cle cw cre mr", () => {
    //                           mt  ah   mb   ml  cle cw   cre mr
    const formula = "200 × 200 = 30 [130] 40 × 30 / 5 [120] 5 / 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);

    const col1leSpan = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(col1leSpan?.value).toBe(5);

    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(120);
    expect(col1wSpan?.type).toBe("text");

    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);

    // should NOT have column left/right width spans
    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan).toBeUndefined();
    const col1rwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(col1rwSpan).toBeUndefined();
  });

  it("should parse ml cle cw crw mr", () => {
    //                           mt  ah   mb   ml  cle cw   crw mr
    const formula = "200 × 200 = 30 [130] 40 × 30 / 5 [120 / 5] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const cleSpan = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cleSpan?.value).toBe(5);
    expect(cleSpan?.type).toBeUndefined();

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const crwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crwSpan?.value).toBe(5);
    expect(crwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml clw cw cre mr", () => {
    //                           mt  ah   mb   ml  clw cw   cre mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [5 / 120] 5 / 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const clwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clwSpan?.value).toBe(5);
    expect(clwSpan?.type).toBe("text");

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const creSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(creSpan?.value).toBe(5);
    expect(creSpan?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse ml clw cw crw mr", () => {
    //                           mt  ah   mb   ml  clw cw   crw mr
    const formula = "200 × 200 = 30 [130] 40 × 30 [5 / 120 / 5] 40";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(200);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(30);
    expect(mlSpan?.type).toBeUndefined();

    const clwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clwSpan?.value).toBe(5);
    expect(clwSpan?.type).toBe("text");

    const cwSpan = hSpans.find((s) => s.label === "col-1-width");
    expect(cwSpan?.value).toBe(120);
    expect(cwSpan?.type).toBe("text");

    const crwSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crwSpan?.value).toBe(5);
    expect(crwSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(40);
    expect(mrSpan?.type).toBeUndefined();
  });

  // Two-column width variations
  it("should parse cw1 cg cw2", () => {
    //                           mt  ah   mb   ml  cw  cg  cw  mr
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse clw1 cw1 cg cw2", () => {
    //                           mt  ah   mb   ml  clw cw  cg  cw  mr
    const formula = "200 × 160 = 30 [130] 40 × 15 [5 / 55 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const clw1Span = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clw1Span?.value).toBe(5);
    expect(clw1Span?.type).toBe("text");

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(55);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cle1 cw1 cg cw2", () => {
    //                           mt  ah   mb   ml  cle cw gap  cw  mr
    const formula = "200 × 160 = 30 [130] 40 × 15 / 5 [55 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(55);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 crw1 cg cw2", () => {
    //                           mt  ah   mb   ml  cw  crw cg  cw  mr
    const formula = "200 × 160 = 30 [130] 40 × 15 [55 / 5 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(55);
    expect(cw1Span?.type).toBe("text");

    const crw1Span = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crw1Span?.value).toBe(5);
    expect(crw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cre1 cg cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [55 / 5* (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(55);
    expect(cw1Span?.type).toBe("text");

    const cre1Span = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(cre1Span?.value).toBe(5);
    expect(cre1Span?.type).toBeUndefined();

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse clw1 cw1 crw1 cg cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const clw1Span = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clw1Span?.value).toBe(5);
    expect(clw1Span?.type).toBe("text");

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(50);
    expect(cw1Span?.type).toBe("text");

    const crw1Span = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crw1Span?.value).toBe(5);
    expect(crw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse clw1 cw1 cre1 cg cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [5 / 50 / 5* (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const clw1Span = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(clw1Span?.value).toBe(5);
    expect(clw1Span?.type).toBe("text");

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(50);
    expect(cw1Span?.type).toBe("text");

    const cre1Span = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(cre1Span?.value).toBe(5);
    expect(cre1Span?.type).toBeUndefined();

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cle1 cw1 crw1 cg cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 / 5 [50 / 5 (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(50);
    expect(cw1Span?.type).toBe("text");

    const crw1Span = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(crw1Span?.value).toBe(5);
    expect(crw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cle1 cw1 cre1 cg cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 / 5 [50 / 5* (10) 60] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cle1Span = hSpans.find((s) => s.label?.includes("col-1-left-e"));
    expect(cle1Span?.value).toBe(5);
    expect(cle1Span?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(50);
    expect(cw1Span?.type).toBe("text");

    const cre1Span = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(cre1Span?.value).toBe(5);
    expect(cre1Span?.type).toBeUndefined();

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(60);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  // Second column variations
  it("should parse cw1 cg clw2 cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 55] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const clw2Span = hSpans.find((s) => s.label?.includes("col-2-left-w"));
    expect(clw2Span?.value).toBe(5);
    expect(clw2Span?.type).toBe("text");

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(55);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg cle2 cw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 55] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cle2Span = hSpans.find((s) => s.label?.includes("col-2-left-e"));
    expect(cle2Span?.value).toBe(5);
    expect(cle2Span?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(55);
    expect(cw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg cw2 crw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 55 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(55);
    expect(cw2Span?.type).toBe("text");

    const crw2Span = hSpans.find((s) => s.label?.includes("col-2-right-w"));
    expect(crw2Span?.value).toBe(5);
    expect(crw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg cw2 cre2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 55] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(55);
    expect(cw2Span?.type).toBe("text");

    const cre2Span = hSpans.find((s) => s.label?.includes("col-2-right-e"));
    expect(cre2Span?.value).toBe(5);
    expect(cre2Span?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg clw2 cw2 crw2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const clw2Span = hSpans.find((s) => s.label?.includes("col-2-left-w"));
    expect(clw2Span?.value).toBe(5);
    expect(clw2Span?.type).toBe("text");

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(50);
    expect(cw2Span?.type).toBe("text");

    const crw2Span = hSpans.find((s) => s.label?.includes("col-2-right-w"));
    expect(crw2Span?.value).toBe(5);
    expect(crw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg clw2 cw2 cre2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5 / 50] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const clw2Span = hSpans.find((s) => s.label?.includes("col-2-left-w"));
    expect(clw2Span?.value).toBe(5);
    expect(clw2Span?.type).toBe("text");

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(50);
    expect(cw2Span?.type).toBe("text");

    const cre2Span = hSpans.find((s) => s.label?.includes("col-2-right-e"));
    expect(cre2Span?.value).toBe(5);
    expect(cre2Span?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg cle2 cw2 crw2", () => {
    //                           mt ah    mb   ml  1111111111   222222  mr
    //                                             cw gap cle   cw  crw
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 50 / 5] 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cle2Span = hSpans.find((s) => s.label?.includes("col-2-left-e"));
    expect(cle2Span?.value).toBe(5);
    expect(cle2Span?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(50);
    expect(cw2Span?.type).toBe("text");

    const crw2Span = hSpans.find((s) => s.label?.includes("col-2-right-w"));
    expect(crw2Span?.value).toBe(5);
    expect(crw2Span?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse cw1 cg cle2 cw2 cre2", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 5* / 50] 5 / 15";
    const result = service.parseFormula(formula);

    expect(result).toBeTruthy();
    expect(result!.width.value).toBe(160);
    expect(result!.height.value).toBe(200);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);

    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(130);
    expect(ahSpan?.type).toBe("text");

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    const cw1Span = hSpans.find((s) => s.label === "col-1-width");
    expect(cw1Span?.value).toBe(60);
    expect(cw1Span?.type).toBe("text");

    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(10);
    expect(gapSpan?.type).toBeUndefined();

    const cle2Span = hSpans.find((s) => s.label?.includes("col-2-left-e"));
    expect(cle2Span?.value).toBe(5);
    expect(cle2Span?.type).toBeUndefined();

    const cw2Span = hSpans.find((s) => s.label === "col-2-width");
    expect(cw2Span?.value).toBe(50);
    expect(cw2Span?.type).toBe("text");

    const cre2Span = hSpans.find((s) => s.label?.includes("col-2-right-e"));
    expect(cre2Span?.value).toBe(5);
    expect(cre2Span?.type).toBeUndefined();

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
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
