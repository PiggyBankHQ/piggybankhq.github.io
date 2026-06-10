// Ring Rave Arcade - Interaction Scripts & Dynamic Geometric Shapes Engine
document.addEventListener('DOMContentLoaded', () => {
  console.log('Ring Rave production engine initialized successfully.');
  
  // Initialize the random geometric shape rings layout
  initGeometricRings();
});

function initGeometricRings() {
  const container = document.getElementById('dynamic-ring-system');
  if (!container) return;

  // The 4 requested shapes
  const shapes = ['circle', 'square', 'hexagon', 'octagon'];
  const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
  console.log(`[Ring Rave Engine] Theme Shape Selected: ${selectedShape.toUpperCase()}`);

  // Color configurations matching the original theme colors and filter glows
  const ringConfigs = [
    { radiusPct: 25, color: '#c77dff', glow: 'rgba(199, 125, 255, 0.4)', dash: false, layerClass: 'ring-layer1', strokeW: 6 },
    { radiusPct: 35, color: '#00f5d4', glow: 'rgba(0, 245, 212, 0.4)', dash: false, layerClass: 'ring-layer2', strokeW: 6 },
    { radiusPct: 44, color: '#f9c74f', glow: 'rgba(249, 199, 79, 0.3)', dash: false, layerClass: 'ring-layer3', strokeW: 6 },
    { radiusPct: 52, color: 'rgba(255, 255, 255, 0.15)', glow: 'transparent', dash: true, layerClass: 'ring-layer4', strokeW: 3 }
  ];

  // Helper to calculate polygon vertices for SVGs
  function getPolygonPoints(cx, cy, r, sides, startAngleRad = -Math.PI / 2) {
    let points = [];
    for (let i = 0; i < sides; i++) {
      let angle = startAngleRad + (i * 2 * Math.PI / sides);
      let x = cx + r * Math.cos(angle);
      let y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  }

  // Create SVGs for each ring layer to seamlessly integrate with custom glow effects and rotation layers
  ringConfigs.forEach((config) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("class", `dynamic-ring ${config.layerClass}`);

    // Create unique glow definitions for beautiful arcade presentation
    const defs = document.createElementNS(svgNS, "defs");
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", `glow-${config.layerClass}`);
    filter.innerHTML = `<feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>`;
    defs.appendChild(filter);
    svg.appendChild(defs);

    let shapeElement;
    const cx = 100, cy = 100;
    // convert percentage scale to radius inside 200x200 viewport coordinates
    const r = (config.radiusPct / 52) * 90; 

    if (selectedShape === 'circle') {
      shapeElement = document.createElementNS(svgNS, "circle");
      shapeElement.setAttribute("cx", cx);
      shapeElement.setAttribute("cy", cy);
      shapeElement.setAttribute("r", r);
    } else if (selectedShape === 'square') {
      shapeElement = document.createElementNS(svgNS, "rect");
      shapeElement.setAttribute("x", cx - r);
      shapeElement.setAttribute("y", cy - r);
      shapeElement.setAttribute("width", r * 2);
      shapeElement.setAttribute("height", r * 2);
    } else if (selectedShape === 'hexagon') {
      shapeElement = document.createElementNS(svgNS, "polygon");
      shapeElement.setAttribute("points", getPolygonPoints(cx, cy, r, 6, 0)); // Flat top looks great
    } else if (selectedShape === 'octagon') {
      shapeElement = document.createElementNS(svgNS, "polygon");
      shapeElement.setAttribute("points", getPolygonPoints(cx, cy, r, 8, Math.PI / 8)); // Aligned perfectly
    }

    // Apply neon visual styles to shapes
    shapeElement.setAttribute("fill", "none");
    shapeElement.setAttribute("stroke", config.color);
    shapeElement.setAttribute("stroke-width", config.strokeW);
    if (config.dash) {
      shapeElement.setAttribute("stroke-dasharray", "6,6");
    } else {
      shapeElement.setAttribute("filter", `url(#glow-${config.layerClass})`);
    }

    svg.appendChild(shapeElement);
    // Prepend layers before core center circle
    container.insertBefore(svg, container.firstChild);
  });
}
