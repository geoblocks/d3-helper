import { curveMonotoneX as d3CurveMonotoneX, line as d3Line } from 'd3-shape';
import { data } from '../data';
import { CartesianChart, AxisType } from '../../dist/d3-helper';

const config = {
  xAxis: {
    axisColumn: 'distance',
    label: 'Distance',
  },
  yAxis: {
    axisColumn: 'elevation',
    label: 'Elevation',
  },
};

class lineChart extends CartesianChart {
  constructor() {
    super('.chart');
  }

  draw() {
    this.setCartesianConfig_(config);
    this.removeUpdateDrawSVG_();
    this.setXAxis_(data);
    this.setYAxis_(data);

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

const chart = new lineChart();
chart.draw();
