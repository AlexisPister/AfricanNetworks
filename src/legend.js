const legend = d3.select("#legend")
let nodeTypesNames = Object.values(nodeTypes);

const marginTop = 10
const marginRight = 10

legend.selectAll(".dot")
    .data(nodeTypesNames)
    .join("path")
    // .attr("d", s)
    .attr("d", d => {
        if (d == nodeTypes.person) {
            return d3.symbol().type(d3.symbolCircle).size(180)(d);
        } else if (d == nodeTypes.institution) {
            return d3.symbol().type(d3.symbolSquare).size(180)(d);
        } else if (d == nodeTypes.publication) {
            return d3.symbol().type(d3.symbolDiamond).size(180)(d);
        } else if (d == nodeTypes.event) {
            return d3.symbol().type(d3.symbolTriangle).size(180)(d);
        }
    })
    .attr("transform", (d, i) => `translate(${marginRight}, ${marginTop + i * 25})`)
    // .attr("cx", 100)
    // .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    // .attr("r", 7)
    .style("fill", function (d) {
        return colorScale(d)
    })
    .classed("dot", true)

// Add one dot in the legend for each name.
legend.selectAll(".llabel")
    .data(nodeTypesNames)
    .join("text")
    .attr("x", marginRight + 20)
    .attr("y", function (d, i) {
        return marginTop + i * 25
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
        return colorScale(d)
    })
    .text(function (d) {
        return d
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .classed("llabel", true)