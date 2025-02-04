# CodLayoutView

- building: `npm run build`.
- running: `npm run start`.
- testing: use VSCode extensions or just `npm run test`.

## Model

Codicological layout formulas services and view web component in a framework-independent Typescript library. This library contains services and models representing manuscript layout formulas.

Such formulas are text strings which represent in a compact way the size and gridlines of a manuscript page. We give a list of vertical gridlines, with the span between each of them, from top to bottom; and a list of horizontal gridlines, with the span between each of them, from left to right. Once we virtually draw these lines, we get a grid which defines the various layout areas. A specific label tags those areas designed to contain text. Other areas are used for empty areas like margins, or for areas designed for special purposes, like holding initials.

Some generic models are used whatever the formula:

- **dimension**: a single numeric value (`CodLayoutValue`): this couples a value with an optional label, and a second optional value representing the original (reconstructed) value. Also, `isOriginal` tells whether the current value also is the original one (which most often is not the case). So, the dimension value can be represented by:
  - a current value equal to the original one (`isOriginal`=true).
  - a current value not equal to the original one, which can't be reconstructed (`isOriginal`=false).
  - a current value not equal to the original one, which can be reconstructed (`isOriginal`=false, `originalValue` specified).
- **size**: a pair of dimensions for the sheet's width and height.
- **span**: a dimension measured from the sheet's edge (top or left) along the horizontal or vertical axis. For instance, on the vertical axis you can get 3 spans: top margin (from sheet's top edge), text, bottom margin. Each is a dimension which gets measured from the previous span or from the sheet's edge. Dimensions along the vertical axis are visually represented by horizontal gridlines, and dimensions along the horizontal axis by vertical gridlines. Spans are dimensions having a direction (horizontal or vertical) and a type (in most cases undefined except when it is `text`, which defines an area designed to contain text).

Consider this mock example:

![layout example](sample.png)

Here we have:

- size: height=10, width=8.
- vertical spans: top margin (`mt`) = 1, text = 7, bottom margin (`mb`) = 2. The horizontal gridlines here are green.
- horizontal spans: left margin (`ml`) = 2, initials column (`i`) = 1, text = 3, right margin (`mr`) = 2.

These gridlines, as defined by spans (dimensions), form **areas** at their intersections. In the above diagram we conventionally number these areas with their Y and X values: so the top left area is 1,1; the area at its right is 1,2; the area below it is 2,1; etc.

As spans can be labelled, areas can get a more human-friendly designation by combining the label from the vertical gridline with the label from the horizontal gridline. For instance:

col 1     | col 2    | col 3        | col 4
----------|----------|--------------|----------
1,1=mt_ml | 1,2=mt_i | 1,3=mt_$text | 1,4=mt_mr

```mermaid
classDiagram

CodLayoutValue : +number value
CodLayoutValue : +boolean isOriginal
CodLayoutValue : +number originalValue
CodLayoutValue : +string label

CodLayoutValue <|-- CodLayoutSpan
CodLayoutSpan : +string type
CodLayoutSpan : +boolean isHorizontal

CodLayoutFormula : +string type
CodLayoutFormula : +CodLayoutUnit unit
CodLayoutFormula : +CodLayoutValue height
CodLayoutFormula : +CodLayoutValue width
CodLayoutFormula : +CodLayoutSpan[] spans

CodLayoutArea : +number y
CodLayoutArea : +number x
CodLayoutArea : +number colIndexes
CodLayoutArea : +number rowIndexes

CodLayoutSvgOptions : +boolean showVertical
CodLayoutSvgOptions : +boolean showHorizontal
CodLayoutSvgOptions : +boolean showAreas
CodLayoutSvgOptions : +boolean useOriginal
CodLayoutSvgOptions : +boolean showToolbar
CodLayoutSvgOptions : +number vLineWidth
CodLayoutSvgOptions : +number hLineWidth
CodLayoutSvgOptions : +number areaGap
CodLayoutSvgOptions : +string labelColor
CodLayoutSvgOptions : +number labelFontSize
CodLayoutSvgOptions : +string labelFontFamily
CodLayoutSvgOptions : +Map~string,string~ labelColors
CodLayoutSvgOptions : +boolean showValueLabels
CodLayoutSvgOptions : +string valueLabelColor
CodLayoutSvgOptions : +number padding
CodLayoutSvgOptions : +number scale
CodLayoutSvgOptions : +Map~string,string~ areaColors
CodLayoutSvgOptions : +number areaOpacity
CodLayoutSvgOptions : +string fallbackLineStyle

CodLayoutFormulaRenderer : +string buildSvg(formula, options)

CodLayoutFormulaService : +CodLayoutFormula parseFormula(text)
CodLayoutFormulaService : +string buildFormula(formula)

CodLayoutFormulaBase <|-- BOCodLayoutFormula
CodLayoutFormulaRenderer <|-- BOCodLayoutFormula
CodLayoutFormulaService <|-- BOCodLayoutFormula
```

## Quick Start

1. 📦 install package: `npm i @myrmidon/cod-layout-view`.
2. add the component in your HTML template like `<cod-layout-view formula="..." options="..."></cod-layout-view>`.

## Formulas

Codicological layout formulas essentially represent the layout scheme of a page with:

- the page size (height and width);
- a set of vertical measurements representing layout areas vertically stacked on the page from top to bottom. Each can be represented as a rectangle whose height is the measurement's value.
- a set of horizontal measurements representing layout areas horizontally stacked on the page from left to right. Each can be represented as a rectangle whose width is the measurement's value.
- usually, we distinguish between areas designed to contain text and areas for other content (or just for margins).
- also, often we add the possibility of representing the current dimension vs. its original value. In most cases pages were trimmed, so that the current dimensions are not equal to the original ones, which in many cases can be reconstructed. This implies that each measurement can have an associated reconstructed value.

