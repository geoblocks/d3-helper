import { curveMonotoneX as d3CurveMonotoneX, line as d3Line } from 'd3-shape';
import { transition } from 'd3-transition';
import { dataset as rawDataset } from '../dataset';
import { CartesianChart, AxisType } from '../../src/index';

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

let dataset = rawDataset.slice(40, 50); // Less data for a nicer chart.
dataset = dataset.map((dataItem) => { //use date object.
  const date = dataItem.date.split('/');
  dataItem.date = new Date(`${date[2]}-${date[1]}-${date[0]}`); // Need yyyy-mm-dd, not dd-mm-yyyy.
  return dataItem;
});
dataset.sort((d1, d2) => d1.date > d2.date ? 1 : -1); // Sort per date.

class lineBarChart extends CartesianChart {
  constructor() {
    super('.chart');
  }

  draw() {
    // Use d3 helper functions.
    this.setConfig(config);
    this.removeUpdateDrawSVG();
    this.dataset = dataset;
    this.setXAxis();
    this.setYAxis();
    this.setOppositeYAxis();

    // Draw a custom vertical bars chart.
    const barGroups = this.chart.selectAll()
      .data(this.dataset)
      .enter()
      .append('g');

    const [drawWidth, drawHeight] = this.getDrawableSize();
    const barWidth = drawWidth / 4 / this.dataset.length;
    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.getXScaleValue(d) - barWidth / 2)
      .attr('y', drawHeight)
      .attr('height',  0)
      .attr('width', barWidth)
      .attr('fill', `rgb(${this.color.join(',')})`)
      // Add a custom transition on two attributes to have growing vertical bars.
      .transition()
      .duration(1500)
      .attr('y', d => this.getYScaleValue(d))
      .attr('height', d => drawHeight - this.getYScaleValue(d));

    // Draw a custom line chart on x and opposit y axis.
    const lineFunction = d3Line()
      .curve(d3CurveMonotoneX)
      .x(d => this.getXScaleValue(d))
      .y(d => this.getOppositeYScaleValue(d));

    const line = this.chart
      .append('path')
      .attr('class', 'line')
      .attr('d', lineFunction(this.dataset))
      .attr('stroke', `rgb(${config.oppositeYAxis.color.join(',')})`)
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
