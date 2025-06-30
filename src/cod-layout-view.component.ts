import {
  BOCodLayoutFormulaService,
  DEFAULT_BO_SVG_OPTIONS,
} from "./bo-cod-layout-formula.service";
import {
  ITCodLayoutFormulaService,
  DEFAULT_IT_SVG_OPTIONS,
} from "./it-cod-layout-formula.service";
import {
  CodLayoutFormulaService,
  CodLayoutSvgOptions,
  CodLayoutFormulaRenderer,
} from "./models";

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
  private _controls: HTMLElement | null = null;
  private _service?: CodLayoutFormulaService;

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
      this.updateToggleButtons();
    }
  }

  private ensureService(type?: string): void {
    if (!this._service || (type && this._service.type !== type)) {
      switch (type) {
        case "BO":
          console.log("Using BO formula service");
          this._service = new BOCodLayoutFormulaService();
          this._options = { ...DEFAULT_BO_SVG_OPTIONS, ...this._options };
          break;
        case "IT":
          console.log("Using IT formula service");
          this._service = new ITCodLayoutFormulaService();
          this._options = { ...DEFAULT_IT_SVG_OPTIONS, ...this._options };
          break;
        default:
          console.log("Unknown formula type, using BO as default");
          this._service = new BOCodLayoutFormulaService();
          this._options = { ...DEFAULT_BO_SVG_OPTIONS, ...this._options };
          break;
      }
    }
  }

  private evalFormulaType(formulaText: string): string {
    // extract formula type from the first token when formula starts with $
    // else assume BO as default
    const typeMatch = formulaText.match(/^\$([^\s]+)\s+/);
    const type = typeMatch ? typeMatch[1] : "BO";
    this.ensureService(type);
    if (typeMatch) {
      formulaText = formulaText.substring(typeMatch[0].length);
    }
    return formulaText;
  }

  private updateFormula(formulaText: string) {
    formulaText = this.evalFormulaType(formulaText);

    const formula = this._service!.parseFormula(formulaText);
    if (formula) {
      if ((this._service as unknown as CodLayoutFormulaRenderer).buildSvg) {
        this._svg = (
          this._service! as unknown as CodLayoutFormulaRenderer
        ).buildSvg(formula, this._options);
      }
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

  private updateToggleButtons() {
    if (this._controls && this._options.showToolbar) {
      // update vertical lines toggle
      this.updateToggleButtonState(
        "V",
        this._options.showVertical ? true : false
      );

      // update horizontal lines toggle
      this.updateToggleButtonState(
        "H",
        this._options.showHorizontal ? true : false
      );

      // update areas toggle
      this.updateToggleButtonState("A", this._options.showAreas ? true : false);

      // update original sizes toggle
      this.updateToggleButtonState(
        "O",
        this._options.useOriginal ? true : false
      );
    }
  }

  private updateToggleButtonState(buttonId: string, state: boolean) {
    const button = this._controls!.querySelector(
      `#${buttonId}`
    ) as HTMLInputElement;
    if (button) {
      button.checked = state;
    }
  }

  private emitOptionsChange() {
    this.dispatchEvent(
      new CustomEvent("optionsChange", {
        detail: this._options,
        bubbles: true,
        composed: true,
      })
    );
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
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoom = Math.min(Math.max(0.1, this._zoom * delta), 5);
        this.updateTransform(offsetX, offsetY);
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

  private fitToContainer() {
    const svg = this.shadowRoot!.querySelector("svg");
    const container = this.shadowRoot!.querySelector(".viewer-container");

    if (!svg || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const svgWidth = svg.clientWidth; // Use clientWidth for rendered width
    const svgHeight = svg.clientHeight; // Use clientHeight for rendered height

    const scale = Math.min(
      containerWidth / svgWidth,
      containerHeight / svgHeight
    );

    this._zoom = scale;
    this._viewPosition = { x: 0, y: 0 }; // Reset position
    this.updateTransform();
  }

  private updateTransform(offsetX?: number, offsetY?: number) {
    const svg = this.shadowRoot!.querySelector("svg");
    if (!svg) return;

    if (offsetX !== undefined && offsetY !== undefined) {
      const rect = svg.getBoundingClientRect();
      const svgX = offsetX - rect.left;
      const svgY = offsetY - rect.top;
      const prevZoom = this._zoom;
      this._zoom = Math.min(Math.max(0.1, this._zoom), 5);
      const zoomFactor = this._zoom / prevZoom;

      this._viewPosition.x = (this._viewPosition.x - svgX) * zoomFactor + svgX;
      this._viewPosition.y = (this._viewPosition.y - svgY) * zoomFactor + svgY;
    }

    svg.style.transition = "transform 0.1s ease-out";
    svg.style.transformOrigin = "0 0";
    svg.style.transform = `translate(${this._viewPosition.x}px, ${this._viewPosition.y}px) scale(${this._zoom})`;

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
    let formula = this.getAttribute("formula");
    if (formula) {
      formula = this.evalFormulaType(formula);
      const parsedFormula = this._service!.parseFormula(formula);
      if (parsedFormula) {
        if ((this._service as unknown as CodLayoutFormulaRenderer).buildSvg) {
          this._svg = (
            this._service as unknown as CodLayoutFormulaRenderer
          ).buildSvg(parsedFormula, this._options);
          this.render();
        }
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
          width: 100%;
          height: 100%;
          display: block;
          transition: transform 0.1s ease-out;
        }
      </style>
      <div class="controls"></div>
      <div class="viewer-container">
        ${this._svg}
      </div>
    `;

    if (this._options.showToolbar) {
      this._controls = this.shadowRoot.querySelector(".controls");
      if (this._controls) {
        // vertical lines toggle
        this._controls.appendChild(
          this.createToggleButton(
            "V",
            this._options.showVertical ? true : false,
            (state) => {
              this._options.showVertical = state;
              this.updateVisualization();
              this.emitOptionsChange();
            }
          )
        );

        // horizontal lines toggle
        this._controls.appendChild(
          this.createToggleButton(
            "H",
            this._options.showHorizontal ? true : false,
            (state) => {
              this._options.showHorizontal = state;
              this.updateVisualization();
              this.emitOptionsChange();
            }
          )
        );

        // areas toggle
        this._controls.appendChild(
          this.createToggleButton(
            "A",
            this._options.showAreas ? true : false,
            (state) => {
              this._options.showAreas = state;
              this.updateVisualization();
              this.emitOptionsChange();
            }
          )
        );

        // original sizes toggle
        this._controls.appendChild(
          this.createToggleButton(
            "O",
            this._options.useOriginal ? true : false,
            (state) => {
              this._options.useOriginal = state;
              this.updateVisualization();
              this.emitOptionsChange();
            }
          )
        );

        // fit to container button
        const fitButton = document.createElement("button");
        fitButton.textContent = "\u26cb";
        fitButton.className = "toggle-button";
        fitButton.addEventListener("click", () => {
          this.fitToContainer();
        });
        this._controls.appendChild(fitButton);
      }
    }

    this.setupInteractions();
    this.fitToContainer();
  }
}

// register the web component
customElements.define("cod-layout-view", CodLayoutViewComponent);
