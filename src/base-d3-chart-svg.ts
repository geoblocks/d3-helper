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

export class BaseD3ChartSVG {

  private lastPartD3Selector_: string;
  protected d3Selector_: string;

  protected height_: number;
  protected width_: number;
  protected margins_: Margins;
  protected svg_: any;
  protected chart_: any;

  constructor(d3Selector: string) {
    this.lastPartD3Selector_ = d3Selector;
    this.d3Selector_ = d3Selector;
    this.height_ = 250;
    this.width_ = 250;
    this.margins_ = { top: 60, right: 80, bottom: 60, left: 80 };
  }

  protected updateD3Selector_ (chartPath: string): void {
    this.d3Selector_ = `${chartPath} ${this.lastPartD3Selector_}`;
  }

  protected setMargins_(margins: Margins): void {
    Object.assign(this.margins_, margins);
  }

  /**
   * Return svg size [width, height] without margins.
   */
  protected getDrawableSize_(): [number, number] {
    return [
      this.width_ - this.margins_.left - this.margins_.right,
      this.height_ - this.margins_.top - this.margins_.bottom,
    ];
  }

  protected removeSVG_(): void {
    d3Select(`${this.d3Selector_} svg`).remove();
  }

  protected drawSVG_(): void {
    this.svg_ = d3Select(this.d3Selector_)
      .append('svg:svg')
      .attr('viewBox', `0 0 ${this.width_} ${this.height_}`)
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('class', 'svg');

    this.chart_ = this.svg_.append('g')
      .attr('transform', `translate(${this.margins_.left}, ${this.margins_.top})`)
      .attr('class', 'chart');
  }
}
