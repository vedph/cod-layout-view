import { PopupService } from "./dist/index.js";

function getSnapshotFromNodes() {
  const nodes = [
    {
      "id": 1,
      "label": "A",
      "index": 0,
      "data": "A"
    },
    {
      "id": 2,
      "label": "R",
      "index": 1,
      "data": "R"
    },
    {
      "id": 3,
      "label": "Z",
      "index": 2,
      "data": "Z"
    },
    {
      "id": 4,
      "label": "D",
      "index": 3,
      "data": "D"
    },
    {
      "id": 5,
      "label": "C",
      "index": 4,
      "data": "C"
    },
    {
      "id": 6,
      "label": "V",
      "data": "V",
      "features": [
        {
          "name": "opid",
          "value": "66aed192fc"
        },
        {
          "name": "x",
          "value": "220"
        },
        {
          "name": "y",
          "value": "150"
        }
      ]
    },
    {
      "id": 7,
      "label": "B",
      "data": "B",
      "features": [
        {
          "name": "opid",
          "value": "e5610844bd"
        }
      ]
    },
    {
      "id": 8,
      "label": "P",
      "data": "P",
      "features": [
        {
          "name": "opid",
          "value": "503c1e3a94"
        }
      ]
    }
  ];

  const snapshot = {
    size: {
      width: 800,
      height: 600,
    },
    defs: '<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" /></marker></defs>',
    image: {
      url: "https://via.placeholder.com/800x600",
      opacity: 0.8,
    },
    text: nodes,
    textStyle: "font-size: 24px",
    textOptions: {
      offset: {
        x: 0,
        y: 8,
      },
      lineHeightOffset: 4,
      charSpacing: 0,
      spcWidthOffset: 0,
    },
    operations: [
      {
        id: "alpha",
        diplomatics: {
          g: '<g opacity="0.7"><circle cx="100" cy="15" r="15" fill="red"/><path d="M 100,100 A 50,50 0 0 1 50,100" stroke="green" stroke-width="2" marker-end="url(#arrowhead)"/></g>',
        },
        type: "delete",
        at: 9,
        run: 1,
      },
      {
        id: "beta",
        diplomatics: {
          g: '<g opacity="0.7"><line x1="128" y1="70" x2="148" y2="40" stroke="red" stroke-width="3"/></g>',
        },
        type: "delete",
        at: 32,
        run: 1,
      },
    ],
  };
  return snapshot;
}

function getSnapshot() {
  //            1234567890123456789 0123456789012345678
  const text = "This is a snapshot\nwith multiple lines";
  const nodes = text.split("").map((c, i) => {
    return {
      id: i + 1,
      label: c,
      index: i,
      data: c,
    };
  });
  for (let id = 6; id <= 7; id++) {
    nodes[id - 1].features = [
      {
        name: "style",
        value: "font-size:120%;transform:translate(0,-3px)",
      },
    ];
  }
  // style for "a"
  nodes[9 - 1].features = [
    {
      name: "style",
      value: "fill:red;font-weight:bold",
    },
  ];

  const snapshot = {
    size: {
      width: 800,
      height: 600,
    },
    defs: '<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" /></marker></defs>',
    image: {
      url: "https://via.placeholder.com/800x600",
      opacity: 0.8,
    },
    text: nodes,
    textStyle: "font-size: 24px",
    textOptions: {
      offset: {
        x: 0,
        y: 8,
      },
      lineHeightOffset: 4,
      charSpacing: 0,
      spcWidthOffset: 0,
    },
    operations: [
      {
        id: "alpha",
        diplomatics: {
          g: '<g opacity="0.7"><circle cx="100" cy="15" r="15" fill="red"/><path d="M 100,100 A 50,50 0 0 1 50,100" stroke="green" stroke-width="2" marker-end="url(#arrowhead)"/></g>',
        },
        type: "delete",
        at: 9,
        run: 1,
      },
      {
        id: "beta",
        diplomatics: {
          g: '<g opacity="0.7"><line id=\"ghost\" x1="128" y1="70" x2="148" y2="40" stroke="red" stroke-width="3"/></g>',
        },
        type: "delete",
        at: 32,
        run: 1,
      },
    ],
  };
  return snapshot;
}

window.onload = () => {
  const popupService = new PopupService();
  const snapshot = getSnapshotFromNodes();

  const textarea = document.getElementById("snapshot");
  textarea.value = JSON.stringify(snapshot, null, 2);

  let component = document.querySelector("gve-snapshot-view");
  if (!component) {
    console.error("Component not found");
  } else {
    component.addEventListener("snapshotRender", (event) => {
      console.log("Snapshot rendered:", event.detail);
      console.log("SVG", event.detail.svg.outerHTML);

      event.detail.renderer.playTimeline(
        {
          tag: "v2",
          tweens: [
            {
              label: "show line",
              type: 0,
              selector: "#ghost",
              vars: {
                opacity: 1,
                duration: 2,
              },
            },
          ],
        },
        undefined,
        component.shadowRoot
      );
    });
    component.addEventListener("visualEvent", (event) => {
      console.log("Visual event:", event.detail);
      if (event.detail.event.type === "click") {
        const visual = event.detail.source;
        const char = visual.data;
        const sb = [];
        sb.push(`${visual.id}: <strong>${char.data}</strong>`);
        if (char.features) {
          sb.push("<ul>");
          char.features.forEach((f) => {
            sb.push(`<li>${f.name}: <strong>${f.value}</strong></li>`);
          });
          sb.push("</ul>");
        }

        popupService.openPopup(
          sb.join(""),
          event.detail.event.x,
          event.detail.event.y,
          event.detail.event
        );
      }
    });

    component.data = {
      snapshot: snapshot,
      options: {
        showRulers: true,
        showGrid: true,
        debug: true,
        delayedRender: true,
        panZoom: true,
        transparentIds: ["ghost"],
      },
    };
  }
};
