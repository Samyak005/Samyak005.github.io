async function renderFirstChart() {

    const margin = {top: 10, right: 20, bottom: 30, left: 50},
    
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
    
    const data = await d3.csv("../data/CovidSample.csv");
    
    let filteredData = data.filter(function (d) {
        return d.total_cases_per_million_pop != "" && d.deaths_per_million_pop > 2000 && d.population != "";
    });

    const entities = ["greater than 2000", "less than 2000"];

    d3.select("#select-country")
        .selectAll('country-options')
        .data(entities)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) 
        .attr("value", function (d) {
            return d;
        }) 

    let svg = d3.select("#chart-1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
        .domain([0, 800000])
        .range([0, width]);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d => d));

    let y = d3.scaleLinear()
        .domain([2000, 7000])
        .range([height, 0]);

    svg.append("g")
        .attr("class", "y_axis")
        .call(d3.axisLeft(y).tickFormat(d => d));

    const z = getBubbleSizeScale()

    const myColor = d3.scaleOrdinal()
        .domain(getContinents())
        .range(d3.schemeSet2);

    const tooltip = d3.select("#slide-1")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {
            return x(Number(d.total_cases_per_million_pop));
        })
        .attr("cy", function (d) {
            return y(Number(d.deaths_per_million_pop));
        })
        .attr("id", function (d) {
            return "bubble-" + d.country;
        })
        .attr("r", function (d) {
            return z(Number(d.population));
        })
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(firstChartTooltipHTML(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        });

    renderLegend(svg, getContinents(), width, myColor);

    const annotation_greater_than_2000 = ["Peru", "Austria", "USA"]
    const annotation_lesser_than_2000 = ["S. Korea", "Singapore", "UAE"]

    annotationCall(annotation_greater_than_2000)
    
    function annotationCall(countryList) {
        countryList.forEach(function (country) {
            for (let i = 0; i < filteredData.length; i++) {
                if (filteredData[i].country === country) {
                    const countryData = filteredData[i];
                    renderFirstChartAnnotations(countryData, x(Number(countryData.total_cases_per_million_pop)), y(Number(countryData.deaths_per_million_pop)), margin);
                }
            }
        })
    }

    function update(selectedGroup) {
    
        svg.selectAll(".bubbles").remove();
        svg.select(".y_axis").remove();
        d3.select("svg").selectAll(".annotation-group").remove();

        if(selectedGroup=="greater than 2000")
        {
            filteredData = data.filter(function (d) {
                return d.deaths_per_million_pop >= 2000;
            });

            y = d3.scaleLinear()
                .domain([2000, 7000])
                .range([height, 0]);

            annotationCall(annotation_greater_than_2000)
        }
        else{
            filteredData = data.filter(function (d) {
                return d.deaths_per_million_pop < 2000;
            });

            y = d3.scaleLinear()
                .domain([0, 2000])
                .range([height, 0]);

            annotationCall(annotation_lesser_than_2000)
        }
        
        svg.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(y).tickFormat(d => d));

        svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {
            return x(Number(d.total_cases_per_million_pop));
        })
        .attr("cy", function (d) {
            return y(Number(d.deaths_per_million_pop));
        })
        .attr("id", function (d) {
            return "bubble-" + d.country;
        })
        .attr("r", function (d) {
            return z(Number(d.population));
        })
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(firstChartTooltipHTML(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        });
            
    }
    
    d3.select("#select-country").on("change", function (d) {
        const selectedOption = d3.select(this).property("value")
        update(selectedOption)
    
    })
}

function renderFirstChartAnnotations(d, x, y, margin) {
    const computedDX = 30;
    const computedDY = -30;
    const annotations = [
        {
            note: {
                label: Math.round(d.total_cases_per_million_pop) + " cases/million, " + Math.round(d.deaths_per_million_pop) + " deaths/million",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: d.country,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCallout,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}

function firstChartTooltipHTML(object) {
    return "<div>" + object.country + "</div><div>" + Math.round(object.total_cases_per_million_pop) + " cases/million</div><div>" + Math.round(object.deaths_per_million_pop) + " deaths/million</div>";
}