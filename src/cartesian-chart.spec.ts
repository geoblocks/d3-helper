import { CartesianChart, CartesianChartConfig, AxisType } from './cartesian-chart';

describe('CartesianChart class functions', () => {

  let chart;
  let config;
  const data = [
    { elevation: null, obj: 'rock in the sea', date: null },
    { elevation: 20.5, obj: null, date: new Date('01-31-2019') },
    { elevation: 100, obj: 'tree', date: new Date('03-01-2015') },
    { elevation: -12, obj: 'house', date: new Date('01-01-2018') },
  ];

  let logErrorFn;
  const disableLogError = () => {
    logErrorFn = console.error;
    console.error = () => {};
  };
  const enableLogError = () => {
    console.error = logErrorFn;
  };

  beforeEach(() => {
    // Creare an element to draw the chart.
    document.body.innerHTML = '<div class="my-chart"></div>';
    // Cheat a little bit to have a size for the component.
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
    // Polyfill the missing getComputedTextLength method in test
    window.SVGElement.prototype['getComputedTextLength'] = () => 50;
    // Create a chart Object.
    chart = new CartesianChart('.my-chart');

    // Set a basic config
    config = {
      xAxis: { axisColumn: 'obj' },
      yAxis: { axisColumn: 'elevation' },
    } as CartesianChartConfig;
  });

  it('should be created', () => {
    expect(chart).toBeTruthy();
  });

  it('setConfig', () => {
    // Simple config - default config
    chart.setConfig(config);
    expect(chart.getD3Selector()).toEqual('.my-chart');
    expect(chart.margins).toEqual({ top: 60, right: 80, bottom: 60, left: 80 });
    expect(chart.color).toEqual([100, 100, 100]);

    // More specific config
    Object.assign(config, {
      chartPath: 'div.cartesian',
      margins: { bottom: 0 },
      color: [0, 0, 255],
    });
    config.xAxis.hideAxis = true;
    config.yAxis.hideAxis = true;
    chart.setConfig(config);
    expect(chart.getD3Selector()).toEqual('div.cartesian .my-chart');
    expect(chart.margins).toEqual({ top: 5, right: 5, bottom: 0, left: 5 });
    expect(chart.color).toEqual([0, 0, 255]);

    // With not hidden opposite y axis
    config.oppositeYAxis = { axisColumn: 'foo' };
    chart.setMargins({ top: 60, right: 80, bottom: 60, left: 80 });
    chart.setConfig(config);
    expect(chart.margins).toEqual({ top: 60, right: 5, bottom: 0, left: 5 });
  });

  it('getConfig', () => {
    expect(chart.getConfig()).toBeUndefined();
    chart.setConfig(config);
    expect(chart.getConfig()).toBe(config);
  });

  it('assertConfigExists', () => {
    disableLogError(); // Silent console.error.
    expect(chart.assertConfigExists()).toBeFalsy();
    enableLogError(); // Enable console.error.

    chart.setConfig(config);
    expect(chart.assertConfigExists()).toBeTruthy();

    // Assert cleaning cartesian don't remove config.
    chart.cleanCartesian();
    expect(chart.assertConfigExists()).toBeTruthy();
  });

  it('cleanCartesian', () => {
    // Set up
    chart.drawSVG();
    expect(chart.svg).toBeTruthy();
    expect(chart.xData).toBeUndefined();

    // Clean
    chart.cleanCartesian();
    expect(chart.svg).toBeNull();
    expect(chart.xData).toBeNull();
    expect(chart.yData).toBeNull();
    expect(chart.oppositeYData).toBeNull();
    expect(chart.xScale).toBeNull();
    expect(chart.yScale).toBeNull();
    expect(chart.oppositeYScale).toBeNull();
  });

  it('removeUpdateDrawSVG', () => {
    // Base state
    expect(chart.yData).toBeUndefined();
    expect(chart.svg).toBeUndefined();
    expect(chart.width).toEqual(250);

    // RemoveUpdateDrawSVG
    chart.removeUpdateDrawSVG();
    expect(chart.yData).toBeNull();
    expect(chart.svg).toBeTruthy();
    expect(chart.width).toEqual(400);
  });

  it('getAxisColumnName', () => {
    expect(chart.getAxisColumnName(null, data)).toBeNull();
    expect(chart.getAxisColumnName(config.xAxis, [])).toBeNull();
    expect(chart.getAxisColumnName(config.xAxis, data)).toEqual('obj');
    expect(chart.getAxisColumnName(config.yAxis, data)).toEqual('elevation');
    expect(chart.getAxisColumnName(config.oppositeYAxis, data)).toBeNull();
  });

  it('getDataType', () => {
    disableLogError(); // Silent console.error.
    expect(chart.getDataType(data, '')).toEqual(AxisType.TEXT);
    enableLogError(); // Enable console.error.
    expect(chart.getDataType(data, 'obj')).toEqual(AxisType.TEXT);
    expect(chart.getDataType(data, 'elevation')).toEqual(AxisType.NUMBER);
    expect(chart.getDataType(data, 'date')).toEqual(AxisType.DATE);
  });

  it('castToDataValue', () => {
    expect(chart.castToDataValue('12')).toBe('12');
    expect(chart.castToDataValue('ab')).toBe('ab');
    expect(chart.castToDataValue(3)).toBe(3);
    const date = new Date();
    expect(chart.castToDataValue(date)).toBe(date);
    expect(chart.castToDataValue(true)).toBe(null);
    expect(chart.castToDataValue(NaN)).toBe(NaN);
    expect(chart.castToDataValue(undefined)).toBe(null);
    expect(chart.castToDataValue(null)).toBe(null);
  });

  it('setXAxis', () => {
    disableLogError(); // Silent console.error.
    chart.setXAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.xData).toBeNull();
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(chart.xData).toBeNull();
    expect(document.querySelector('.xaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.setXAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.xData).toBeNull();
    expect(document.querySelector('.xaxis')).toBeNull();

    // Set config, draw axis.
    chart.setConfig(config);
    chart.setXAxis(data);
    expect(chart.xData).toBeTruthy();
    expect(chart.xScale).toBeTruthy();
    expect(document.querySelectorAll('.xaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.xAxis.hideAxis = true;
    chart.setXAxis(data);
    expect(chart.xData).toBeTruthy();
    expect(chart.xScale).toBeTruthy();
    expect(document.querySelector('.xaxis')).toBeNull();

    // Set config with not existant column, no axis.
    config.xAxis.hideAxis = false;
    config.xAxis.axisColumn = 'foo';
    chart.setXAxis(data);
    expect(chart.xData).toBeNull();
    expect(document.querySelector('.xaxis')).toBeNull();
  });

  it('setYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.setYAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.yData).toBeNull();
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(chart.yData).toBeNull();
    expect(document.querySelector('.yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.setYAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.yData).toBeNull();
    expect(document.querySelector('.yaxis')).toBeNull();

    // Set config, draw axis.
    chart.setConfig(config);
    chart.setYAxis(data);
    expect(chart.yData).toBeTruthy();
    expect(chart.yScale).toBeTruthy();
    expect(document.querySelectorAll('.yaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.yAxis.hideAxis = true;
    chart.setYAxis(data);
    expect(chart.yData).toBeTruthy();
    expect(chart.yScale).toBeTruthy();
    expect(document.querySelector('.yaxis')).toBeNull();

    // Set config with not existant column, no axis.
    config.yAxis.hideAxis = false;
    config.yAxis.axisColumn = 'foo';
    chart.setYAxis(data);
    expect(chart.yData).toBeNull();
    expect(document.querySelector('.yaxis')).toBeNull();
  });

  it('setOppositeYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.setOppositeYAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.oppositeYData).toBeNull();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(chart.oppositeYData).toBeNull();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.setOppositeYAxis(data);
    enableLogError(); // Enable console.error.
    expect(chart.oppositeYData).toBeNull();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Set config, draw axis.
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    chart.setOppositeYAxis(data);
    expect(chart.oppositeYData).toBeTruthy();
    expect(chart.oppositeYScale).toBeTruthy();
    expect(document.querySelectorAll('.opposite-yaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.oppositeYAxis.hideAxis = true;
    chart.setOppositeYAxis(data);
    expect(chart.oppositeYData).toBeTruthy();
    expect(chart.oppositeYScale).toBeTruthy();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Set config with not existant column, no axis.
    config.oppositeYAxis.hideAxis = false;
    config.oppositeYAxis.axisColumn = 'foo';
    chart.setOppositeYAxis(data);
    expect(chart.oppositeYData).toBeNull();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();
  });

  it('drawTitle', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawTitle(chart.color);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.title')).toBeNull();

    // Draw svg, not title: no title yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.title')).toBeNull();

    // No config, no title
    disableLogError(); // Silent console.error.
    chart.drawTitle(chart.color);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.title')).toBeNull();

    // Draw title.
    chart.setConfig(config);
    chart.drawTitle(chart.color);
    expect(document.querySelectorAll('.title').length).toEqual(1);
    expect(document.querySelector('.subtitle')).toBeNull();

    // Draw subtitle (twice to be sure it removes old title and subtitle).
    chart.drawTitle(chart.color, 'Test subtitle');
    chart.drawTitle(chart.color, 'Test subtitle');
    expect(document.querySelectorAll('.title').length).toEqual(1);
    expect(document.querySelectorAll('.subtitle').length).toEqual(1);
  });

  it('drawXAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawXAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.xaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawXAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // No scale, no axis
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawXAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw axis (twice, must result only one xaxis).
    const xData = data.map(dataRow => dataRow[config.xAxis.axisColumn]);
    chart.xScale = chart.getScale(xData, AxisType.TEXT, [0, 100]);
    chart.drawXAxis(chart.color, data);
    chart.drawXAxis(chart.color, data);
    expect(document.querySelectorAll('.xaxis').length).toEqual(1);
  });

  it('drawYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // No scale, no axis
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw axis (twice, must result only one yaxis).
    const yData = data.map(dataRow => dataRow[config.yAxis.axisColumn]);
    chart.yScale = chart.getScale(yData, AxisType.NUMBER, [0, 100]);
    chart.drawYAxis(chart.color, data);
    chart.drawYAxis(chart.color, data);
    expect(document.querySelectorAll('.yaxis').length).toEqual(1);
  });

  it('drawOppositeYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No scale, no axis
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, data);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw axis (twice, must result only one oppositeYaxis).
    const oppositeYData = data.map(dataRow => dataRow[config.oppositeYAxis.axisColumn]);
    chart.oppositeYScale = chart.getScale(oppositeYData, AxisType.DATE, [0, 100]);
    chart.drawOppositeYAxis(chart.color, data);
    chart.drawOppositeYAxis(chart.color, data);
    expect(document.querySelectorAll('.opposite-yaxis').length).toEqual(1);
  });

  it('wrapAxisLabels', () => {
    // Draw axis using d3 to ensure d3 select will work as expected
    chart.setConfig(config);
    chart.removeUpdateDrawSVG();
    chart.setXAxis(data);
    let textGroup = chart.chart.selectAll('.xaxis .tick text');
    chart.wrapAxisLabels(textGroup, 30, 0);
    textGroup = chart.chart.selectAll('.xaxis .tick text tspan');
    // As I can't have a correct getComputedTextLength fn, the result is strange.
    expect(textGroup.nodes()[1].innerHTML).toEqual('rock …');
    expect(textGroup.nodes()[5].innerHTML).toEqual('tree');
    expect(textGroup.nodes()[7].innerHTML).toEqual('house');
  });

  it('setAxisTick', () => {
    // Not directly tested yet.
  });

  it('getScale', () => {
    // Not directly tested yet.
  });

  it('determineDomain', () => {
    // Numbers whitout domainAlwaysBuffered.
    expect(chart.determineDomain(-100, 100)).toEqual([-100, 100]);
    expect(chart.determineDomain(100, 100)).toEqual([99, 101]);

    // Dates whitout domainAlwaysBuffered.
    const date1 = new Date('01-01-2018');
    const date2 = new Date('01-01-2019');
    const date1BufferMin = new Date('12-17-2017');
    const date1BufferMax = new Date('01-16-2018');
    expect(chart.determineDomain(date1, date2)).toEqual([date1, date2]);
    expect(chart.determineDomain(date1, date1)).toEqual([date1BufferMin, date1BufferMax]);

    // Numbers with domainAlwaysBuffered.
    config.domainAlwaysBuffered = true;
    chart.setConfig(config);
    expect(chart.determineDomain(-100, 100)).toEqual([-101, 101]);

    // Date with domainAlwaysBuffered.
    const date2BufferMax = new Date('01-16-2019');
    expect(chart.determineDomain(date1, date2)).toEqual([date1BufferMin, date2BufferMax]);

    // Invalid mixin
    disableLogError(); // Silent console.error.
    expect(chart.determineDomain(date1, 100)).toEqual([]);
    enableLogError(); // Enable console.error.
  });

  it('useDataLabelAsDefaultForAxis', () => {
    // No test but should not throw an error.
    disableLogError(); // Silent console.error.
    chart.useDataLabelAsDefaultForAxis('xAxis');
    enableLogError(); // Enable console.error.

    // With config but whitout label: axisColumn is the label.
    chart.setConfig(config);
    chart.useDataLabelAsDefaultForAxis('xAxis');
    expect(config.xAxis.label).toEqual('obj');

    // With config and with label: axis label is always the label.
    config.xAxis.label = 'Object';
    chart.useDataLabelAsDefaultForAxis('xAxis');
    expect(config.xAxis.label).toEqual('Object');
  });

  it('truncText', () => {
    expect(chart.truncText('abc')).toEqual('abc');
    expect(chart.truncText('abc', 1)).toEqual('a …');
    expect(chart.truncText('1234 1234 1234 1234 1234 1234567')).toEqual(
      '1234 1234 1234 1234 1234 12345 …');
  });

  it('compareData', () => {
    const date1 = new Date('01-01-2018');
    const date1Like = new Date('01-01-2017');
    date1Like.setDate(date1Like.getDate() + 365);
    const date2 = new Date('01-01-2019');
    expect(chart.compareData(1, 1)).toBeTruthy();
    expect(chart.compareData(1, 2)).toBeFalsy();
    expect(chart.compareData('a', 'a')).toBeTruthy();
    expect(chart.compareData(1, 2)).toBeFalsy();
    expect(chart.compareData(1, 'a')).toBeFalsy();
    expect(chart.compareData(date1, date1)).toBeTruthy();
    expect(chart.compareData(date1, date1Like)).toBeTruthy();
    expect(chart.compareData(date1, date2)).toBeFalsy();
    expect(chart.compareData(date1, 1)).toBeFalsy();
    expect(chart.compareData(null, null)).toBeFalsy();
    expect(chart.compareData(undefined, undefined)).toBeFalsy();
    expect(chart.compareData(NaN, NaN)).toBeFalsy();
  });
});