The vertical measurements (defining horizontal grid lines from top to bottom) combined with the horizontal measurements (defining vertical grid lines from left to right) are combined to define rectangular areas, which represent the layout of a page.

### Bianconi-Orsini

This formula targets size and mirror and is derived from D. Bianconi, _I Codices Graeci Antiquiores tra scavo e biblioteca_, in _Greek Manuscript Cataloguing: Past, Present, and Future_, edited by P. Degni, P. Eleuteri, M. Maniaci, Turnhout, Brepols, 2018 (Bibliologia, 48), 99-135, especially 110-111.

The formula always targets a _recto_ page used as the sample. Its parts are:

1. size:
   2. unit, e.g. `mm`
   3. `H [H] x W [W]`, where `H` and/or `W` can be wrapped in `()` (current dimensions not corresponding to the original ones). Each can be followed by another dimension in `[]` which is the reconstructed dimension. If a dimension is missing, it is replaced by `-` (here we use a dash rather than an EM dash for better accessibility); from a practical point of view, this `-` is thus equal to `0`.
2. `=` followed by horizontal ruling spans. Each measurement number here can be wrapped in `()` and followed by another measurement in `[]` as above (1.2).
3. `x` (or `×` U+00D7) followed by vertical ruling spans, as above (2).

For 2-3 each measurement can be separated by:

- `/` for single ruled areas (=this marks the start of a new area);
- `//` for the writing mirror (=this occurs in pairs, delimiting the writing mirror).

>In addition, a short label (a string without spaces) can be added after each measurement prefixed by `:`. This addition is required by the generic layout formula model and allows to customize the interpretation of non basic areas (see example 2 below).

Examples (see pp.110-111):

(1) `mm (57) [175] x (145) [150] = (22) // (35) [115] // - x 10 // 115 // (20)`

- `mm`: unit
- `(57) [175]`: height
- `x (145) [150]`: width
- `= (22)`: top margin height
- `// 35 [115]`: writing mirror height
- `// -`: missing bottom margin
- `x 10`: internal margin width
- `// 115 //`: writing mirror width
- `20`: external margin width

(2) `mm 336 x 240 = 18 // 282 // 36 x 25 / 4 // 174 // 4 / 33`

- `mm`: unit
- `336`: height
- `x 240`: width
- `= 18`: top margin height
- `// 282 //`: writing mirror height
- `36`: bottom margin height
- `x 25`: internal margin width
- `4`: column for initials width
- `// 174 //`: writing mirror width
- `4`: column for initials width
- `/ 33`: external margin width

>Here we might use a label to tag the initials column area, e.g. `mm 336 x 240 = 18 // 282 // 36 x 25 / 4:initials // 174 // 4:initials / 33`.

(3) `mm (245) x (162) = (10) // 206 // (29) x (21) // 114 // (27)`

- `mm`: unit
- `245`: height
- `x 162`: width
- `= (10)`: top margin height
- `// 206 //`: writing mirror height
- `(29)`: bottom margin height
- `x (21)`: internal margin width
- `// 114 //`: writing mirror width
- `(27)`: external margin width

>Note that the above examples were fixed as they seem to have typos in the original document (see nr.2 and 3).

## Workspace Setup

These steps were used to build this workspace for a pure Typescript library:

1. create a new folder.
2. enter it and run `npm init`.
3. install these packages:

    ```bash
    npm i typescript

    npm i --save-dev lite-server
    npm i --save-dev concurrently

    npm i --save-dev jest
    npm i --save-dev @types/jest
    npm i --save-dev ts-jest
    ```

4. create in `.vscode` [tasks.json](./.vscode/tasks.json) for building (ctrl+shift+B in VSCode) and [launch.json](./.vscode/launch.json) for debugging:

5. add main entrypoint, script commands and exports in [package.json](package.json).

6. add [index.html](index.html) to the root to host your controls for testing, e.g.:

    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Test Component</title>
        <script type="module" src="./dist/components/mock.component.js"></script>
        <script type="module" src="./dist/services/roman-number.js"></script>
      </head>
      <body>
        <h1>Library Development Shell</h1>
        <article>
          <h2>Mock component</h2>
          <div style="border: 1px solid silver">
            <mock-component></mock-component>
          </div>
        </article>
      </body>
    </html>
    ```

    >Optionally you can also add some JS client code by adding `index.js` and importing it into this page.

7. add your code (services and components) under `src`.
8. export all the required objects from the `src/index.ts` API entrypoint.

### Lite Server

The `lite-server` does not automatically rebuild your TypeScript files when they change. It only refreshes the browser when HTML or JavaScript files change.

To have your TypeScript files automatically recompile when you make changes, you can use `tsc --watch` command. This command starts the TypeScript compiler in watch mode; the compiler watches for file changes and recompiles when it sees them.

Then, you can run `npm run watch` in a separate terminal to start the TypeScript compiler in watch mode.

However, this will not refresh your browser when your TypeScript files are recompiled. To do this, you can use a tool like `concurrently` to run both `lite-server` and `tsc --watch` at the same time, and have `lite-server` refresh the browser whenever your compiled JavaScript files change.

Once installed this Update your start script to run both commands:

```json
"scripts": {
  "start": "concurrently \"tsc --watch\" \"lite-server\""
}
```

Now, when you run `npm start`, it will start both the TypeScript compiler in watch mode and lite-server. When you make changes to your TypeScript files, they will be automatically recompiled, and `lite-server` will refresh your browser.
