import * as d3 from 'd3';
import { BaseD3ChartSVG, Margins } from './base-d3-chart-svg';
import { getRoundedNumber } from './utils';

/**
 * One row of data
 */
export interface DataRow {
  [Key: string]: string|number;
}

/**
 * Defines the possible types that an axis in a cartesian chart can have.
 */
export enum AxisType {
  TEXT = 'text',
  DATE = 'date',
  NUMBER = 'number',
}

/**
 * Configuration for axis in a cartesian chart.
 */
export interface CartesianChartAxisConfig {
  /**
   * Column giving the data values for this axis.
   */
  axisColumn: string;
  /**
   * Axis data type.
   */
  type: AxisType;
  /**
   * Axis static label.
   * If not set, the chart may try to use the axis column as label.
   */
  label?: string;
  /**
   * If true the whole axis is hidden.
   */
  hideAxis?: boolean;
  /**
   * Specifies a special format for the axis tick. Use d3 formats. Implements for numbers and dates.
   */
  tickformat?: string;
  /**
   * Specify how many ticks are used for the axis (default is 5).
   */
  tickNumber?: number;
  /**
   * Column used to label the ticks. If nothing is specified the axisColumn is used.
   * This is only implemented if the value the axis is of type "TEXT"
   */
  tickLabelColumn?: string;
}

/**
 * Configuration for a cartesian chart.
 */
export interface CartesianChartConfig {
  /**
   * Reference color to use on titles, axis titles, etc.
   */
  color: number[];
  /**
   * Columns with data to be plotted on a cartesian chart. Needs two column names for x and y axis
   * If noting is specified nothing will be plotted.
   */
  xAxis: CartesianChartAxisConfig;
  /**
   * Same as xAxis.
   */
  yAxis: CartesianChartAxisConfig;
  /**
   * Secondary opposite Axis configuration. Will need a second dataset to setup the axis.
   */
  oppositeYAxis?: CartesianChartAxisConfig;
  /**
   * The exact html class that should contain the chart.
   * This config is needed when there are two widgets on the same report containing the same chart.
   */
  chartPath?: string;
  /**
   * Margins are used to display axis. If an axis is hidden, you can but probably won't update the margins.
   */
  margins?: Margins;
  /**
   * An optional title.
   */
  title?: string;
}

/**
 * Helper class to draw a cartesian chart.
 */
export class CartesianChart extends BaseD3ChartSVG {

  private config_: CartesianChartConfig;

  protected color_: number[];
  protected domaineAlwaysBuffered_: boolean;

  protected xData_: any[];
  protected yData_: any[];
  protected oppositeYData_: any[];

  protected xScale_: any;
  protected yScale_: any;
  protected oppositeYScale_: any;

  constructor(d3Selector: string) {
    super(d3Selector);
    this.d3Selector_ = d3Selector;
    this.domaineAlwaysBuffered_ = false;
    this.color_ = [80, 80, 80];
  }

  protected setCartesianConfig_(config: CartesianChartConfig): void {
    this.config_ = config;
    if (this.config_.chartPath) {
      this.updateD3Selector_(this.config_.chartPath);
    }
    if (this.config_.xAxis.hideAxis) {
      this.margins_.right = 5;
      this.margins_.left = 5;
    }
    if (this.config_.yAxis.hideAxis) {
      this.margins_.top = 5;
      this.margins_.bottom = 5;
    }
    if (this.config_.margins) {
      this.setMargins_(this.config_.margins);
    }
    this.color_ = this.config_.color; 
  }

  protected cleanCartesian_(): void {
    this.removeSVG_();
    this.xData_ = null;
    this.yData_ = null;
    this.oppositeYData_ = null;

    this.xScale_ = null;
    this.yScale_ = null;
    this.oppositeYScale_ = null;
  }

  protected updateSize_(element: HTMLElement): void {
    this.width_ = (element.children[0] as HTMLElement).offsetWidth;
    this.height_ = (element.children[0] as HTMLElement).offsetHeight;
  }

