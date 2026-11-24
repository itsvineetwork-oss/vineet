const NS = "http://www.w3.org/2000/svg";

/** A pencil cursor whose tip sits at the group origin. */
export class Pencil {
  readonly g: SVGGElement;
  private tilt: SVGGElement;
  constructor(svg: SVGSVGElement) {
    this.g = document.createElementNS(NS, "g");
    this.g.setAttribute("class", "pencil");
    this.g.style.opacity = "0";
    this.tilt = document.createElementNS(NS, "g");
    this.tilt.setAttribute("transform", "rotate(-38)");
    this.tilt.innerHTML = `
      <g transform="translate(0,-2)">
        <path d="M0,0 L9,-13 L14,-13 L14,-2 Z" fill="#e9d8b5" stroke="var(--ink)" stroke-width="1"/>
        <path d="M0,0 L4,-6 L8,-6 L8,-2 Z" fill="var(--ink)"/>
        <rect x="14" y="-14" width="86" height="13" rx="2" fill="#f1b92a" stroke="var(--ink)" stroke-width="1"/>
        <line x1="20" y1="-7.5" x2="96" y2="-7.5" stroke="#c98f12" stroke-width="1.2"/>
        <rect x="100" y="-14.5" width="8" height="14" fill="#b9b2a7" stroke="var(--ink)" stroke-width="1"/>
        <rect x="108" y="-14" width="10" height="13" rx="3" fill="#e58a8a" stroke="var(--ink)" stroke-width="1"/>
      </g>`;
    this.g.appendChild(this.tilt);
    svg.appendChild(this.g);
  }
  private pressure = 1;
  moveTo(x: number, y: number) {
    const wobble = this.pressure ? Math.sin(x * 0.11 + y * 0.07) * 2.2 : 0;
    this.g.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${wobble.toFixed(1)})`);
  }
  /** 1 = touching the paper, 0 = lifted. */
  press(p: number) { this.pressure = p; this.tilt.setAttribute("transform", `rotate(-38) translate(${(1 - p) * 7},${-(1 - p) * 12})`); }
  show(v: boolean) { this.g.style.opacity = v ? "1" : "0"; }
  raise() { this.g.parentNode?.appendChild(this.g); }
}
