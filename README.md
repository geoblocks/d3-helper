# d3-helper

Helper functions to create charts based on [d3](https://github.com/d3/d3).

This library provides some classes and functions for common operations with the d3 library.
It let you able to manage your charts as you want.

## Use the code in a project.

Simply use it through [npm @geoblocks/d3-helper](https://www.npmjs.com/package/@geoblocks/d3-helper).
See the examples for more informations on how to set the basics of your charts.

### Overview

#### BaseD3ChartSVG

Class that provides functions to draw, clean and manage a SVG with a chart inside.

#### CartesianChart

Extends BaseD3ChartSVG.
Class that provides functions to manage cartesian charts (for bars, scatterplots, lines...)
Mainly manage the axes of cartesian charts.
Supported axes data types are: Date, number and text.

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

## Build the doc

`npm run doc`

Api doc is now accessible in folder `apidoc`

## Publish a new version to npm
```
npm version [<newversion> | major | minor | patch
npm run build && npm publish && git push --tags origin master
```

## Upcoming (probably):

* Tooltips helpers for data.
