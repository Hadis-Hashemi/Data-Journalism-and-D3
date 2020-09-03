var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function XScale(healthData, chosenXAxis) {
  // create scales
  var XLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
// console.log(XLinearScale)
  return XLinearScale;

}


// function used for updating y-scale var upon click on axis label
function YScale(healthData, chosenYAxis) {
  // create scales
  var YLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);
//console.log(YLinearScale)
  return YLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, XAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  XAxis.transition()
    .duration(1000)
    .call(bottomAxis);
   console.log(XAxis);

  return XAxis;
}


// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, YAxis) {
  var leftAxis = d3.axisleft(newYScale);

  YAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return YAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// // function used for updating circles group with new tooltip
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
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
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
}

// Retrieve data from the CSV file and execute everything below
//(async function(){
  //var heathData = await 
  
  d3.csv("assets/data/data.csv").then(function(healthData){



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


// xLinearScale function above csv import
  var XLinearScale = XScale(healthData, chosenXAxis);


// YLinearScale function above csv import
var YLinearScale = YScale(healthData, chosenYAxis);

  // Create y scale function
  var YLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.poverty)])
    .range([height, 0]);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(XLinearScale);
  var leftAxis = d3.axisLeft(YLinearScale);

  // console.log(leftAxis);

  // append x axis
  var XAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => XLinearScale(d[chosenXAxis]))
    .attr("cy", d => YLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5")

    
    // appand abbreviation label for states
   chartGroup.selectAll("text")
  .data(healthData)
  .enter()
  .append("text")
  .attr("x", d => XLinearScale(d[chosenXAxis]))
  .attr("y", d => YLinearScale(d[chosenYAxis])+6)
  .attr("text-anchor", "middle")
  .text(d => d.abbr)
  .classed("stateText", true)
  ;


  // Create group for three x-axis and three y-axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var YlabelsGroup = chartGroup.append("g")
  //  .attr("transform", `translate(${width/2},${height -20})`);


  var povertyLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In poverty(%)");

  var ageLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  // append y axis
   var healthLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0- (height /2))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lack of Healthcare (%)");
  
    var SmokeLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+25)
    .attr("x", 0 - (height / 2))
    .attr("value", "Smokes") // value to grab for event listener
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");

    var ObeseLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obese(%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        XLinearScale = XScale(healthData, chosenXAxis);

        // updates x axis with transition
        XAxis = renderXAxes(XLinearScale, XAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, XLinearScale, YLinearScale, chosenYAxis);

//         // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "Age"){
        povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
        .classed("active", true)
        .classed("inactive", false);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);
        }
        else {
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });

     // Y axis labels event listener
  YlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      console.log(chosenYAxis)

      // functions here found above csv import
      // updates Y scale for new data
      YLinearScale = YScale(healthData, chosenYAxis);

      // updates Y axis with transition
      YAxis = renderYAxes(YLinearScale, YAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, XLinearScale, YLinearScale, chosenYAxis);

//       // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthLabel
         .classed("active", true)
          .classed("inactive", false);
          SmokeLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
        .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "Smokes"){
        healthLabel
      .classed("active", false)
      .classed("inactive", true);
      SmokeLabel
      .classed("active", true)
      .classed("inactive", false);
      ObeseLabel
      .classed("active", false)
      .classed("inactive", true);
      }
      else {
        healthLabel
        .classed("active", false)
        .classed("inactive", true);
        SmokeLabel
        .classed("active", false)
        .classed("inactive", true);
        ObeseLabel
        .classed("active", true)
        .classed("inactive", false);
      }
    }
  
  });
})

  