  protected removeUpdateDrawSVG_(element: HTMLElement): void {
    this.cleanCartesian_();
    this.updateSize_(element);
    this.drawSVG_();
  }

  /**
   * Returns the axisColumn.
   * If data are given, check if the column exists. Returns null if that's not the case.
   */
  protected getAxisColumnName_(axisConfig: CartesianChartAxisConfig, data?: DataRow[]): string {
    const axis = axisConfig.axisColumn;
    if (data && data.length > 0 && !data[0][axis]) {
      return null;
    }
    return axis;
  }

  protected setXAxis_(data: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .xaxis`).remove();
    const drawableWidth = this.getDrawableSize_()[0];
    const axisConfig = this.config_.xAxis;
    const axisName = this.getAxisColumnName_(axisConfig, data);
    if (!axisName) {
      return;
    }
    this.xData_ = this.getFormatedData_(axisConfig.type, axisName, data);
    this.xScale_ = this.getScale_(this.xData_, axisConfig.type, [0, drawableWidth]);
    if (!this.config_.xAxis.hideAxis) {
      this.drawXAxis_(this.color_, data);
    }
  }

  protected setYAxis_(data: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .yaxis`).remove();
    const drawableHeight = this.getDrawableSize_()[1];
    const axisConfig = this.config_.yAxis;
    const axisName = this.getAxisColumnName_(axisConfig, data);
    if (!axisName) {
      return;
    }
    this.yData_ = this.getFormatedData_(axisConfig.type, axisName, data);
    this.yScale_ = this.getScale_(this.yData_, axisConfig.type, [drawableHeight, 0]);
    if (!this.config_.yAxis.hideAxis) {
      this.drawYAxis_(this.color_, data);
    }
  }

  protected setOppositeYAxis_(data: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .opposite-yaxis`).remove();
    const drawableHeight = this.getDrawableSize_()[1];
    const axisConfig = this.config_.oppositeYAxis;
    const axisName = this.getAxisColumnName_(axisConfig, data);
    if (!axisName) {
      return;
    }
    this.oppositeYData_ = this.getFormatedData_(axisConfig.type, axisName, data);
    this.oppositeYScale_ = this.getScale_(this.oppositeYData_, axisConfig.type, [drawableHeight, 0]);
    this.drawOppositeYAxis_(this.color_);
  }

  protected drawTitle_(colors: number[], subTitle?: string): void {
    const title = this.config_.title;
    this.svg_.append('text')
      .attr('class', 'title')
      .attr('x', this.width_ / 2)
      .attr('y', this.margins_.top / 2)
      .attr('font-size', '1.2rem')
      .attr('fill', `rgb(${colors.join(',')})`)
      .style('text-anchor', 'middle')
      .text(title);
    this.svg_.append('text')
      .attr('class', 'subtitle')
      .attr('x', this.width_ / 2)
      .attr('y', this.margins_.top / 2)
      .attr('font-size', '1.2rem')
      .attr('fill', `rgb(${colors.join(',')})`)
      .style('text-anchor', 'middle')
      .text(subTitle);
  }

  protected drawXAxis_(colors: number[], data?: DataRow[]): void {
    const axis = this.setAxisTick_(this.config_.xAxis, d3.axisBottom(this.xScale_), data);
    const [drawableWidth, drawableHeight] = this.getDrawableSize_();
    this.chart_.append('g')
      .attr('transform', `translate(0, ${drawableHeight})`)
      .attr('class', 'chart xaxis')
      .call(axis)
      .append('text')
      .attr('class', 'label')
      .attr('x', drawableWidth / 2)
      .attr('y', this.margins_.bottom - 5)
      .attr('fill', `rgb(${colors.join(',')})`)
      .style('text-anchor', 'middle')
      .style('font-size', '1.1em')
      .text(this.config_.xAxis.label);

    this.chart_.selectAll('.xaxis .tick text')
      .call(this.wrapAxisLabels_, this.margins_.bottom - 15, 0)
      .attr('transform', 'translate(0, 8) rotate(-36)')
      .attr('text-anchor', 'end');
  }

  protected drawYAxis_(colors: number[], data?: DataRow[]): void {
    const axis = this.setAxisTick_(this.config_.yAxis, d3.axisLeft(this.yScale_), data);
    this.chart_.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'chart yaxis')
      .call(axis)
      .append('text')
      .attr('class', 'label')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', `rgb(${colors.join(',')})`)
      .style('text-anchor', 'end')
      .style('font-size', '1.1em')
      .text(this.config_.yAxis.label);

    this.chart_.selectAll('.yaxis .tick text')
      .call(this.wrapAxisLabels_, this.margins_.left - 15, -10);
  }

  protected drawOppositeYAxis_(colors: number[], data?: DataRow[]): void {
    const drawableWidth = this.getDrawableSize_()[0];
    const axis = this.setAxisTick_(this.config_.oppositeYAxis, d3.axisRight(this.oppositeYScale_), data);
    this.chart_.append('g')
      .attr('transform', `translate(${drawableWidth}, 0)`)
      .attr('class', 'chart opposite-yaxis')
      .call(axis)
      .append('text')
      .attr('class', 'label')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', `rgb(${colors.join(',')})`)
      .style('text-anchor', 'start')
      .style('font-size', '1.1em')
      .text(this.config_.oppositeYAxis.label);

    this.chart_.selectAll('.opposite-yaxis .tick text')
      .call(this.wrapAxisLabels_, this.margins_.right - 15, 10);
  }

  // Add line break on too long axis levels labels
  private wrapAxisLabels_(text: any, width: number, x: number): void {
    text.nodes().forEach((node) => {
      const textSelection = d3.select(node);
      const words = textSelection.text().replace('-', '- ').replace('.', '. ').split(/\s+/);
      const mustBreakWords = node.getComputedTextLength() > width;
      const maxNumberOfLines = 2;
      const lineHeight = 1.1; // ems
      const y = mustBreakWords ? -8 : 0;
      const dy = parseFloat(textSelection.attr('dy'));

      let tspan = textSelection.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', `${dy}em`);
      let line = [];
      let lineNumber = 0;

      words.forEach((word) => {
        if (lineNumber >= maxNumberOfLines) {
          return;
        }
        line.push(word);
        // Add the word in tspan
        tspan.text(line.join(' '));
        // Check if the line is too long
        if (tspan.node().getComputedTextLength() > width) {
          // Too long line: remove the word from the array...
          line.pop();
          lineNumber += 1;
          if (lineNumber < maxNumberOfLines) {
            // ... and re-append the line with previous words. Then add a new tspan with the removed word.
            tspan.text(line.join(' '));
            line = [word];
            const newLineDy = `${lineNumber * lineHeight + dy}em`;
            tspan = textSelection.append('tspan').attr('x', x).attr('y', y).attr('dy', newLineDy).text(word);
          } else {
            // If that was the last authorised line, add an ellipsis as last word.
            line.push('…');
            tspan.text(line.join(' '));
          }
        }
      });
    });
  }

  /**
   * Set the ticks of the axis and add formatting and customisations if specified.
   * @param axisConfig config of the current axis.
   * @param baseAxis a bas axis to add the ticks
   * @param data (optional) data for text AxisType
   */
  private setAxisTick_(axisConfig: CartesianChartAxisConfig, baseAxis: any, data: DataRow[]): void {
    const ticks = axisConfig.tickNumber || 5;

    // Return ticks with nicely formatted Date values.
    if (axisConfig.tickformat && axisConfig.type === AxisType.DATE) {
      const dateFormat = d3.timeFormat(axisConfig.tickformat);
      return baseAxis.ticks(ticks)
        .tickFormat(dateFormat);
    }

    // Return ticks with formatted number values.
    if (axisConfig.tickformat && axisConfig.type === AxisType.NUMBER) {
      const numberFormat = d3.format(axisConfig.tickformat);
      return baseAxis.ticks(ticks)
        .tickFormat(numberFormat);
    }

    // Return special text ticks with values that are taken from
    // another DB column than what was used for plotting.
    if (axisConfig.type === AxisType.TEXT &&
      axisConfig.tickLabelColumn && data) {
      const tickLabelName = axisConfig.tickLabelColumn;
      return baseAxis.ticks(ticks)
        .tickFormat((d) => {
          const dataRow = data.find(dataRow =>
            this.compareData_(axisConfig, dataRow, d));
          return dataRow[tickLabelName];
        });
    }

    // Return ticks in a standard way with out any formatting.
    return baseAxis.ticks(ticks);
  }

  protected getFormatedData_(axisType: AxisType, dataKey: string, data: DataRow[]): (number|string|Date)[] {
    if (axisType === AxisType.TEXT) {
      return data.map(value => value[dataKey]);
    }
    if (axisType === AxisType.DATE) {
      return data.map(value => new Date(value[dataKey]));
    }
    return data.map(value => getRoundedNumber(value[dataKey]));
  }

  private getScale_(axisData: any, axisType: string, range: number[]): any {
    let scale: any;
    if (axisType === AxisType.TEXT) {
      scale = d3.scalePoint()
        .domain(axisData)
        .range(range)
        .padding(0.5);
    } else {
      if (axisType === AxisType.DATE) {
        scale = d3.scaleTime();
      } else {
        scale = d3.scaleLinear();
      }
      scale.domain(
        this.determineDomain_(
          d3.min(axisData),
          d3.max(axisData),
        ),
      )
      .nice()
      .range(range);
    }
    return scale;
  }

  /**
   * Create an array containing the min and the max value determining the domain used for the axis.
   * Can use a buffer around the value to create new max and min values around the given value.
   */
  private determineDomain_(minValue: number | Date, maxValue: number | Date): (number | Date)[] {
    if (minValue !== maxValue && !this.domaineAlwaysBuffered_) {
      return [minValue, maxValue];
    }
    if (minValue instanceof Date && maxValue instanceof Date) {
      const newMin = new Date(minValue);
      const newMax = new Date(maxValue);
      return [
        newMin.setDate(minValue.getDate() - 15),
        newMax.setDate(maxValue.getDate() + 15),
      ];
    }
    if (typeof minValue === 'number' && typeof maxValue === 'number') {
      const buffer = minValue / 100;
      return [minValue - buffer, maxValue + buffer];
    }
    console.error('Unable to determine domain');
    return [];
  }

  protected useDataLabelAsDefaultForAxis_(axis: string): void {
    const axisConfig = this.config_[axis];
    if (!axisConfig.label) {
      axisConfig.label = this.getAxisColumnName_(axisConfig) || '';
    }
  }

  /**
   * trunc text that is longer than a given number of characters.
   * @param text string to truncate.
   * @param length max number of characters (defaults to 30).
   */
  protected truncText_ (text: string, length: number = 30): string {
    if (text.length > length) {
      return `${text.substring(0, length)} ...`;
    }
    return text;
  }


  /**
   * Determine if a given value from the x or y axes can be found in one given data entry
   * @param axisConfig the axis that the value is coming from (defines the header of the value)
   * @param dataRow one dictionary element of the data.
   * @param selectedValue the value to compare with. Can be String, Date or Number.
   */
  private compareData_(axisConfig: CartesianChartAxisConfig, dataRow: DataRow, selectedValue: string|Date|number): boolean {
    const axisColumnName = this.getAxisColumnName_(axisConfig);
    // comparison for date values
    if (axisConfig.type === AxisType.DATE) {
      return (new Date(dataRow[axisColumnName])).getTime() === (selectedValue as Date).getTime();
    }
    // comparison for number and sting values
    if ((axisConfig.type === AxisType.TEXT || axisConfig.type === AxisType.NUMBER) && !(selectedValue instanceof Date)) {
      return getRoundedNumber(dataRow[axisColumnName]) === getRoundedNumber(selectedValue);
    }
    return false;
  }
}
