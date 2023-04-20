const legend = d3.select("#legend")
let nodeTypesNames = Object.values(nodeTypes);

const marginTop = 10
const marginRight = 10

const legendPadding = 130;


// 2x2 LEGEND
legend.selectAll(".llabel")
    .data(nodeTypesNames)
    .join("text")
    .attr("x", (d, i) => {
        if (i > 1) {
            return marginRight + legendPadding + 20
        }
        return marginRight + 20
    })
    .attr("y", function (d, i) {
        if (i > 1) {
            i = i - 2
        }
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
    .attr("transform", (d, i) => {
        let x = marginRight;
        if (i > 1) {
            i = i - 2
            x += legendPadding
        }
        return `translate(${x}, ${marginTop + i * 25})`
    })
    .style("fill", function (d) {
        return colorScale(d)
    })
    .classed("dot", true)





// VERTICAL LEGEND
// legend.selectAll(".dot")
//     .data(nodeTypesNames)
//     .join("path")
//     // .attr("d", s)
//     .attr("d", d => {
//         if (d == nodeTypes.person) {
//             return d3.symbol().type(d3.symbolCircle).size(180)(d);
//         } else if (d == nodeTypes.institution) {
//             return d3.symbol().type(d3.symbolSquare).size(180)(d);
//         } else if (d == nodeTypes.publication) {
//             return d3.symbol().type(d3.symbolDiamond).size(180)(d);
//         } else if (d == nodeTypes.event) {
//             return d3.symbol().type(d3.symbolTriangle).size(180)(d);
//         }
//     })
//     .attr("transform", (d, i) => `translate(${marginRight}, ${marginTop + i * 25})`)
//     // .attr("cx", 100)
//     // .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
//     // .attr("r", 7)
//     .style("fill", function (d) {
//         return colorScale(d)
//     })
//     .classed("dot", true)
//
//
// legend.selectAll(".llabel")
//     .data(nodeTypesNames)
//     .join("text")
//     .attr("x", marginRight + 20)
//     .attr("y", function (d, i) {
//         return marginTop + i * 25
//     }) // 100 is where the first dot appears. 25 is the distance between dots
//     .style("fill", function (d) {
//         return colorScale(d)
//     })
//     .text(function (d) {
//         return d
//     })
//     .attr("text-anchor", "left")
//     .style("alignment-baseline", "middle")
//     .classed("llabel", true)


// Horizontal legend
// legend.selectAll(".llabel")
//     .data(nodeTypesNames)
//     .join("text")
//     .attr("x", function (d, i) {
//         return marginRight + 20 + i * 100
//     })
//     .attr("y", function (d, i) {
//         return marginTop
//     }) // 100 is where the first dot appears. 25 is the distance between dots
//     .style("fill", function (d) {
//         return colorScale(d)
//     })
//     .text(function (d) {
//         return d
//     })
//     .attr("text-anchor", "left")
//     .style("alignment-baseline", "middle")
//     .classed("llabel", true)
