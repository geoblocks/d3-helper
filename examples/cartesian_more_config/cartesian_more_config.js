import { dataset } from '../dataset';
import { CartesianChart, AxisType } from '../../src/index';

const configOne = {
  color: [0, 100, 50],
  fontSizeForAxis: '1rem',
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
  fontSizeForTitle: '1.3rem',
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

dataset.splice(0, 95); // Less data for a nicer chart.

class hBarChart extends CartesianChart {
  constructor(config) {
    super('.chart');
    this.setConfig(config);
  }

  draw() {
    const config = this.getConfig();
    // Use d3 helper functions.
    this.removeUpdateDrawSVG();
    this.dataset = dataset;
    this.setXAxis();
    this.setYAxis();
    this.drawTitle(config.color);

    // Draw a custom line chart.
    // Draw a custom  horizontal-bars chart
    const barGroups = this.chart.selectAll().data(this.dataset).enter().append('g');

    const barHeight = 10;
    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => this.getYScaleValue(d) - barHeight / 2)
      .attr('height', barHeight)
      .attr('width', (d) => this.getXScaleValue(d))
      .attr('fill', `rgb(${config.color.join(',')})`);
  }
}

const chartOne = new hBarChart(configOne);
const chartTwo = new hBarChart(configTwo);
chartOne.draw();
chartTwo.draw();
