# d3-helper

Helper functions to create charts based on [d3](https://github.com/d3/d3).

This library provides some classes and function for common operations with the d3 library.
It let you able to manage your chart as you want.

## Use the code in a project.

Simple use it through [npm @geoblocks/d3-helper](https://www.npmjs.com/package/@geoblocks/d3-helper).
See the examples for more informations on how to set the basics of your chart.

### Overview

#### BaseD3ChartSVG

Class that provides functions to draw, clean and manage a SVG with a chart inside.

#### CartesianChart

Extends BaseD3ChartSVG.
Class that provides functions to manage cartesian charts (bars, scatterplots, lines...)
Especially manage the axis of cartesian charts.

### Supported browsers

The code was only tested on moderns browsers. The source is only transpiled to modern `es`.
If your browser doesn't support the code, PR are welcome (updating your browser too).

## Run the examples

```
git clone git@github.com:geoblocks/d3-helper.git
npm install
npm run build
npm run start
```

Examples are now accessible at http://localhost:8080/

## Publish a new version to npm
```
npm version patch
npm publish
git push --tags origin master
```

## Upcoming (probably):

* More examples.
* Tooltips helpers for data.
* Tests.
