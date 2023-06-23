import {updateNodelinkSelection, completeNetwork, renderTemplates} from "./main.js";
import {render as renderMap} from "./map.js";

// console.log(1, completeNetwork)
// setTimeout(() => {
//     console.log(111, completeNetwork)
// }, 100)

let [width, height] = computeSvgParentDims("timeline")
const margin = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 40
}

// file global variables
let svg;
let persons;
let events;
let entities;
let publications;
let institutions;
let x;
let y;
let yearMin = 1000;
let yearMax = 2200;

svg = d3.select("#timeline")
        .append("g")
let gAxis = svg
    .append("g")

onresize = (event) => {
    processAndrender();
};

function parseEventDate(date) {
    return +date.slice(-4)
}

export function parseYear(timeValue) {
    let year

    timeValue = timeValue.toString();
    if (timeValue[timeValue.length - 1] == "s") {
        year = timeValue.slice(-5, -1)
    } else if (timeValue[timeValue.length - 1] == "0" && timeValue[timeValue.length - 2] == ".") {
        year = timeValue.slice(0, -2)
    } else {
        year = timeValue.slice(-4)
    }

    if (year == "" || isNaN(year) || year.length != 4) {
        return null
    }

    year = +year;
    return year;
}

async function importData() {
    persons = await d3.csv(`./data/${FOLDER}/People.csv`, d => {
        d["Date of birth"] = +d["Date of birth"];
        d["Date of death"] = +d["Date of death"];
        return d
    })

    events = await d3.csv(`./data/${FOLDER}/Events.csv`, d => {
        d["Date"] = parseEventDate(d["Date"])
        return d
    })

    publications = await d3.csv(`./data/${FOLDER}/Publications.csv`, d => {
        d["Date of closing"] = parseYear(d["Date of closing"])
        d["Date of Creation"] = parseYear(d["Date of Creation"])
        return d
    })

    institutions = await d3.csv(`./data/${FOLDER}/Institutions.csv`, d => {
        d["Date of closing"] = parseYear(d["Date of closing"])
        d["Date of Creation"] = parseYear(d["Date of Creation"])
        return d
    })

    return [persons];
}

setTimeout(() => {
    // [width, height] = computeSvgParentDims("timeline");
    importData()
        .then(() => {
            processAndrender();
        })
}, 100)

function processAndrender() {
    [width, height] = computeSvgParentDims("timeline");
    entities = persons.concat(institutions).concat(publications);

    // Filter and sort
    entities = entities.filter(d => getBeginYear(d))
    entities.sort((a, b) => getBeginYear(a) - getBeginYear(b))

    // Remove nodes without any links
    entities = entities.filter(d => completeNetwork.nodes.map(n => n.id).includes(d.Name))

    x = d3.scaleLinear()
        .domain([d3.min(entities, d => getBeginYear(d)), d3.max(entities, d => getEndYear(d))])
        .range([margin.left, width - margin.left - margin.right])
    y = d3.scaleBand()
        .domain(d3.range(entities.length))
        .range([margin.top, height - margin.bottom - margin.top])
        .padding(0.2)

    // TODO: check date format
    let axisBottom = d3.axisBottom(x)
        // let axisBottom = d3.axisBottom(x.nice())
        .ticks(5)
    //     .tickValues([2022])
    //     .tickPadding(2)
    // .tickFormat(d3.timeFormat("%y"))

    // svg = d3.select("#timeline")
    //     .append("g")

    // svg
        // .append("g")
        gAxis
        .call(axisBottom)

    render();
    renderMap();
}

function getBeginYear(d) {
    if (d["Date of birth"]) {
        return d["Date of birth"]
    } else if (d["Date of Creation"]) {
        return d["Date of Creation"]
    } else {
        return null
    }
}

function getEndYear(d) {
    if (d["Date of death"]) {
        return d["Date of death"]
    } else if (d["Date of closing"]) {
        return d["Date of closing"]
    } else {
        return null
    }
}

function render() {
    let entitiesSel = svg
        .selectAll('.entity')
        .data(entities, d => d)
        .join((enter) => {
            let g = enter.append("g")
                .classed("entity", true)

            g.append("rect")
                .attr("x", d => {
                    return x(getBeginYear(d))
                })
                .attr("y", (d, i) => y(i))
                .attr("width", timeLineWidth)
                .attr("height", d => y.bandwidth())
                .attr("fill", d => {
                    let type = getEntityType(d)
                    if (type == nodeTypes.person) {
                        return PERSON_COLOR
                    } else if (type == nodeTypes.institution) {
                        return INSTITUTION_COLOR
                    } else if (type == nodeTypes.publication) {
                        return PUBLICATION_COLOR
                    }
                })
                .attr("stroke", d => {
                    if (d.selected) return SELECTION_COLOR
                    return ""
                })
                .attr("stroke-width", d => {
                    if (d.selected) return 3
                    return 1
                })
                .style("opacity", d => {
                    return 0.8
                })
                .on("click", (e, d) => {
                    updateNodelinkSelection(d.Name)
                })


            g.append("line")
                .style("stroke", "black")
                .style("stroke-width", "2")
                .attr("x1", d => {
                    return x(getBeginYear(d)) + timeLineWidth(d)
                })
                .attr("y1", (d, i) => y(i))
                .attr("x2", d => {
                    return x(getBeginYear(d)) + timeLineWidth(d)
                })
                .attr("y2", (d, i) => y(i) + y.bandwidth())
                .style("display", (d, i) => {
                    let endYear = getEndYear(d);
                    return endYear ? "" : "none"
                })
            // .style("stroke-dasharray", ("2, 3"))

            g.append("text")
                .attr("x", d => x(getBeginYear(d)) + 5)
                .attr("y", (d, i) => y(i) + y.bandwidth() / 1.1)
                .text(d => d.Name)
                .attr("font-size", "11pt")
                .attr("fill", "white")

            return g
        })

    svg
        .selectAll('.event')
        .data(events)
        .join(enter => {
            let g = enter.append("g")
                .classed("event", true)

            // g.append("line")
            //     .attr("x1", d => x(d.Date))
            //     .attr("x2", d => x(d.Date))
            //     .attr("y1", d => 0)
            //     .attr("y2", d => height)
            //     .attr("stroke", "red")
            //
            // g.append("text")
            //     .attr("x", d => x(d.Date) + 2)
            //     .attr("y", (d, i) => height - i * 100)
            //     .text(d => d.Name)
            //     .style("fill", "red")

            return g
        })
}

function timeLineWidth(d) {
    if (getEndYear(d)) return x(getEndYear(d)) - x(getBeginYear(d))
    return width - margin.left - margin.right - x(getBeginYear(d))
}

function getEntityType(entity) {
    if (persons.includes(entity)) {
        return nodeTypes.person
    } else if (institutions.includes(entity)) {
        return nodeTypes.institution
    } else if (publications.includes(entity)) {
        return nodeTypes.publication
    }
}

export function updateTimeLine(yearMinV, yearMaxV) {
    yearMin = yearMinV
    yearMax = yearMaxV
    render();
}

export function updateTimelineSelection(nodeId) {
    resetSelection();
    entities.forEach(n => {
        if (n.Name == nodeId) {
            n.selected = true;
        }
    })
    render();
}

function resetSelection() {
    entities.forEach(n => {
        n.selected = false;
    })
}

