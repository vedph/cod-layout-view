import { BOCodLayoutFormulaService } from "./bo-cod-layout-formula.service";

export class CodLayoutViewComponent extends HTMLElement {
  private svg: string = "";
  private zoom: number = 1;
  private isDragging: boolean = false;
  private dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private viewPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["formula"];
  }

  connectedCallback() {
    this.render();
    this.setupInteractions();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "formula" && oldValue !== newValue) {
      this.updateFormula(newValue);
    }
  }

  private updateFormula(formulaText: string) {
    const service = new BOCodLayoutFormulaService();
    const formula = service.parseFormula(formulaText);
    if (formula) {
      this.svg = service.generateSvg(formula);
      this.render();
    }
  }

  private setupInteractions() {
    const container = this.shadowRoot!.querySelector(
      ".viewer-container"
    ) as HTMLElement;
    if (!container) return;

    // Zoom with mouse wheel
    container.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.min(Math.max(0.1, this.zoom * delta), 5);
        this.updateTransform();
      },
      { passive: false }
    );

    // pan with mouse drag
    container.addEventListener("mousedown", (e: MouseEvent) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
    });

    // use proper types for event listeners
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      this.viewPosition.x += dx;
      this.viewPosition.y += dy;

      this.dragStart = { x: e.clientX, y: e.clientY };
      this.updateTransform();
    };

    const mouseUpHandler = () => {
      this.isDragging = false;
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

    svg.style.transform =
      `translate(${this.viewPosition.x}px, ${this.viewPosition.y}px) ` +
      `scale(${this.zoom})`;
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
          height: 100%;
          overflow: hidden;
          position: relative;
          background: #f5f5f5;
        }
        svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          transition: transform 0.1s ease-out;
        }
      </style>
      <div class="viewer-container">
        ${this.svg}
      </div>
    `;
  }
}

// register the web component
customElements.define("cod-layout-view", CodLayoutViewComponent);
