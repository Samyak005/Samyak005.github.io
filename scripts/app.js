function getBubbleSizeScale() {
    const z = d3.scaleLog()
        .domain([700, 1450000000])
        .range([1, 30]);
    return z;
}

function renderLegend(svg, continentKeys, width, myColor) {
    svg.selectAll("legend-dots")
        .data(continentKeys)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", function (d, i) {
            return 50 + i * 25
        })
        .attr("r", 2)
        .style("fill", function (d) {
            return myColor(d)
        })

    svg.selectAll("legend-labels")
        .data(continentKeys)
        .enter()
        .append("text")
        .attr("x", width + 8 - 100)
        .attr("y", function (d, i) {
            return 50 + i * 25
        }) 
        .style("fill", function (d) {
            return myColor(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

function getContinents() {
    return ["Asia", "Europe", "North America", "South America", "Africa", "Oceania", "Europe/Asia"];
}