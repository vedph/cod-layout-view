import {
  BOCodLayoutFormulaService,
  DEFAULT_BO_SVG_OPTIONS,
} from "./bo-cod-layout-formula.service";
import { CodLayoutSvgOptions } from "./models";

/**
 * A web component to visualize codicological layout formulas.
 * Usage: `<cod-layout-view formula="..." options="..."></cod-layout-view>`.
 */
export class CodLayoutViewComponent extends HTMLElement {
  private _svg: string = "";
  private _zoom: number = 1;
  private _isDragging: boolean = false;
  private _dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private _viewPosition: { x: number; y: number } = { x: 0, y: 0 };
  private _options: CodLayoutSvgOptions;
  private _isTransformUpdateScheduled: boolean = false;

  constructor() {
    super();
    this._options = DEFAULT_BO_SVG_OPTIONS;
    this.attachShadow({ mode: "open" });
  }

  public static get observedAttributes() {
    return ["formula", "options"];
  }

  public connectedCallback() {
    this.render();
    this.setupInteractions();
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (name === "formula" && oldValue !== newValue) {
      this.updateFormula(newValue);
    } else if (name === "options" && oldValue !== newValue) {
      this.updateOptions(newValue);
    }
  }

  private updateFormula(formulaText: string) {
    const service = new BOCodLayoutFormulaService();
    const formula = service.parseFormula(formulaText);
    if (formula) {
      this._svg = service.buildSvg(formula);
      this.updateVisualization();
    }
  }

  private updateOptions(optionsText: string) {
    try {
      this._options = JSON.parse(optionsText);
      this.updateVisualization();
    } catch (e) {
      console.error("Invalid options JSON", e);
    }
  }

  private setupInteractions() {
    const container = this.shadowRoot!.querySelector(
      ".viewer-container"
    ) as HTMLElement;
    if (!container) return;

    // zoom with mouse wheel
    container.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoom = Math.min(Math.max(0.1, this._zoom * delta), 5);
        this.updateTransform();
      },
      { passive: false }
    );

    // pan with mouse drag
    container.addEventListener("mousedown", (e: MouseEvent) => {
      this._isDragging = true;
      this._dragStart = { x: e.clientX, y: e.clientY };
    });

    // use proper types for event listeners
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!this._isDragging) return;

      const dx = e.clientX - this._dragStart.x;
      const dy = e.clientY - this._dragStart.y;

      this._viewPosition.x += dx;
      this._viewPosition.y += dy;

      this._dragStart = { x: e.clientX, y: e.clientY };

      if (!this._isTransformUpdateScheduled) {
        this._isTransformUpdateScheduled = true;
        requestAnimationFrame(this.updateTransform.bind(this));
      }
    };

    const mouseUpHandler = () => {
      this._isDragging = false;
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    // cleanup listeners when element is removed
    this.addEventListener("disconnectedCallback", () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
    });
  }

  private updateTransform() {
    const svg = this.shadowRoot!.querySelector("svg");
    if (!svg) return;

    svg.style.transform = `translate(${this._viewPosition.x}px, ${this._viewPosition.y}px) scale(${this._zoom})`;
    // allow the next animation frame to schedule an update
    this._isTransformUpdateScheduled = false;
  }

  private createToggleButton(
    label: string,
    initialState: boolean,
    onChange: (state: boolean) => void
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "toggle-button";
    button.setAttribute("aria-pressed", initialState.toString());

    button.addEventListener("click", () => {
      const newState = !button
        .getAttribute("aria-pressed")
        ?.toLowerCase()
        .includes("true");
      button.setAttribute("aria-pressed", newState.toString());
      onChange(newState);
    });

    return button;
  }

  private updateVisualization() {
    const formula = this.getAttribute("formula");
    if (formula) {
      const service = new BOCodLayoutFormulaService();
      const parsedFormula = service.parseFormula(formula);
      if (parsedFormula) {
        this._svg = service.buildSvg(parsedFormula, this._options);
        this.render();
      }
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        .viewer-container {
          width: 100%;
          height: calc(100% - 40px);
          overflow: hidden;
          position: relative;
          background: #f5f5f5;
        }
        .controls {
          height: 40px;
          padding: 5px;
          display: flex;
          gap: 10px;
          align-items: center;
          background: #fff;
          border-bottom: 1px solid #ddd;
        }
        .toggle-button {
          padding: 5px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        .toggle-button[aria-pressed="true"] {
          background: #007bff;
          color: white;
        }
        svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          transition: transform 0.1s ease-out;
        }
      </style>
      <div class="controls"></div>
      <div class="viewer-container">
        ${this._svg}
      </div>
    `;

    const controls = this.shadowRoot.querySelector(".controls");
    if (controls) {
      // vertical lines toggle
      controls.appendChild(
        this.createToggleButton(
          "V",
          this._options.showVertical ? true : false,
          (state) => {
            this._options.showVertical = state;
            this.updateVisualization();
          }
        )
      );

      // horizontal lines toggle
      controls.appendChild(
        this.createToggleButton(
          "H",
          this._options.showHorizontal ? true : false,
          (state) => {
            this._options.showHorizontal = state;
            this.updateVisualization();
          }
        )
      );

      // areas toggle
      controls.appendChild(
        this.createToggleButton(
          "A",
          this._options.showAreas ? true : false,
          (state) => {
            this._options.showAreas = state;
            this.updateVisualization();
          }
        )
      );

      // original sizes toggle
      controls.appendChild(
        this.createToggleButton(
          "O",
          this._options.useOriginal ? true : false,
          (state) => {
            this._options.useOriginal = state;
            this.updateVisualization();
          }
        )
      );
    }

    this.setupInteractions();
  }
}

// register the web component
customElements.define("cod-layout-view", CodLayoutViewComponent);
