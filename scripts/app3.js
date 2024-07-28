async function renderThirdChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    const file1 = await d3.csv("../data/CovidSample.csv");
    const file2 = await d3.csv("../data/gdp_by_country.csv");

    const threshold = 10000;

    const data = file1.map(d1 => {
        let match = file2.find(d2 => d2.country === d1.country);
        return match ? { ...d1, ...match } : null;
    }).filter(d => d !== null);

    let filteredData = data.filter(function (d) {
        return d.gdp_per_capita >= threshold;
    });

    console.log(filteredData);

    const entities = ["greater than 10000", "less than 10000"];

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

    let svg = d3.select("#chart-3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleLinear()
        .domain([threshold, 130000])
        .range([0, width]);

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d => "$" + d));

    const y = d3.scaleLinear()
        .domain([0, 7000])
        .range([height, 0]);
    
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d));
    
    const z = getBubbleSizeScale();

    const myColor = d3.scaleOrdinal()
        .domain(getContinents())
        .range(d3.schemeSet2);

    const tooltip = d3.select("#chart-3")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    svg.append('g')
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("id", function (d) {
            return "bubble-" + d.country;
        })
        .attr("cx", function (d) {
            return x(Number(d.gdp_per_capita));
        })
        .attr("cy", function (d) {
            return y(Number(d.deaths_per_million_pop));
        })
        .attr("r", function (d) {
            return z(Number(d.population));
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(thirdChartTooltipHTML(d));
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
    
    const annotation_greater_than_threshold = ["UK", "Singapore", "USA"]
    const annotation_lesser_than_threshold = ["Brazil", "Georgia", "Moldova"]
    annotationCall(annotation_greater_than_threshold)
    
    function annotationCall(countryList) {
        countryList.forEach(function (country) {
            for (let i = 0; i < filteredData.length; i++) {
                if (filteredData[i].country === country) {
                    const countryData = filteredData[i];
                    renderThirdChartAnnotations(countryData, x(Number(countryData.gdp_per_capita)), y(Number(countryData.deaths_per_million_pop)), margin);
                }
            }
        })
    }

    function update(selectedGroup) {
    
        svg.selectAll(".bubbles").remove();
        svg.select(".x_axis").remove();
        d3.select("svg").selectAll(".annotation-group").remove();

        if(selectedGroup=="greater than 10000")
        {
            filteredData = data.filter(function (d) {
                return d.gdp_per_capita >= threshold;
            });

            x = d3.scaleLinear()
                .domain([threshold, 130000])
                .range([0, width]);

            annotationCall(annotation_greater_than_threshold)
        }
        else{
            filteredData = data.filter(function (d) {
                return d.gdp_per_capita < threshold;
            });

            x = d3.scaleLinear()
                .domain([200, threshold])
                .range([0, width]);

            annotationCall(annotation_lesser_than_threshold)
        }
        
        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d => "$" + d));

        svg.append('g')
            .selectAll("dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "bubbles")
            .attr("id", function (d) {
                return "bubble-" + d.country;
            })
            .attr("cx", function (d) {
                return x(Number(d.gdp_per_capita));
            })
            .attr("cy", function (d) {
                return y(Number(d.deaths_per_million_pop));
            })
            .attr("r", function (d) {
                return z(Number(d.population));
            })
            .style("fill", function (d) {
                return myColor(d.continent);
            })
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(thirdChartTooltipHTML(d));
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

function thirdChartTooltipHTML(object) {
    return "<div>" + object.country + "</div><div>" + Math.round(object.deaths_per_million_pop) + " deaths/million</div><div>$" + Math.round(object.gdp_per_capita) + "</div>";
}

function renderThirdChartAnnotations(d, x, y, margin) {
    const computedDX = 30;
    const computedDY = -30;
    const annotations = [
        {
            note: {
                label: "$" + Math.round(d.gdp_per_capita) + ", " + Math.round(d.deaths_per_million_pop) + " deaths/million",
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
