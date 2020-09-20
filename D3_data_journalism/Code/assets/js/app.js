//define Width, highth and margin
var svgWidth = 960;
var svgHeight = 500;


  var margin = {
    top: 160,
    right: 60,
    bottom: 200,
    left: 100,
    ymove:-200
  };

  //radius of plotted circles for each state
const stateRadius=20;

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var xList=['poverty','age','income'];
var yList=['obesity','smokes','healthcare'];

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Retrieve data from the CSV file and execute everything below  
  var dataset = d3.csv("assets/data/data.csv")
  dataset.then(function(healthData){
  // parse data
    healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    // console.log(data.age)
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

 // Create group for three x-axis and three y-axis labels
 var xLabelGroup = chartGroup.append("g")
 .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top/2})`);
 var yLabelGroup = chartGroup.append("g")
 .attr("transform", `translate(${-20-margin.left/2},${chartHeight/2+margin.top/2})`);


  //X-axis labels 
  var xAxisLabels=xList.forEach(function(d,i){
    xLabelGroup.append('g').append("text")
    .classed("inactive", true)
    .attr("value", `${d}`)
    .attr("id",`${d}`)
    .attr("transform", "rotate(0)")    
    .attr("y",100-i*20)       
    .style("text-anchor", "middle")
    .text(d);
})

  //Y-axis labels 
  var yAxisLabels=yList.forEach(function(d,i){
    yLabelGroup.append('g').append("text")
        .classed("inactive", true)
        .attr("value", `${d}`)
        .attr("transform", "rotate(-90)")
        .attr("y",20*i)
        .attr("x",44)
        .text(d);   
})

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";
d3.select(`#${chosenXAxis}`).classed("active",true).classed("inactive",false);
d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);

// xLinearScale and  YLinearScale function above csv import
var xLinearScale = xScale(healthData, chosenXAxis);
var yLinearScale = yScale(healthData, chosenYAxis);

  // Create y scale function
  var YLinearscale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.poverty)])
    .range([chartHeight, 0]);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // console.log(leftAxis);

  // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${chartHeight+100})`)
  .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
       .classed("y-axis", true)
       .attr("transform", `translate(0, ${margin.ymove})`)
       .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll(".scatter")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis])+margin.ymove)
    .attr("r", stateRadius)
    .attr("fill", "blue")
    .attr("opacity", "1")

    // updateToolTip function for the 1st time with default X- and Y-axis
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
 
    
  // appand abbreviation label for states
  var textsGroup = chartGroup.selectAll(".scatter")
  .data(healthData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis])+stateRadius/8+margin.ymove)
  .attr("text-anchor", "middle")
  .text(d => d.abbr)
  .classed("stateText", true)
  .attr("fill", "black")

  ;

    
  // x axis labels event listener
  xLabelGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var valueX = d3.select(this).attr("value");
      if (valueX !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = valueX;


        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(healthData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);


        // updates circles with new x values
        textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

//         // updates tooltips with new info
        // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

         //changes active class of Y-ids to change bold text
         xList.forEach(function(d,i){
          d3.select(`#${d}`).classed("active",false).classed("inactive",true);
          d3.select(`#${chosenXAxis}`).classed("active",true).classed("inactive",false);
      })
    }
  })

    
     // Y axis labels event listener
     yLabelGroup.selectAll("text")
     .on("click", function() {
    // get value of selection
    var valueY = d3.select(this).attr("value");
    if (valueY !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = valueY;


      // functions here found above csv import
      // updates Y scale for new data
      yLinearScale = yScale(healthData, chosenYAxis);

      // updates Y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(healthData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // updates texts with new Y values
      textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

//       // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       //changes active class of Y-ids to change bold text
       yList.forEach(function(d,i){
        d3.select(`#${d}`).classed("active",false).classed("inactive",true);
        d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);
    })

    }
  
  });
})

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, Axis) {
  var bottomAxis = d3.axisBottom(newXScale);
  Axis.transition()
    .duration(1000)
    .call(bottomAxis);
  return Axis;
}


// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, Axis) {
  var leftAxis = d3.axisLeft(newYScale);

  Axis.transition()
    .duration(1000)
    .call(leftAxis);

  return Axis;
}


// function used for updating x-scale var upon click on axis label
function xScale(healthData, xLabel) {
  // create scales
  var x = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[xLabel]) * 0.8,
      d3.max(healthData, d => d[xLabel]) * 1.2
    ])
    .range([0, svgWidth]);
// console.log(XLinearScale)
  return x;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, yLabel) {
  // create scales
  var y = d3.scaleLinear()
  .domain([0, d3.max(healthData, d => d[yLabel]) * 1.2
])
.range([svgHeight, 0]);
//console.log(YLinearScale)
  return y;
}

//function used for updating circles group with a transition to new circles
function renderCircles(hraData, circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup
      //.data(hraData)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis])+margin.ymove);
    return circlesGroup;
}

// function used for updating textgroups inside circles with a transition to new circles
function renderTexts(textsGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  textsGroup
    .transition()
    .ease(d3.easeLinear)
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-stateRadius/2)
    .attr("y", d => newYScale(d[chosenYAxis])+stateRadius/8+margin.ymove);
   return textsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
  var  Xlabel;
  var  Ylabel;

  if (chosenXAxis === "poverty") {
  Xlabel = "poverty";
  }
  else if (chosenXAxis ==="Age"){
  Xlabel = "Age";
  }
  else {
  Xlabel = "Income"
  }

  if (chosenYAxis === "healthcare") {
  Ylabel = "healthcare";
    }
    else if (chosenYAxis ==="Smokes"){
  Ylabel = "Smokes";
    }
    else {
  Ylabel = "Obese";
    }
  
  var toolTip = d3.tip()
    .attr("class", 'd3-tip')
    .offset([80, -60])
    .html(function(d){ 
      
      return (`${d.state}<br>${Xlabel} ${d[chosenXAxis]}<br> ${Ylabel} ${d[chosenYAxis]}`);

        });


  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
};