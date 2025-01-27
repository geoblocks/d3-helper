import { CartesianChart, CartesianChartConfig, AxisType } from './cartesian-chart';

describe('CartesianChart class functions', () => {
  let chart;
  let config;
  const dataset = [
    { elevation: null, obj: 'rock in the sea', date: null },
    { elevation: 20.5, obj: null, date: new Date('01-31-2019') },
    { elevation: 100, obj: 'tree', date: new Date('03-01-2015') },
    { elevation: -12, obj: 'house', date: new Date('01-01-2018') },
  ];

  let logErrorFn;
  const disableLogError = () => {
    logErrorFn = console.error;
    console.error = () => {
      return;
    };
  };
  const enableLogError = () => {
    console.error = logErrorFn;
  };

  beforeEach(() => {
    // Creare an element to draw the chart.
    document.body.innerHTML = '<div class="my-chart"></div>';
    // Cheat a little bit to have a size for the component.
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 400,
    });
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
    expect(chart.fontSizeForAxis).toEqual('1rem');
    expect(chart.fontSizeForTitle).toEqual('1.1rem');

    // More specific config
    Object.assign(config, {
      chartPath: 'div.cartesian',
      margins: { bottom: 0 },
      color: [0, 0, 255],
      fontSizeForAxis: '0.8em',
      fontSizeForTitle: '0.9em',
    });
    config.xAxis.hideAxis = true;
    config.yAxis.hideAxis = true;
    chart.setConfig(config);
    expect(chart.getD3Selector()).toEqual('div.cartesian .my-chart');
    expect(chart.margins).toEqual({ top: 5, right: 5, bottom: 0, left: 5 });
    expect(chart.color).toEqual([0, 0, 255]);
    expect(chart.fontSizeForAxis).toEqual('0.8em');
    expect(chart.fontSizeForTitle).toEqual('0.9em');

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
    expect(chart.dataset).toBeUndefined();

    // Clean
    chart.cleanCartesian();
    expect(chart.svg).toBeNull();
    expect(chart.dataset).toBeNull();
    expect(chart.xScale).toBeNull();
    expect(chart.yScale).toBeNull();
    expect(chart.oppositeYScale).toBeNull();
  });

  it('removeUpdateDrawSVG', () => {
    // Base state
    expect(chart.dataset).toBeUndefined();
    expect(chart.svg).toBeUndefined();
    expect(chart.width).toEqual(250);

    // RemoveUpdateDrawSVG
    chart.removeUpdateDrawSVG();
    expect(chart.dataset).toBeNull();
    expect(chart.svg).toBeTruthy();
    expect(chart.width).toEqual(400);
  });

  it('getXColumnName', () => {
    expect(chart.getXColumnName()).toBeUndefined();
    chart.setConfig(config);
    expect(chart.getXColumnName()).toEqual('obj');
  });

  it('getYColumnName', () => {
    expect(chart.getYColumnName()).toBeUndefined();
    chart.setConfig(config);
    expect(chart.getYColumnName()).toEqual('elevation');
  });

  it('getOppositeYColumnName', () => {
    expect(chart.getOppositeYColumnName()).toBeUndefined();
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    expect(chart.getOppositeYColumnName()).toEqual('date');
  });

  it('getXScaleValue', () => {
    chart.setConfig(config);
    chart.removeUpdateDrawSVG();
    chart.dataset = dataset;
    chart.setXAxis();
    expect(chart.getXScaleValue(dataset[0])).toBeGreaterThan(0);
    expect(chart.getXScaleValue(dataset[1])).toBeGreaterThan(0);
  });

  it('getYScaleValue', () => {
    chart.setConfig(config);
    chart.removeUpdateDrawSVG();
    chart.dataset = dataset;
    chart.setYAxis();
    expect(chart.getYScaleValue(dataset[0])).toBeUndefined();
    expect(chart.getYScaleValue(dataset[1])).toBeGreaterThan(0);
  });

  it('getOppositeYScaleValue', () => {
    // Set axis and get value again.
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    chart.removeUpdateDrawSVG();
    chart.dataset = dataset;
    chart.setOppositeYAxis();
    expect(chart.getOppositeYScaleValue(dataset[0])).toBeUndefined();
    expect(chart.getOppositeYScaleValue(dataset[1])).toBeGreaterThan(0);
  });

  it('getCheckedAxisColumnName', () => {
    expect(chart.getCheckedAxisColumnName(null, dataset)).toBeNull();
    expect(chart.getCheckedAxisColumnName(config.xAxis, [])).toBeNull();
    expect(chart.getCheckedAxisColumnName(config.xAxis, dataset)).toEqual('obj');
    expect(chart.getCheckedAxisColumnName(config.yAxis, dataset)).toEqual('elevation');
    expect(chart.getCheckedAxisColumnName(config.oppositeYAxis, dataset)).toBeNull();
  });

  it('getDataType', () => {
    disableLogError(); // Silent console.error.
    expect(chart.getDataType(dataset, '')).toEqual(AxisType.TEXT);
    enableLogError(); // Enable console.error.
    expect(chart.getDataType(dataset, 'obj')).toEqual(AxisType.TEXT);
    expect(chart.getDataType(dataset, 'elevation')).toEqual(AxisType.NUMBER);
    expect(chart.getDataType(dataset, 'date')).toEqual(AxisType.DATE);
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
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.setXAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.xaxis')).toBeNull();

    // No config nor dataset, no axis.
    disableLogError(); // Silent console.error.
    chart.setXAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Config but no dataset, no axis.
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.setXAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Set dataset, draw axis.
    chart.dataset = dataset;
    chart.setXAxis();
    expect(chart.xScale).toBeTruthy();
    expect(document.querySelectorAll('.xaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.xAxis.hideAxis = true;
    chart.setXAxis();
    expect(chart.xScale).toBeTruthy();
    expect(document.querySelector('.xaxis')).toBeNull();

    // Set config with not existent column, no axis.
    config.xAxis.hideAxis = false;
    config.xAxis.axisColumn = 'foo';
    chart.setXAxis();
    expect(document.querySelector('.xaxis')).toBeNull();
  });

  it('setYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.setYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.yaxis')).toBeNull();

    // No config nor dataset, no axis.
    disableLogError(); // Silent console.error.
    chart.setYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Config but no dataset, no axis.
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.setYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Set dataset, draw axis.
    chart.dataset = dataset;
    chart.setYAxis();
    expect(chart.yScale).toBeTruthy();
    expect(document.querySelectorAll('.yaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.yAxis.hideAxis = true;
    chart.setYAxis();
    expect(chart.yScale).toBeTruthy();
    expect(document.querySelector('.yaxis')).toBeNull();

    // Set config with not existent column, no axis.
    config.yAxis.hideAxis = false;
    config.yAxis.axisColumn = 'foo';
    chart.setYAxis();
    expect(document.querySelector('.yaxis')).toBeNull();
  });

  it('setOppositeYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.setOppositeYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No config nor dataset, no axis.
    disableLogError(); // Silent console.error.
    chart.setOppositeYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Config but no dataset, no axis.
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.setOppositeYAxis();
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Set dataset, draw axis.
    chart.dataset = dataset;
    chart.setOppositeYAxis();
    expect(chart.oppositeYScale).toBeTruthy();
    expect(document.querySelectorAll('.opposite-yaxis').length).toEqual(1);

    // Set config with hidden column, no axis element but axis is set.
    config.oppositeYAxis.hideAxis = true;
    chart.setOppositeYAxis();
    expect(chart.oppositeYScale).toBeTruthy();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Set config with not existent column, no axis.
    config.oppositeYAxis.hideAxis = false;
    config.oppositeYAxis.axisColumn = 'foo';
    chart.setOppositeYAxis();
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
    chart.drawXAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.xaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawXAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // No scale, no axis
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawXAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.xaxis')).toBeNull();

    // Draw axis (twice, must result only one xaxis).
    chart.xScale = chart.getScale(
      dataset,
      chart.getXColumnName(),
      AxisType.TEXT,
      [0, 100],
    );
    chart.drawXAxis(chart.color, dataset);
    chart.drawXAxis(chart.color, dataset);
    expect(document.querySelectorAll('.xaxis').length).toEqual(1);
  });

  it('drawYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // No scale, no axis
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.yaxis')).toBeNull();

    // Draw axis (twice, must result only one yaxis).
    chart.yScale = chart.getScale(
      dataset,
      chart.getYColumnName(),
      AxisType.NUMBER,
      [0, 100],
    );
    chart.drawYAxis(chart.color, dataset);
    chart.drawYAxis(chart.color, dataset);
    expect(document.querySelectorAll('.yaxis').length).toEqual(1);
  });

  it('drawOppositeYAxis', () => {
    // No svg, no draw.
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw svg, not axis: no axis yet.
    chart.removeUpdateDrawSVG();
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No config, no axis
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // No scale, no axis
    config.oppositeYAxis = { axisColumn: 'date' };
    chart.setConfig(config);
    disableLogError(); // Silent console.error.
    chart.drawOppositeYAxis(chart.color, dataset);
    enableLogError(); // Enable console.error.
    expect(document.querySelector('.opposite-yaxis')).toBeNull();

    // Draw axis (twice, must result only one oppositeYaxis).
    chart.oppositeYScale = chart.getScale(
      dataset,
      chart.getOppositeYColumnName(),
      AxisType.DATE,
      [0, 100],
    );
    chart.drawOppositeYAxis(chart.color, dataset);
    chart.drawOppositeYAxis(chart.color, dataset);
    expect(document.querySelectorAll('.opposite-yaxis').length).toEqual(1);
  });

  it('wrapAxisLabels', () => {
    // Draw axis using d3 to ensure d3 select will work as expected
    chart.setConfig(config);
    chart.removeUpdateDrawSVG();
    chart.dataset = dataset;
    chart.setXAxis();
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
      '1234 1234 1234 1234 1234 12345 …',
    );
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
