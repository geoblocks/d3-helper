import { ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { BaseD3ChartSVG } from '../base-d3-chart-svg';
import { COLOR_CANNA } from '../app-constants';
import { DynamicValueService } from '../dynamic-value.service';
import { AxisType, CartesianChartConfig, CartesianChartAxisConfig,
         DatasourceConfig, Margins } from '../report/report-type';
import { getRenaming, getRoundedNumber, getUnit } from '../formatting/utils';
import { PolygonPosition } from '../utils/polygon';
import { Datasource, DataRow } from '../datasource/datasource';

export class CartesianChart extends BaseD3ChartSVG {

  private dynamicValueSystem_: DynamicValueService;
  protected config_: CartesianChartConfig;

  protected height_: number;
  protected width_: number;
  protected margins_: Margins;
  protected svg_: any;
  protected chart_: any;
  protected domaineAlwaysBuffered_: boolean;
  protected fontSize_: number;
  protected hoverPopupMargin_: number;
  protected tooltipText_: string[];
  protected hoverPreviousColor_: string;

  protected xData_: any[];
  protected yData_: any[];
  protected oppositeYData_: any[];

  protected xScale_: any;
  protected yScale_: any;
  protected oppositeYScale_: any;

  constructor(d3Selector: string, dynamicValueSystem: DynamicValueService) {
    super(d3Selector);
    this.d3Selector_ = d3Selector;
    this.dynamicValueSystem_ = dynamicValueSystem;
    this.domaineAlwaysBuffered_ = false;
    this.fontSize_ = 12;
    this.hoverPopupMargin_ = 5;
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
  }

  protected cleanCartesian_(): void {
    this.removeSVG_();
    this.xData_ = null;
    this.yData_ = null;
    this.oppositeYData_ = null;

    this.xScale_ = null;
    this.yScale_ = null;
    this.oppositeYScale_ = null;

    this.tooltipText_ = [];
  }

  protected updateSize_(elementRef: ElementRef): void {
    this.width_ = elementRef.nativeElement.children[0].offsetWidth;
    this.height_ = elementRef.nativeElement.children[0].offsetHeight;
  }

  protected removeUpdateDrawSVG_(elementRef: ElementRef): void {
    this.cleanCartesian_();
    this.updateSize_(elementRef);
    this.drawSVG_();
  }

  /**
   * Returns the axisColumn after dynamicValueSystem replacement.
   * If a dataRow is given, check if the column exists in the dataRow. Returns null if that's not the case.
   */
  protected getAxisColumnName_(axisConfig: CartesianChartAxisConfig, dataRow?: DataRow[]): string {
    const axis = this.dynamicValueSystem_.getValue(axisConfig.axisColumn);
    if (dataRow && dataRow.length > 0 && !dataRow[0][axis]) {
      return null;
    }
    return axis;
  }

  protected getAxisTickLabelColumnName_(axisConfig: CartesianChartAxisConfig): string {
    if (!axisConfig.tickLabelColumn) {
      return;
    }
    return this.dynamicValueSystem_.getValue(axisConfig.tickLabelColumn);
  }

  protected setXAxis_(dataRow: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .xaxis`).remove();
    const drawableWidth = this.getDrawableSize_()[0];
    const axisConfig = this.config_.xAxis;
    const axisName = this.getAxisColumnName_(axisConfig, dataRow);
    if (!axisName) {
      return;
    }
    this.xData_ = this.getFormatedData_(axisConfig.type, axisName, dataRow);
    this.xScale_ = this.getScale_(this.xData_, axisConfig.type, [0, drawableWidth]);
    if (!this.config_.xAxis.hideAxis) {
      this.drawXAxis_(COLOR_CANNA, dataRow);
    }
  }

  protected setYAxis_(dataRow: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .yaxis`).remove();
    const drawableHeight = this.getDrawableSize_()[1];
    const axisConfig = this.config_.yAxis;
    const axisName = this.getAxisColumnName_(axisConfig, dataRow);
    if (!axisName) {
      return;
    }
    this.yData_ = this.getFormatedData_(axisConfig.type, axisName, dataRow);
    this.yScale_ = this.getScale_(this.yData_, axisConfig.type, [drawableHeight, 0]);
    if (!this.config_.yAxis.hideAxis) {
      this.drawYAxis_(COLOR_CANNA, dataRow);
    }
  }

  protected setOppositeYAxis_(dataRow: DataRow[]): void {
    d3.select(`${this.d3Selector_} svg .opposite-yaxis`).remove();
    const drawableHeight = this.getDrawableSize_()[1];
    const axisConfig = this.config_.oppositeYAxis;
    const axisName = this.getAxisColumnName_(axisConfig, dataRow);
    if (!axisName) {
      return;
    }
    this.oppositeYData_ = this.getFormatedData_(axisConfig.type, axisName, dataRow);
    this.oppositeYScale_ = this.getScale_(this.oppositeYData_, axisConfig.type, [drawableHeight, 0]);
    this.drawOppositeYAxis_(COLOR_CANNA);
  }

  protected drawTitle_(colors: number[], subTitle?: string): void {
    const title = this.dynamicValueSystem_.getValue(this.config_.title);
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

  protected drawXAxis_(colors: number[], dataRow?: DataRow[]): void {
    const axis = this.setAxisTick_(this.config_.xAxis, d3.axisBottom(this.xScale_), dataRow);
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

  protected drawOppositeYAxis_(colors: number[]): void {
    const drawableWidth = this.getDrawableSize_()[0];
    const axis = this.setAxisTick_(this.config_.oppositeYAxis, d3.axisRight(this.oppositeYScale_));
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
   * @param dataRow (optional) data from the DB
   */
  private setAxisTick_(axisConfig: CartesianChartAxisConfig, baseAxis: any, dataRow?: DataRow[]): void {
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
      axisConfig.tickLabelColumn && dataRow) {
      const tickLabelName = this.getAxisTickLabelColumnName_(axisConfig);
      return baseAxis.ticks(ticks)
        .tickFormat((d) => {
          const dataEnrty = dataRow.find(dataEnrty =>
            this.compareData_(axisConfig, dataEnrty, d));
          return dataEnrty[tickLabelName];
        });
    }

    // Return ticks in a standard way with out any formatting.
    return baseAxis.ticks(ticks);
  }

  protected getFormatedData_(axisType: AxisType, dataKey: string, dataRow: DataRow[]): (number|string|Date)[] {
    if (axisType === AxisType.TEXT) {
      return dataRow.map(value => value[dataKey]);
    }
    if (axisType === AxisType.DATE) {
      return dataRow.map(value => new Date(value[dataKey]));
    }
    return dataRow.map(value => getRoundedNumber(value[dataKey]));
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

  /**
   * If there is no label in the configuration for the given axis, try to set one with the axis column name
   * and the datasource configuration.
   */
  protected useDataLabelAsDefaultForAxis_(axis: string, datasourceConfig: DatasourceConfig): void {
    const axisConfig = this.config_[axis];
    if (!axisConfig.label) {
      axisConfig.label = this.getAxisLabelsInData_(this.getAxisColumnName_(axisConfig), datasourceConfig) || '';
    }
  }

  protected getAxisLabelsInData_(columnName: string, datasourceConfig: DatasourceConfig): string {
    return getRenaming(columnName, datasourceConfig, this.dynamicValueSystem_);
  }

  /**
   * Return the x and y direction of the box based on:
   * @param xLocation x location of the point
   * @param yLocation y location of the point
   * @param xmiddle x values of the drawable middle
   * @param ymiddle y value of the drawable middle
   * Using the following coding:
   * true: left/top
   * false: right/bottom
   */
  protected getBoxDirection_(xLocation: number, yLocation: number, xmiddle: number, ymiddle: number): PolygonPosition {
    const yPos = yLocation < ymiddle;
    const xPos = xLocation > xmiddle;
    return { appearLeft: xPos, appearTop: yPos };
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
   * Set the contents of the tooltip drop-down.
   * @param data the data element to filter the string text out of.
   */
  protected setTooltipText_(data: DataRow, datasourceConfig?: DatasourceConfig): void {
    this.tooltipText_ = [];
    if (!this.config_.tooltipColumns) {
      return;
    }
    this.config_.tooltipColumns.forEach((columnInfo) => {
      let value = data[columnInfo.column];
      if (datasourceConfig) {
        const currency = getUnit(columnInfo.column, datasourceConfig, null, data);
        value = typeof value !== 'number' ? value : value.formatUnits(currency);
      } else {
        value = typeof value !== 'number' ? value : value.cannaRound(2).numberWithSpaces();
      }
      this.tooltipText_.push(`${columnInfo.prefix || ''}${value}${columnInfo.suffix || ''}`);
    });
  }

  /**
   * Determin the data point that given a certain index.
   * @param index index of the data point
   * @return datasource element corresponding to the given index.
   */
  protected getHoveredPoint_(index: number, datasource: Datasource): DataRow {
    const xValue = this.xData_[index];
    const yValue = this.yData_[index];

    const dataRow = datasource.data.find(dataElem =>
      this.compareData_(this.config_.yAxis, dataElem, yValue) &&
      this.compareData_(this.config_.xAxis, dataElem, xValue),
    );
    if (!dataRow) {
      console.error('Can not find point that is hovered in data!');
      return;
    }
    return dataRow;
  }

  /**
   * Determine if a given value from the x or y axes can be found in one given datasource entry
   * @param axisConfig the axis that the value is coming from (defines the header of the value)
   * @param dataValue one dictionary element of the datasource.
   * @param selectedValue the value to compare with. Can be String, Date or Number.
   */
  private compareData_(axisConfig: CartesianChartAxisConfig, dataValue: DataRow, selectedValue: string|Date|number): boolean {
    const axisColumnName = this.getAxisColumnName_(axisConfig);
    // comparison for number and sting values
    if ((axisConfig.type === AxisType.TEXT || axisConfig.type === AxisType.NUMBER)
        && !(selectedValue instanceof Date)) {
      return getRoundedNumber(dataValue[axisColumnName]) === getRoundedNumber(selectedValue);
    }
    // comparison for date values
    if (axisConfig.type === AxisType.DATE) {
      return (new Date(dataValue[axisColumnName])).getTime() === (selectedValue as Date).getTime();
    }
  }

  /**
   * Handler resetting the original state when hovering out of the object.
   * @param dataValue Placeholder value so that `this` can be bound to the function
   * @param index index of the current node
   * @param nodes all possible nodes
   */
  protected handleMouseOut_(dataValue: any, index: number, nodes: any[]): void {
    const point = nodes[index];
    // Remove mouseoverInfo
    this.svg_.select('.mouseoverInfo').remove();
    // Set cursor
    point.style.setProperty('cursor', 'default');
    // set color back to original color.
    point.setAttribute('fill', this.hoverPreviousColor_);
    this.hoverPreviousColor_ = undefined;
  }
}
