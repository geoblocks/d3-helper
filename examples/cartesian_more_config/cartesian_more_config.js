import { data } from '../data';
import { CartesianChart, AxisType } from '../../src/index';

const configOne = {
  color: [0, 100, 50],
  title: 'Cartesian demo one',
  chartPath: '.one',
  xAxis: {
    axisColumn: 'elevation',
    label: 'Sales',
  },
  yAxis: {
    axisColumn: 'company',
    label: 'Company',
  },
};

const configTwo = {
  color: [200, 100, 0],
  title: 'Cartesian demo two',
  chartPath: '.two',
  margins: { left: 140 },
  xAxis: {
    axisColumn: 'elevation',
    label: 'Sales',
    tickformat: '~s',
  },
  yAxis: {
    axisColumn: 'id',
    label: 'Company',
    tickLabelColumn: 'company',
  },
};

data.splice(0, 95); // Less data for a nicer chart.

class hBarChart extends CartesianChart {

  constructor(config) {
    super('.chart');
    this.config = config;
  }

  draw() {

    // Use d3 helper functions.
    this.setCartesianConfig_(this.config);
    this.removeUpdateDrawSVG_();
    this.setXAxis_(data);
    this.setYAxis_(data);
    this.drawTitle_(this.config_.color);

    // Draw a custom line chart.
    // Draw a custom  horizontal-bars chart
    const barGroups = this.chart_.selectAll()
      .data(this.yData_)
      .enter()
      .append('g');
    
    const barHeight = 10;
    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => this.yScale_(d) - barHeight / 2)
      .attr('height', barHeight)
      .attr('width', (d, i) => this.xScale_(this.xData_[i]))
      .attr('fill', `rgb(${this.config_.color.join(',')})`);
  }
}

const chartOne = new hBarChart(configOne);
const chartTwo = new hBarChart(configTwo);
chartOne.draw();
chartTwo.draw();
