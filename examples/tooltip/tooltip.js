import { data as rawData } from '../data';
import { CartesianChart, AxisType } from '../../src/index';

const config = {
  color: [0, 25, 150, 0.5],
  xAxis: {
    axisColumn: 'date',
    label: 'Date',
  },
  yAxis: {
    axisColumn: 'elevation',
    label: 'Events',
  },
};

let data = rawData.slice(0, 50); // Less data for a nicer chart.
data = data.map((d) => { //use date object.
  const date = d.date.split('/');
  d.date = new Date(`${date[1]}-${date[0]}-${date[2]}`); // Need mm-dd-yyyy, not dd-mm-yyyy.
  return d;
});
data.sort((d1, d2) => d1.date > d2.date ? 1 : -1); // Sort per date.

class ScatterplotChart extends CartesianChart {
  constructor() {
    super('.chart');
  }

  draw() {
    this.setCartesianConfig_(config);
    this.removeUpdateDrawSVG_();
    this.setXAxis_(data);
    this.setYAxis_(data);

    this.chart_.selectAll()
      .data(this.yData_)  // using the values in the y-data array
      .enter()
      .append('svg:circle')
      .attr('cy', d => this.yScale_(d)) // Y position
      .attr('cx', (d, i) => this.xScale_(this.xData_[i])) // X position
      .attr('r', () => (5)) // Radius size of the point
      .attr('fill', `rgba(${this.color_.join(',')})`);
  }
}

const chart = new ScatterplotChart();
chart.draw();
