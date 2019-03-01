(function (d3) {
  'use strict'; // to prevent me from using undeclared variables


  // Create a drop down menu
  const dropdownMenu = (selection, props) => {
    const {
      options,
      onOptionClicked,
      selectedOption
    } = props;
    
    //reassign select with let select - which means that select will always have one element all the time
    let select = selection.selectAll('select').data([null]);
    select = select.enter().append('select')
      .merge(select)
        .on('change', function() {
          onOptionClicked(this.value);
        });
    
    const option = select.selectAll('option').data(options);
    option.enter().append('option')
      .merge(option)
        .attr('value', d => d)
        .property('selected', d => d === selectedOption) // This to insure that our starting point within the dop menu matches xColumns and yColumns
        .text(d => d);
  };

  const scatterPlot = (selection, props) => {
    const {
      xValue,
      xAxisLabel,
      yValue,
      circleRadius,
      yAxisLabel,
      margin,
      width,
      height,
      data
    } = props;
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth])
      .nice();
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice();
    
    const g = selection.selectAll('.container').data([null]);
    const gEnter = g
      .enter().append('g')
        .attr('class', 'container');
    gEnter
      .merge(g)
        .attr('transform',
          `translate(${margin.left},${margin.top})`
        );
    
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(15);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(10);
    
    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
      .append('g')
        .attr('class', 'y-axis');
    yAxisG
      .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();
    
    const yAxisLabelText = yAxisGEnter
      .append('text')
        .attr('class', 'axis-label')
        .attr('y', -93)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
      .merge(yAxisG.select('.axis-label'))
        .attr('x', -innerHeight / 2)
        .text(yAxisLabel);
    
    
    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
      .append('g')
        .attr('class', 'x-axis');
    xAxisG
      .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();
    
    const xAxisLabelText = xAxisGEnter
      .append('text')
        .attr('class', 'axis-label')
        .attr('y', 75)
        .attr('fill', 'black')
      .merge(xAxisG.select('.axis-label'))
        .attr('x', innerWidth / 2)  // divided by 2 so circles don't over laps
        .text(xAxisLabel);

    
    const circles = g.merge(gEnter)
      .selectAll('circle').data(data);
    circles
      .enter().append('circle')
        .attr('cx', innerWidth / 2)  // this is to force data to load from the middle of the xaxis rather then from point (0,0)
        .attr('cy', innerHeight / 2) // this is to force data to load from the middle of the yaxis rather then from point (0,0)
        .attr('r', 0) // this is to force data to load from the middle the graph
      .merge(circles)
      .transition().duration(2000) // slow how the circles showing on the graph of 2 seconds
      .delay((d, i) => i * 10) 
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', circleRadius);
  };

  const svg = d3.select('svg');

  const width = +svg.attr('width');
  const height = +svg.attr('height');

  let data;
  let xColumn;
  let yColumn;

  const onXColumnClicked = column => {
    xColumn = column;
    render();
  };

  const onYColumnClicked = column => {
    yColumn = column;
    render();
  };

  const render = () => {
    
    d3.select('#x-menu') // render data for the drop down for the x menu to match the div within the HTML
      .call(dropdownMenu, {
        options: data.columns,
        onOptionClicked: onXColumnClicked,
        selectedOption: xColumn
      });
    
    d3.select('#y-menu') // render data for the drop down for the x menu to match the div within the HTML
      .call(dropdownMenu, {
        options: data.columns,
        onOptionClicked: onYColumnClicked,
        selectedOption: yColumn
      });
    
    svg.call(scatterPlot, {
      xValue: d => d[xColumn], 
      xAxisLabel: xColumn, // update label for the x axis automatically based on our data
      yValue: d => d[yColumn], 
      circleRadius: 10,
      yAxisLabel: yColumn, // update label for the y axis automatically based on our data
      margin: { top: 10, right: 40, bottom: 88, left: 150 },
      width,
      height,
      data
    });
  };

  d3.csv('data/data.csv')
    .then(loadedData => {
      data = loadedData;
      data.forEach(d => {
        d.Poverty = +d.Poverty;
        d.Age = +d.Age;
        d.Income = +d.Income;
        d.Obesity = +d.Obesity;  
        d.Smokes = +d.Smokes; 
        d.Lack_of_Healthcare = +d.Lack_of_Healthcare;
      });
      xColumn = data.columns[1]; // set starting point for our drop down menu to start at index 3 for xColumns
      yColumn = data.columns[3]; // set starting point for our drop down menu to start at index 7 for 7Columns
      render();
    });

}(d3));