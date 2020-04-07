import { arc as d3Arc, pie as d3Pie } from 'd3-shape';
import { data } from '../data';
import { BaseD3ChartSVG } from '../../src/index';

const config = {
};

/**
 * Defined list of hex colors (used in pie-chart.).
 */
const HEX_COLORS = [
  '#F4EB37', '#CDDC39', '#62AF44', '#009D57', '#0BA9CC', '#4186F0', '#3F5BA9',
  '#7C3592', '#A61B4A', '#DB4436', '#F8971B', '#F4B400', '#795046', '#F9F7A6',
  '#E6EEA3', '#B7DBAB', '#7CCFA9', '#93D7E8', '#9FC3FF', '#A7B5D7', '#C6A4CF',
  '#D698AD', '#EE9C96', '#FAD199', '#FFDD5E', '#B29189', '#ffffff', '#CCCCCC',
  '#777', '#000000',
];

data.splice(0, 94); // Less data for a nicer chart.

class LineChart extends BaseD3ChartSVG {
  constructor() {
    super('.chart');
    this.pie_ = d3Pie()
      .sort(null)
      .value(d => d.elevation);
  }

  draw() {
    // Use BaseD3ChartSVG to draw the svg.
    this.updateSize_(document.querySelector(this.d3Selector_));
    // Move pie-chart to the center of the svg.
    this.setMargins_({ top: this.height_ / 2, left: this.width_ / 2 });
    // Draw the svg.
    this.drawSVG_();

    // Draw a custom pie chart.
    const outerRadius = Math.min(this.width_, this.height_) / 2;
    const arc = d3Arc().innerRadius(outerRadius / 2).outerRadius(outerRadius)
    const pie = this.chart_.selectAll()
      .data(this.pie_(data))
      .enter()
      .append("g")
      .attr('class', 'arc');
    // Draw pie slices
    pie.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => HEX_COLORS[i])
      .attr('stroke', 'white')
      .attr('stroke-width', '2px');
    // Draw text in slices
    pie.append("text")
      .attr("transform", d => `translate(${(arc.centroid(d)[0] - 12)} ${arc.centroid(d)[1]})`)
      .attr("dy", ".35em")
      .text(d => d.data.id);
  }
}

const chart = new LineChart();
chart.draw();
