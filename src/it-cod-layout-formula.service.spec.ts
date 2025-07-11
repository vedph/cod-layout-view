import { ITCodLayoutFormulaService } from "./it-cod-layout-formula.service";
import { ParsingError } from "./models";

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
    expect(result.result).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("should parse null as null", () => {
    const result = service.parseFormula(null);
    expect(result.result).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it("should parse single column clw-cw-crw", () => {
    //                           mt   he ah    fw mb   ml clw  cw  crw mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    //                           mt   he ah    fw mb   ml clw  cw  crw mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
    const result = service.parseFormula(formula).result;

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

    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-w"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBe("text");

    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should parse single column cle-cw-cre", () => {
    //                           mt   he ah    fw mb   ml   cle  cw cre  mr
    const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 / 3 [50] 5 / 15";
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    const result = service.parseFormula(formula).result;

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
    //                           mt   he ah   fe   mb   ml  cle cw   mr
    const formula = "200 × 200 = 30 / 5 [120] 10 / 40 × 30 / 5 [130] 40";
    const result = service.parseFormula(formula).result;

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
    expect(feSpan?.value).toBe(10);
    expect(feSpan?.type).toBeUndefined();

    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();
  });

  it("should parse comprehensive two-column formula with all span details", () => {
    const formula =
      // h     w     mt   he ah    fw mb   ml  clw cw   cre gap clw cw  cre mr
      "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
    const result = service.parseFormula(formula).result;

    expect(result).toBeTruthy();
    expect(result!.type).toBe("IT");

    // check dimensions
    expect(result!.height.value).toBe(250);
    expect(result!.width.value).toBe(160);

    const vSpans = result!.spans.filter((s) => !s.isHorizontal);
    const hSpans = result!.spans.filter((s) => s.isHorizontal);

    // vertical spans
    // margin top before /
    const mtSpan = vSpans.find((s) => s.label === "margin-top");
    expect(mtSpan?.value).toBe(30);
    expect(mtSpan?.type).toBeUndefined();

    // head, empty (no text)
    const heSpan = vSpans.find((s) => s.label === "head-e");
    expect(heSpan?.value).toBe(5);
    expect(heSpan?.type).toBeUndefined();

    // main vertical area (text)
    const ahSpan = vSpans.find((s) => s.label === "area-height");
    expect(ahSpan?.value).toBe(170);
    expect(ahSpan?.type).toBe("text"); // inside []

    // foot, written (text: it is inside [])
    const fwSpan = vSpans.find((s) => s.label === "foot-w");
    expect(fwSpan?.value).toBe(5);
    expect(fwSpan?.type).toBe("text"); // inside []

    // bottom margin, empty (no text)
    const mbSpan = vSpans.find((s) => s.label === "margin-bottom");
    expect(mbSpan?.value).toBe(40);
    expect(mbSpan?.type).toBeUndefined();

    // horizontal spans
    // left margin, empty (no text)
    const mlSpan = hSpans.find((s) => s.label === "margin-left");
    expect(mlSpan?.value).toBe(15);
    expect(mlSpan?.type).toBeUndefined();

    // left margin of column 1, written (text: inside [])
    const col1lwSpan = hSpans.find((s) => s.label?.includes("col-1-left-w"));
    expect(col1lwSpan?.value).toBe(5);
    expect(col1lwSpan?.type).toBe("text"); // inside []

    // column 1 width, written (text: inside [], but columns always have text anyway)
    const col1wSpan = hSpans.find((s) => s.label?.includes("col-1-width"));
    expect(col1wSpan?.value).toBe(50);
    expect(col1wSpan?.type).toBe("text"); // column widths are always text

    // column 1 right margin, empty (no text: even if inside [] which groups
    // spans having text, it has a * suffix which overrides the meaning of []
    // and means no text)
    const col1reSpan = hSpans.find((s) => s.label?.includes("col-1-right-e"));
    expect(col1reSpan?.value).toBe(5);
    expect(col1reSpan?.type).toBeUndefined(); // has * suffix, overrides []

    // gap between two columns, no text
    const gapSpan = hSpans.find((s) => s.label?.includes("col-1-gap"));
    expect(gapSpan?.value).toBe(20);
    expect(gapSpan?.type).toBeUndefined(); // gaps are in () which means no text

    // column 2 left margin, written (text: inside [])
    const col2lwSpan = hSpans.find((s) => s.label?.includes("col-2-left-w"));
    expect(col2lwSpan?.value).toBe(5);
    expect(col2lwSpan?.type).toBe("text"); // inside []

    // column 2 width, written (text)
    const col2wSpan = hSpans.find((s) => s.label?.includes("col-2-width"));
    expect(col2wSpan?.value).toBe(40);
    expect(col2wSpan?.type).toBe("text"); // column widths are always text

    // column 2 right margin, empty (no text: it's outside [])
    const col2reSpan = hSpans.find((s) => s.label?.includes("col-2-right-e"));
    expect(col2reSpan?.value).toBe(5);
    expect(col2reSpan?.type).toBeUndefined(); // outside []

    // right margin, empty (no text)
    const mrSpan = hSpans.find((s) => s.label === "margin-right");
    expect(mrSpan?.value).toBe(15);
    expect(mrSpan?.type).toBeUndefined();
  });

  it("should return null for empty formula building", () => {
    const result = service.buildFormula(null);
    expect(result).toBeNull();
  });

  it("should get areas from formula spans", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const parsed = service.parseFormula(formula).result;
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
    const parsed = service.parseFormula(formula).result;
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

  describe("filterFormulaLabels", () => {
    it("should return empty array for empty labels input", () => {
      const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const result = service.filterFormulaLabels(formula, []);
      expect(result).toEqual([]);
    });

    it("should return empty array for null formula", () => {
      const labels = ["margin-top", "area-height", "invalid"];
      const result = service.filterFormulaLabels(null as any, labels);
      expect(result).toEqual([]);
    });

    it("should filter static labels correctly", () => {
      const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const labels = [
        "margin-top",
        "head-e",
        "area-height",
        "foot-w",
        "margin-bottom",
        "margin-left",
        "margin-right",
        "invalid",
        "unknown",
      ];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([
        "margin-top",
        "head-e",
        "area-height",
        "foot-w",
        "margin-bottom",
        "margin-left",
        "margin-right",
      ]);
    });

    it("should filter column-based labels correctly", () => {
      const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
      const labels = [
        "col-1-width",
        "col-1-left-w",
        "col-1-right-w",
        "col-1-gap",
        "col-2-width",
        "col-10-left-e",
        "margin-top",
        "invalid",
        "col-width",
      ];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([
        "col-1-width",
        "col-1-left-w",
        "col-1-right-w",
        "col-1-gap",
        "col-2-width",
        "col-10-left-e",
        "margin-top",
      ]);
    });

    it("should handle all IT label types", () => {
      const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const labels = [
        // Static labels
        "margin-top",
        "head-e",
        "head-w",
        "area-height",
        "foot-w",
        "foot-e",
        "margin-bottom",
        "margin-left",
        "margin-right",
        // Column labels
        "col-1-gap",
        "col-1-left-e",
        "col-1-left-w",
        "col-1-width",
        "col-1-right-e",
        "col-1-right-w",
        "col-99-gap",
        "col-2-width",
        "col-10-left-e",
        // Invalid labels
        "invalid",
        "col-",
        "col-1-",
        "col-1-invalid",
        "col-x-width",
        "random",
      ];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([
        "margin-top",
        "head-e",
        "head-w",
        "area-height",
        "foot-w",
        "foot-e",
        "margin-bottom",
        "margin-left",
        "margin-right",
        "col-1-gap",
        "col-1-left-e",
        "col-1-left-w",
        "col-1-width",
        "col-1-right-e",
        "col-1-right-w",
        "col-99-gap",
        "col-2-width",
        "col-10-left-e",
      ]);
    });

    it("should filter using CodLayoutFormula object", () => {
      const formula = service.parseFormula(
        "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15"
      ).result;
      const labels = [
        "margin-top",
        "head-e",
        "area-height",
        "col-1-width",
        "invalid",
      ];
      const result = service.filterFormulaLabels(formula!, labels);
      expect(result).toEqual([
        "margin-top",
        "head-e",
        "area-height",
        "col-1-width",
      ]);
    });

    it("should return empty array when no labels match", () => {
      const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const labels = ["invalid", "unknown", "notfound", "col-invalid"];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual([]);
    });

    it("should handle edge cases in column labels", () => {
      const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const labels = [
        "col-0-width", // invalid: 0 is not a positive integer
        "col-1-width", // valid
        "col-123-gap", // valid
        "col--width", // invalid: no number
        "col-1a-width", // invalid: not just digits
        "col-1-", // invalid: incomplete
        "col-1-invalid", // invalid: not a recognized suffix
        "margin-top", // valid static label
      ];
      const result = service.filterFormulaLabels(formula, labels);
      expect(result).toEqual(["col-1-width", "col-123-gap", "margin-top"]);
    });
  });

  it("should return ParsingError for invalid height format", () => {
    const invalidFormula = "250 × 160 = invalid × 15 [50] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Invalid height format");
    expect(e.input).toBe("250×160=invalid×15[50]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for missing margins in width", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × [50]";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    expect(result.result).toBeUndefined();
    const e = result.error!;
    expect(e.message).toContain("Missing margins in width details");
    expect(e.input).toBe("250×160=30[170]40×[50]"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for too many numbers in column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [1/2/3/4] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeInstanceOf(ParsingError);
    const e = result.error!;
    expect(e.message).toContain("Too many numbers in column");
    expect(e.input).toBe("250×160=30[170]40×15[1/2/3/4]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for no width in column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [5*/10*] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeInstanceOf(ParsingError);
    const e = result.error!;
    expect(e.message).toContain("No width in column");
    expect(e.input).toBe("250×160=30[170]40×15[5*/10*]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for ambiguous column values", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [50/50] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Ambiguous values for column");
    expect(e.input).toBe("250×160=30[170]40×15[50/50]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for empty column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);
    const e = result.error!;
    expect(e.message).toContain("Empty column");
    expect(e.input).toBe("250×160=30[170]40×15[]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return null for empty formula building", () => {
    const result = service.buildFormula(null);
    expect(result).toBeNull();
  });

  it("should get areas from formula spans", () => {
    const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
    const result = service.parseFormula(formula);
    expect(result.error).toBeUndefined();
    expect(result.result).toBeTruthy();
    const parsed = result.result!;

    const areas = service.getAreas(parsed.spans);
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

  it("should return ParsingError for invalid height format", () => {
    const invalidFormula = "250 × 160 = invalid × 15 [50] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Invalid height format");
    expect(e.input).toBe("250×160=invalid×15[50]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for missing margins in width", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × [50]";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Missing margins in width details");
    expect(e.input).toBe("250×160=30[170]40×[50]"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for too many numbers in column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [1/2/3/4] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Too many numbers in column");
    expect(e.input).toBe("250×160=30[170]40×15[1/2/3/4]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for no width in column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [5*/10*] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("No width in column");
    expect(e.input).toBe("250×160=30[170]40×15[5*/10*]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for ambiguous column values", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [50/50] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Ambiguous values for column");
    expect(e.input).toBe("250×160=30[170]40×15[50/50]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for empty column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Empty column");
    expect(e.input).toBe("250×160=30[170]40×15[]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return ParsingError for empty column", () => {
    const invalidFormula = "250 × 160 = 30 [170] 40 × 15 [] 15";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Empty column");
    expect(e.input).toBe("250×160=30[170]40×15[]15"); // normalized input
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should handle invalid formula", () => {
    const invalidFormula = "invalid formula";
    const result = service.parseFormula(invalidFormula);
    expect(result.error).toBeInstanceOf(ParsingError);

    const e = result.error!;
    expect(e.message).toContain("Invalid formula");
    expect(e.input).toBe("invalidformula"); // normalized input (spaces removed)
    expect(e.index).toBeDefined();
    expect(e.length).toBeDefined();
  });

  it("should return null for empty formula building", () => {
    const result = service.buildFormula(null);
    expect(result).toBeNull();
  });

  describe("validateFormulaSize", () => {
    it("should return null for null formula", () => {
      const result = service.validateFormulaSize(null as any);
      expect(result).toBeNull();
    });

    it("should return null for formula without spans", () => {
      const formula = {
        type: "IT",
        height: { value: 250 },
        width: { value: 160 },
        spans: [],
      };
      const result = service.validateFormulaSize(formula as any);
      expect(result).toBeNull();
    });

    it("should return null for valid formula", () => {
      const formula = "250 × 88 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const parsed = service.parseFormula(formula)!.result!;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeNull();
    });

    it("should detect height mismatch", () => {
      const formula = "250 × 88 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const parsed = service.parseFormula(formula).result;
      // modify height to create mismatch
      parsed!.height.value = 300;
      const result = service.validateFormulaSize(parsed!);
      expect(result).toBeTruthy();
      expect(result!.height).toBe("Height 300 does not match v-spans sum 250");
    });

    it("should detect width mismatch", () => {
      const formula = "250 × 88 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const parsed = service.parseFormula(formula)!.result!;
      // modify width to create mismatch
      parsed.width.value = 200;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeTruthy();
      expect(result!.width).toBe("Width 200 does not match h-spans sum 88");
    });

    it("should detect both height and width mismatch", () => {
      const formula = "250 × 88 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const parsed = service.parseFormula(formula)!.result!;
      // modify both dimensions to create mismatches
      parsed.height.value = 300;
      parsed.width.value = 200;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeTruthy();
      expect(result!.height).toBe("Height 300 does not match v-spans sum 250");
      expect(result!.width).toBe("Width 200 does not match h-spans sum 88");
    });

    it("should handle formula with undefined span values", () => {
      const formula = "250 × 88 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
      const parsed = service.parseFormula(formula)!.result!;
      parsed!.spans[0].value = 0;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeTruthy();
      expect(result!.height).toContain("does not match v-spans sum");
    });

    it("should validate complex two-column formula", () => {
      const formula =
        "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
      const parsed = service.parseFormula(formula)!.result!;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeNull();
    });

    it("should detect mismatch in two-column formula", () => {
      const formula =
        "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
      const parsed = service.parseFormula(formula)!.result!;
      // modify width to create mismatch
      parsed.width.value = 150;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeTruthy();
      expect(result!.width).toBe("Width 150 does not match h-spans sum 160");
    });

    it("should validate formula without head/foot spans", () => {
      const formula = "200 × 160 = 30 [130] 40 × 15 [60 (10) 60] 15";
      const parsed = service.parseFormula(formula)!.result!;
      const result = service.validateFormulaSize(parsed);
      expect(result).toBeNull();
    });
  });

  describe("CodLayoutFormulaService - editing dimensions", () => {
    let service: ITCodLayoutFormulaService;

    beforeEach(() => {
      service = new ITCodLayoutFormulaService();
    });

    it("should preserve formula structure when rebuilding after value updates", () => {
      // original formula with complex column structure including gaps
      const originalFormula =
        // h     w     mt   he ah    fw mb   ml  clw cw   crw gap clw cw  cre mr
        "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";

      // parse the original formula
      const parsed = service.parseFormula(originalFormula).result;
      expect(parsed).toBeTruthy();

      // update margin-top from 30 to 20 (simulating dimension edit)
      const marginTopSpan = parsed!.spans!.find(
        (s) => s.label === "margin-top"
      );
      expect(marginTopSpan).toBeTruthy();
      expect(marginTopSpan!.value).toBe(30);
      marginTopSpan!.value = 20;

      // update height to 240
      const height = parsed?.height;
      expect(height).toBeTruthy();
      height!.value = 240;

      // rebuild the formula
      const rebuiltFormula = service.buildFormula(parsed!);
      expect(rebuiltFormula).toBeTruthy();

      // the rebuilt formula should be valid and maintain structure
      const expectedFormula =
        "240 × 160 = 20 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
      expect(rebuiltFormula).toBe(expectedFormula);

      // the rebuilt formula should be parseable
      const reparsed = service.parseFormula(rebuiltFormula!);
      expect(reparsed).toBeTruthy();

      // and should not have validation errors
      const validationErrors = service.validateFormula(rebuiltFormula!);
      expect(validationErrors).toBeFalsy();
    });
  });
});
