import { curveMonotoneX as d3CurveMonotoneX, line as d3Line } from 'd3-shape';
import { data } from '../data';
import { CartesianChart, AxisType } from '../../src/index';

const config = {
  xAxis: {
    axisColumn: 'distance',
  },
  yAxis: {
    axisColumn: 'elevation',
  },
};

data.splice(0, 50); // Less data for a nicer chart.

class LineChart extends CartesianChart {
  constructor() {
    super('.chart');
  }

  draw() {
    // Set the config for CartesianChart.
    this.setCartesianConfig_(config);
    // Use BaseD3ChartSVG to draw the svg.
    this.removeUpdateDrawSVG_();
    // Optionally, use CartesianChart to get label for axis from the data.
    this.useDataLabelAsDefaultForAxis_('xAxis');
    this.useDataLabelAsDefaultForAxis_('yAxis');
    // Draw axis using CartesianChart.
    this.setXAxis_(data);
    this.setYAxis_(data);

    // Draw a custom line chart.
    const lineFunction = d3Line()
      .curve(d3CurveMonotoneX)
      .x((d, i) => this.xScale_(this.xData_[i]))
      .y(d => this.yScale_(d));

    this.chart_.selectAll()
      .data(this.yData_)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', lineFunction(this.yData_))
      .attr('stroke', `rgb(${this.color_.join(',')})`)
      .attr('stroke-width', '1')
      .attr('fill', 'none');
  }
}

const chart = new LineChart();
chart.draw();
