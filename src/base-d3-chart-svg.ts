import { select as d3Select } from 'd3-selection';

/**
 * Standard margins interface.
 */
export interface Margins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Base class for d3 svg charts.
 * Draw and manage a svg element with a chart zone inside.
 */
export class BaseD3ChartSVG {

  private lastPartD3Selector_: string;
  private d3Selector_: string;

  height: number;
  width: number;
  margins: Margins;
  svg: any;
  chart: any;

  constructor(d3Selector: string) {
    this.lastPartD3Selector_ = d3Selector;
    this.d3Selector_ = d3Selector;
    this.height = 250;
    this.width = 250;
    this.margins = { top: 60, right: 80, bottom: 60, left: 80 };
  }

  /**
   * Return the selector of the chart.
   */
  getD3Selector(): string {
    return this.d3Selector_;
  }

  /**
   * Specify a supplementary path to the already defined d3Selector.
   * That's useful for multiple generated charts elements.
   */
  updateD3Selector (chartPath: string): void {
    this.d3Selector_ = `${chartPath} ${this.lastPartD3Selector_}`;
  }

  /**
   * Set default margins.
   */
  setMargins(margins: Margins): void {
    Object.assign(this.margins, margins);
  }

  /**
   * Return svg size [width, height] without margins.
   */
  getDrawableSize(): [number, number] {
    return [
      this.width - this.margins.left - this.margins.right,
      this.height - this.margins.top - this.margins.bottom,
    ];
  }

  /**
   * Update the size of the svg element.
   * The element svg must be redrawn after.
   */
  updateSize(element: Element): void {
    this.width = (element as HTMLElement).offsetWidth;
    this.height = (element as HTMLElement).offsetHeight;
  }

  /**
   * Remove de SVG.
   */
  removeSVG(): void {
    d3Select(`${this.d3Selector_} svg`).remove();
  }

  /**
   * Draw the SVG with a 'chart' group inside.
   * The element will always preserve its ratio.
   */
  drawSVG(): void {
    this.svg = d3Select(this.d3Selector_)
      .append('svg:svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('class', 'svg');

    this.chart = this.svg.append('g')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)
      .attr('class', 'chart');
  }
}
