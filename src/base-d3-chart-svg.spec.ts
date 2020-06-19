import { BaseD3ChartSVG } from './base-d3-chart-svg';

describe('BaseD3ChartSvg calss functions', () => {

  let chart;

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
    // Create a chart Object.
    chart = new BaseD3ChartSVG('.my-chart');
  });

  it('should be created', () => {
    expect(chart).toBeTruthy();
  });

  it('getD3Selector', () => {
    expect(chart.getD3Selector()).toEqual('.my-chart');
  });

  it('updateD3Selector', () => {
    chart.updateD3Selector('.foo');
    expect(chart.getD3Selector()).toEqual('.foo .my-chart');
  });

  it('updateD3Selector', () => {
    chart.updateD3Selector('.foo');
    expect(chart.getD3Selector()).toEqual('.foo .my-chart');
  });

  it('setMargins', () => {
    expect(chart.margins).toEqual({ top: 60, right: 80, bottom: 60, left: 80 });
    delete chart.margins.bottom;
    chart.setMargins({ top: 100, bottom: 100 });
    expect(chart.margins).toEqual({
      top: 100, right: 80, bottom: 100, left: 80 });
  });

  it('getDrawableSize', () => {
    expect(chart.getDrawableSize()).toEqual([90, 130]);
  });

  it('updateSize', () => {
    chart.updateSize();
    expect(chart.height).toEqual(300);
    expect(chart.width).toEqual(400);
  });

  it('drawSVG', () => {
    chart.drawSVG();
    expect(chart.svg).toBeTruthy();
    expect(chart.svg.node().getAttribute('viewBox')).toEqual('0 0 250 250');
    expect(chart.chart).toBeTruthy();
    expect(chart.chart.node().getAttribute('transform')).toEqual('translate(80, 60)');
  });

  it('removeSVG', () => {
    expect(chart.svg).toBeUndefined();
    expect(chart.chart).toBeUndefined();
    chart.removeSVG(); // Don't fail if there is no chart
    expect(chart.svg).toBeNull();
    expect(chart.chart).toBeNull();
    chart.drawSVG();
    expect(chart.svg).toBeTruthy();
    expect(chart.chart).toBeTruthy();
    chart.removeSVG();
    expect(chart.svg).toBeNull();
    expect(chart.chart).toBeNull();
  });

  it('assertChartExists', () => {
    disableLogError(); // Silent console.error.
    expect(chart.assertChartExists()).toBeFalsy();
    enableLogError(); // Enable console.error.

    chart.drawSVG();
    expect(chart.assertChartExists()).toBeTruthy();

    chart.removeSVG();
    disableLogError(); // Silent console.error.
    expect(chart.assertChartExists()).toBeFalsy();
    enableLogError(); // Enable console.error.
  });
});
