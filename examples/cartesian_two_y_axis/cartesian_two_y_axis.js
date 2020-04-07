import { curveMonotoneX as d3CurveMonotoneX, line as d3Line } from 'd3-shape';
import { transition } from 'd3-transition';
import { data as rawData } from '../data';
import { CartesianChart, AxisType } from '../../src/index';

// -> http://bl.ocks.org/methodofaction/4063326

const config = {
  color: [25, 25, 150],
  xAxis: {
    axisColumn: 'date',
    label: 'Date',
  },
  yAxis: {
    axisColumn: 'elevation',
    label: 'Sales',
  },
  oppositeYAxis: {
    axisColumn: 'distance',
    label: 'Discount',
    color: [200, 50, 100]
  },
};

let data = rawData.slice(40, 50); // Less data for a nicer chart.
data = data.map((d) => { //use date object.
  const date = d.date.split('/');
  d.date = new Date(`${date[1]}-${date[0]}-${date[2]}`); // Need mm-dd-yyyy, not dd-mm-yyyy.
  return d;
});
data.sort((d1, d2) => d1.date > d2.date ? 1 : -1); // Sort per date.

class lineBarChart extends CartesianChart {
  constructor() {
    super('.chart');
  }

  draw() {

    // Use d3 helper functions.
    this.setCartesianConfig_(config);
    this.removeUpdateDrawSVG_();
    this.setXAxis_(data);
    this.setYAxis_(data);
    this.setOppositeYAxis_(data);

    // Draw a custom vertical bars chart.
    const barGroups = this.chart_.selectAll()
      .data(this.yData_)
      .enter()
      .append('g');

    const [drawWidth, drawHeight] = this.getDrawableSize_();
    const barWidth = drawWidth / 4 / this.yData_.length;
    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => this.xScale_(this.xData_[i]) - barWidth / 2)
      .attr('y', drawHeight)
      .attr('height',  0)
      .attr('width', barWidth)
      .attr('fill', `rgb(${this.color_.join(',')})`)
      // Add a custom transition on two attributes to have growing vertical bars.
      .transition()
      .duration(1500)
      .attr('y', d => this.yScale_(d))
      .attr('height', d => drawHeight - this.yScale_(d));

    // Draw a custom line chart on x and opposit y axis.
    const lineFunction = d3Line()
      .curve(d3CurveMonotoneX)
      .x((d, i) => this.xScale_(this.xData_[i]))
      .y(d => this.oppositeYScale_(d));

    const line = this.chart_
      .append('path')
      .attr('class', 'line')
      .attr('d', lineFunction(this.oppositeYData_))
      .attr('stroke', `rgb(${this.config_.oppositeYAxis.color.join(',')})`)
      .attr('stroke-width', '2')
      .attr('fill', 'none');
    // Animation for the line
    const lineLength = line.node().getTotalLength();
    line
      .attr("stroke-dasharray", lineLength + " " + lineLength)
      .attr("stroke-dashoffset", lineLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0);
  }
}

const chart = new lineBarChart();
chart.draw();
